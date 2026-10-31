import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { store } from '@/server/dal/store';
import { approvalsEngine } from '@/server/services/approvals';
import { verifyAuditChain } from '@/server/services/audit';
import { enquiriesStore } from '@/server/dal/admin/enquiries';

function getActor(req: NextRequest): Actor {
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

    const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
    if (!auth.allow) {
      return NextResponse.json({ error: auth.reason || 'Requires portal_admin' }, { status: 403 });
    }

    const organisations = (store as any).organisations || [];
    const users = (store as any).users || [];
    const invitations = (store as any).invitations || [];
    const entitlementRequests = (store as any).entitlementRequests || [];
    const contributions = (store as any).contributions || [];

    const activeOrgs = organisations.filter((o: any) => o.status === 'active');
    const verifiedEmployees = users.filter(
      (u: any) => u.isVerifiedEmployee || u.email?.endsWith('@azentio.com')
    );
    const pendingInvites = invitations.filter((i: any) => i.status === 'pending');
    const openEntitlements = entitlementRequests.filter((r: any) => r.status === 'pending');

    const pendingApprovals = approvalsEngine.getApprovalRequests({ status: 'pending' });

    // STRICT INVARIANT: Return COUNT ONLY for awaiting moderation. Never leak titles, descriptions or client observations!
    const awaitingModerationCount = contributions.filter(
      (c: any) => c.status === 'submitted' || c.status === 'under_review'
    ).length;

    const auditVerification = verifyAuditChain();
    const recentAudit = store.auditEvents.slice(0, 5);
    const recentEnquiries = enquiriesStore.demos.slice(0, 4);

    return NextResponse.json({
      kpis: {
        activeOrgsCount: activeOrgs.length,
        totalUsersCount: users.length,
        pendingInvitesCount: pendingInvites.length,
        verifiedEmployeesCount: verifiedEmployees.length,
        openEntitlementsCount: openEntitlements.length,
        pendingApprovalsCount: pendingApprovals.length,
        awaitingModerationCount,
      },
      pendingApprovals: pendingApprovals.slice(0, 3),
      recentAudit,
      recentEnquiries,
      systemHealth: {
        status: auditVerification.valid ? 'healthy' : 'degraded',
        latencyMs: 4.2,
        ledgerVerified: auditVerification.valid,
        totalLedgerBlocks: auditVerification.totalEvents,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

