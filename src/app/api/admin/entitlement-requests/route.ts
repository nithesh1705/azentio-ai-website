import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminEntitlementRequests,
  approveEntitlementRequest,
  declineEntitlementRequest,
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

    const requests = getAdminEntitlementRequests(actor, { status });
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { action, requestId, message } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required.' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = approveEntitlementRequest(actor, requestId);
      return NextResponse.json(result);
    }

    if (action === 'decline') {
      const result = declineEntitlementRequest(actor, requestId, message || 'Declined by administrator');
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
