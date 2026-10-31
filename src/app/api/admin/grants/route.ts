import { NextRequest, NextResponse } from 'next/server';
import {
  getEmployeeAllowlist,
  addEmployeeToAllowlist,
  validateBulkEmployeeAllowlist,
  executeBulkEmployeeAllowlist,
  getPlatformGrants,
  assignPlatformGrant,
  revokePlatformGrant,
} from '@/server/dal/admin/grants';
import { Actor, PlatformGrant } from '@/types';

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
    const view = searchParams.get('view') || 'grants';
    const grant = searchParams.get('grant') as PlatformGrant | undefined;
    const status = searchParams.get('status') as any;

    const actor = getActor(req);

    if (view === 'allowlist') {
      const allowlist = getEmployeeAllowlist(actor);
      return NextResponse.json({ success: true, allowlist });
    }

    const grants = getPlatformGrants(actor, { grant, status });
    return NextResponse.json({ success: true, grants });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { action } = body;

    if (action === 'add_allowlist') {
      const entry = addEmployeeToAllowlist(actor, {
        email: body.email,
        name: body.name,
        department: body.department,
        title: body.title,
      });
      return NextResponse.json({ success: true, entry });
    }

    if (action === 'validate_bulk_allowlist') {
      const dryRun = validateBulkEmployeeAllowlist(actor, body.csvText || '');
      return NextResponse.json({ success: true, dryRun });
    }

    if (action === 'execute_bulk_allowlist') {
      const result = executeBulkEmployeeAllowlist(actor, body.validRows || []);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'assign_grant') {
      const result = assignPlatformGrant(
        actor,
        body.targetUserId,
        body.grant,
        body.reason,
        body.skipStepup || false
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'revoke_grant') {
      const result = revokePlatformGrant(actor, body.grantRecordId, body.reason || 'Admin revocation');
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Unknown grant action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
