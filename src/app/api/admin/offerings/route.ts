import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminOfferings,
  createAdminOffering,
  updateAdminOffering,
  retireAdminOffering,
} from '@/server/dal/admin/entitlements_offerings';
import { Actor } from '@/types';

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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const actor = getActor(req);

    const offerings = getAdminOfferings(actor, { status });
    return NextResponse.json({ success: true, offerings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    const offering = createAdminOffering(actor, {
      name: body.name,
      category: body.category || 'Banking',
      tagline: body.tagline || '',
      description: body.description || '',
      features: body.features || [],
      sandboxAvailable: body.sandboxAvailable ?? true,
      badge: body.badge,
    });

    return NextResponse.json({ success: true, offering });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { id, ...data } = body;

    const offering = updateAdminOffering(actor, id, data);
    return NextResponse.json({ success: true, offering });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { id, reason } = body;

    const result = retireAdminOffering(actor, id, reason || 'Sunset solution engine');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

