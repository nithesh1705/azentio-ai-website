import { Actor, ApprovalActionType, ApprovalRequest } from '@/types';

// In-memory dual-control approval requests ledger
const initialApprovals: ApprovalRequest[] = [
  {
    id: 'appr-demo-001',
    actionType: 'broadcast_all_clients',
    title: 'Emergency Maintenance Advisory Broadcast',
    description: 'Quarterly database optimization window broadcast to all tenant organisations.',
    requestedBy: 'usr-admin-fernando',
    requestedByName: 'Fernando Alonso',
    requestedAt: '2026-10-30T10:00:00Z',
    expiresAt: '2026-11-02T10:00:00Z',
    status: 'pending',
    payload: {
      scope: 'all_clients',
      severity: 'warning',
      subject: 'Scheduled Maintenance Advisory: Nov 2, 2026',
      recipientCount: 420,
    },
    diffSummary: [
      { field: 'Recipients', before: 'None', after: 'All Active Clients (420)' },
      { field: 'Downtime SLA', before: '0 min', after: '15 min maintenance window' },
    ],
  },
  {
    id: 'appr-demo-002',
    actionType: 'archive_organisation',
    title: 'Archive Decommissioned Tenant (Cedar Capital)',
    description: 'Transition tenant status to archived per contract termination checklist.',
    requestedBy: 'usr-admin-fernando',
    requestedByName: 'Fernando Alonso',
    requestedAt: '2026-10-30T14:30:00Z',
    expiresAt: '2026-11-02T14:30:00Z',
    status: 'pending',
    payload: {
      orgId: 'org-cedar',
      orgName: 'Cedar Capital',
      reason: 'Contractual sunset completed on Oct 30, 2026',
    },
    diffSummary: [
      { field: 'Status', before: 'Standard (Active)', after: 'Archived (Read-only historical)' },
    ],
  },
];

class ApprovalsEngine {
  private requests: ApprovalRequest[] = JSON.parse(JSON.stringify(initialApprovals));

  reset() {
    this.requests = JSON.parse(JSON.stringify(initialApprovals));
  }

  createApprovalRequest(
    actor: Actor,
    actionType: ApprovalActionType,
    title: string,
    description: string,
    payload: Record<string, any>,
    diffSummary?: { field: string; before: string; after: string }[]
  ): ApprovalRequest {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(); // 72 hour validity

    const req: ApprovalRequest = {
      id: `appr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionType,
      title,
      description,
      requestedBy: actor.userId,
      requestedByName: actor.name,
      requestedAt: now.toISOString(),
      expiresAt,
      status: 'pending',
      payload,
      diffSummary,
    };

    this.requests.unshift(req);
    return req;
  }

  getApprovalRequests(filter?: {
    status?: ApprovalRequest['status'];
    actionType?: ApprovalActionType;
  }): ApprovalRequest[] {
    const now = new Date().toISOString();
    return this.requests
      .map((r) => {
        // Automatically expire requests older than 72 hours
        if (r.status === 'pending' && r.expiresAt < now) {
          return { ...r, status: 'expired' as const };
        }
        return r;
      })
      .filter((r) => {
        if (filter?.status && r.status !== filter.status) return false;
        if (filter?.actionType && r.actionType !== filter.actionType) return false;
        return true;
      });
  }

  getApprovalRequestById(id: string): ApprovalRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  approveRequest(actor: Actor, id: string): { success: boolean; request?: ApprovalRequest; error?: string } {
    const req = this.requests.find((r) => r.id === id);
    if (!req) {
      return { success: false, error: 'Approval request not found.' };
    }

    if (req.status !== 'pending') {
      return { success: false, error: `Request cannot be approved because it is already ${req.status}.` };
    }

    if (new Date().toISOString() > req.expiresAt) {
      req.status = 'expired';
      return { success: false, error: 'Approval request has expired (72h limit).' };
    }

    // STRICT DUAL CONTROL INVARIANT: User cannot approve their own request!
    if (req.requestedBy === actor.userId) {
      throw new Error('Dual control violation: You cannot approve your own request. A second administrator must review and approve.');
    }

    req.status = 'approved';
    req.approvedBy = actor.userId;
    req.approvedByName = actor.name;
    req.approvedAt = new Date().toISOString();

    return { success: true, request: req };
  }

  rejectRequest(actor: Actor, id: string, reason: string): { success: boolean; request?: ApprovalRequest; error?: string } {
    const req = this.requests.find((r) => r.id === id);
    if (!req) {
      return { success: false, error: 'Approval request not found.' };
    }

    if (req.status !== 'pending') {
      return { success: false, error: `Request cannot be rejected because it is already ${req.status}.` };
    }

    // STRICT DUAL CONTROL INVARIANT
    if (req.requestedBy === actor.userId) {
      throw new Error('Dual control violation: You cannot review your own request.');
    }

    req.status = 'rejected';
    req.approvedBy = actor.userId;
    req.approvedByName = actor.name;
    req.rejectionReason = reason;
    req.approvedAt = new Date().toISOString();

    return { success: true, request: req };
  }
}

export const approvalsEngine = new ApprovalsEngine();

