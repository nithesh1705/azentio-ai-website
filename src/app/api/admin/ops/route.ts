import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getSystemHealth,
  getOutboxItems,
  retryFailedOutboxItems,
  checkWithdrawalPropagationLatency,
} from '@/server/dal/admin/config_ops';
import { approvalsEngine } from '@/server/services/approvals';

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

    if (searchParams.get('checkPropagation') === 'true') {
      const result = checkWithdrawalPropagationLatency(actor);
      return NextResponse.json(result);
    }

    const health = getSystemHealth(actor);
    const outbox = getOutboxItems(actor);

    return NextResponse.json({ health, outbox });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    if (body.action === 'retry_outbox') {
      const result = retryFailedOutboxItems(actor);
      return NextResponse.json(result);
    }

    if (body.action === 'request_seed_reset') {
      // Dual Control Guard for seed reset in governed environments
      const approvalReq = approvalsEngine.createApprovalRequest(
        actor,
        'seed_reset',
        'Database Seed Data Reset to Clean Baseline',
        `Requested full database re-seed and cache purge. Reason: ${body.reason || 'Operational testing clean baseline'}`,
        { reason: body.reason || 'Operational testing clean baseline' },
        [
          { field: 'Database Baseline', before: 'Custom Stored Entities', after: 'Pure Seed State' },
          { field: 'Dual Control', before: 'Required', after: 'Pending Second Admin Approval' },
        ]
      );
      return NextResponse.json({ success: true, pendingApproval: true, approvalId: approvalReq.id });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

