import { NextRequest, NextResponse } from 'next/server';
import { approvalsEngine } from '@/server/services/approvals';
import { Actor } from '@/types';
import { appendAuditEvent } from '@/server/services/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const actionType = searchParams.get('actionType') as any;

    const requests = approvalsEngine.getApprovalRequests({
      status: status || undefined,
      actionType: actionType || undefined,
    });

    const pendingCount = approvalsEngine.getApprovalRequests({ status: 'pending' }).length;

    return NextResponse.json({ success: true, requests, pendingCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, reason, actor } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });
    }

    const currentActor: Actor = actor || {
      userId: 'usr-admin-max',
      name: 'Max Verstappen',
      email: 'max_verstappen@azentio.com',
      platformGrants: ['portal_admin'],
      memberships: [],
      activeTenantId: null,
      isVerifiedEmployee: true,
    };

    if (action === 'approve') {
      const result = approvalsEngine.approveRequest(currentActor, id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      appendAuditEvent(
        currentActor,
        'dual_control.approve',
        'approval_request',
        id,
        `Approved dual-control action ${result.request?.actionType}: ${result.request?.title}`
      );

      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'reject') {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json({ success: false, error: 'Rejection reason must be at least 5 characters.' }, { status: 400 });
      }

      const result = approvalsEngine.rejectRequest(currentActor, id, reason);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      appendAuditEvent(
        currentActor,
        'dual_control.reject',
        'approval_request',
        id,
        `Rejected dual-control action ${result.request?.actionType}. Reason: ${reason}`
      );

      return NextResponse.json({ success: true, request: result.request });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

