import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/server/policy/authorize';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Resolve actor from headers or session context
  const authHeader = request.headers.get('x-persona-employee');
  const userIdHeader = request.headers.get('x-user-id');

  let actor: Actor | null = null;

  if (userIdHeader) {
    const user = store.users.find((u) => u.id === userIdHeader);
    if (user) {
      actor = {
        userId: user.id,
        name: user.name,
        email: user.email,
        platformGrants: user.platformGrants || [],
        memberships: user.memberships || [],
        activeTenantId: user.orgId === 'org-azentio' ? null : user.orgId,
        isVerifiedEmployee: user.isVerifiedEmployee,
        avatar: user.avatar,
      };
    }
  }

  // Fallback to employee simulation if persona header set
  if (!actor && authHeader === 'true') {
    const defaultEmployee = store.users.find((u) => u.isVerifiedEmployee);
    if (defaultEmployee) {
      actor = {
        userId: defaultEmployee.id,
        name: defaultEmployee.name,
        email: defaultEmployee.email,
        platformGrants: defaultEmployee.platformGrants || [],
        memberships: defaultEmployee.memberships || [],
        activeTenantId: null,
        isVerifiedEmployee: true,
      };
    }
  }

  // Deny by default: require verified employee identity
  if (!actor || !actor.isVerifiedEmployee) {
    return NextResponse.json(
      { error: 'Forbidden: Access restricted to verified Azentio employees' },
      { status: 403 }
    );
  }

  // Authorize media read with deny-by-default
  const decision = authorize(actor, 'read', {
    kind: 'media',
    audience: 'employee',
    id,
  });

  if (!decision.allow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Return protected media stream descriptor (never leak raw bucket credentials)
  const streamPayload = {
    mediaId: id,
    format: 'mp4',
    resolution: '1080p',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audience: 'employee',
    accessedBy: actor.email,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(streamPayload, {
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
