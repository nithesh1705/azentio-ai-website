import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getSupportAuthorisations,
  getSupportAuthorisationById,
  requestSupportAccess,
  approveSupportAccess,
  revokeSupportAuthorisation,
  viewSupportResource,
} from '@/server/dal/admin/support';

function getActor(req: NextRequest, body?: any): Actor {
  if (body?.actor) return body.actor;
  return {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };
}

export async function GET(req: NextRequest) {
  try {
    const actor = getActor(req);
    const searchParams = req.nextUrl.searchParams;

    if (searchParams.get('view') === 'true' && searchParams.get('authId')) {
      const authId = searchParams.get('authId')!;
      const result = viewSupportResource(actor, authId);
      return NextResponse.json(result);
    }

    if (searchParams.get('id')) {
      const auth = getSupportAuthorisationById(actor, searchParams.get('id')!);
      return NextResponse.json({ authorisation: auth });
    }

    const authorisations = getSupportAuthorisations(actor);
    return NextResponse.json({ authorisations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    if (body.action === 'request') {
      const result = requestSupportAccess(actor, {
        orgId: body.orgId,
        resourceKind: body.resourceKind,
        resourceId: body.resourceId,
        reason: body.reason,
        durationHours: Number(body.durationHours || 4),
      });
      return NextResponse.json(result);
    }

    if (body.action === 'approve') {
      const result = approveSupportAccess(actor, body.approvalRequestId);
      return NextResponse.json(result);
    }

    if (body.action === 'revoke') {
      const result = revokeSupportAuthorisation(actor, body.id, body.reason);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

