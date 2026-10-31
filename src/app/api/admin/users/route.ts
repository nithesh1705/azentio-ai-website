import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminUsers,
  inviteAdminUser,
  validateBulkInviteCSV,
  executeBulkInvite,
  suspendAdminUser,
  reactivateAdminUser,
  revokeAdminUserMembership,
  forceSignOutUser,
  requestAnonymiseUser,
  getAdminInvitations,
} from '@/server/dal/admin/users';
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
    const orgId = searchParams.get('orgId') || undefined;
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;
    const view = searchParams.get('view'); // 'users' or 'invitations'

    const actor = getActor(req);

    if (view === 'invitations') {
      const invitations = getAdminInvitations(orgId);
      return NextResponse.json({ success: true, invitations });
    }

    const users = getAdminUsers(actor, { orgId, status, role, search });
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { action } = body;

    if (action === 'single_invite') {
      const invitation = inviteAdminUser(actor, {
        name: body.name,
        email: body.email,
        orgId: body.orgId,
        role: body.role || 'client_member',
      });
      return NextResponse.json({ success: true, invitation });
    }

    if (action === 'validate_bulk') {
      const dryRun = validateBulkInviteCSV(actor, body.csvText || '');
      return NextResponse.json({ success: true, dryRun });
    }

    if (action === 'execute_bulk') {
      const result = executeBulkInvite(actor, body.validRows || []);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'suspend') {
      const user = suspendAdminUser(actor, body.userId, body.reason || 'Admin action');
      return NextResponse.json({ success: true, user });
    }

    if (action === 'reactivate') {
      const user = reactivateAdminUser(actor, body.userId);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'revoke_membership') {
      const user = revokeAdminUserMembership(actor, body.userId, body.orgId);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'force_signout') {
      const result = forceSignOutUser(actor, body.userId);
      return NextResponse.json(result);
    }

    if (action === 'request_anonymise') {
      const approvalReq = requestAnonymiseUser(actor, body.userId, body.reason || 'GDPR Right to Be Forgotten');
      return NextResponse.json({ success: true, approvalRequest: approvalReq });
    }

    return NextResponse.json({ success: false, error: 'Unknown user action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
