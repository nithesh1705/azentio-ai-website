import { Actor, SupportAuthorisation } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';
import { approvalsEngine } from '@/server/services/approvals';
import { store } from '@/server/dal/store';

// In-memory support authorisations ledger
const INITIAL_SUPPORT_AUTHS: SupportAuthorisation[] = [
  {
    id: 'supp-auth-001',
    orgId: 'org-apex',
    orgName: 'Apex Global Financial Technologies',
    resourceKind: 'contribution',
    resourceId: 'contrib-seed-001',
    reason: 'Investigating customer escalation regarding failed observation schema ingestion.',
    durationHours: 8,
    requestedBy: 'usr-admin-elena',
    requestedByName: 'Elena Rostova',
    requestedAt: '2026-10-30T11:00:00Z',
    approvedBy: 'usr-admin-fernando',
    approvedByName: 'Fernando Alonso',
    approvedAt: '2026-10-30T11:15:00Z',
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'supp-auth-002',
    orgId: 'org-cedar',
    orgName: 'Cedar Capital Holdings',
    resourceKind: 'demo_run',
    resourceId: 'run-seed-002',
    reason: 'Auditing demo sandbox timeout issues encountered during Q3 pilot validation.',
    durationHours: 4,
    requestedBy: 'usr-admin-fernando',
    requestedByName: 'Fernando Alonso',
    requestedAt: '2026-10-25T08:00:00Z',
    approvedBy: 'usr-admin-elena',
    approvedByName: 'Elena Rostova',
    approvedAt: '2026-10-25T08:30:00Z',
    expiresAt: '2026-10-25T12:30:00Z',
    status: 'expired',
  },
];

class SupportStore {
  authorisations: SupportAuthorisation[] = JSON.parse(JSON.stringify(INITIAL_SUPPORT_AUTHS));

  reset() {
    this.authorisations = JSON.parse(JSON.stringify(INITIAL_SUPPORT_AUTHS));
  }
}

export const supportStore = new SupportStore();

function checkPortalAdmin(actor: Actor) {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason || 'Requires portal_admin platform grant.');
  }
}

export function getSupportAuthorisations(actor: Actor): SupportAuthorisation[] {
  checkPortalAdmin(actor);
  const now = new Date().toISOString();

  // Lazily update expired statuses
  return supportStore.authorisations.map((auth) => {
    if (auth.status === 'active' && auth.expiresAt < now) {
      auth.status = 'expired';
    }
    return auth;
  });
}

export function getSupportAuthorisationById(actor: Actor, id: string): SupportAuthorisation | undefined {
  checkPortalAdmin(actor);
  const auths = getSupportAuthorisations(actor);
  return auths.find((a) => a.id === id);
}

export interface RequestSupportAccessInput {
  orgId: string;
  resourceKind: 'contribution' | 'demo_run';
  resourceId: string;
  reason: string;
  durationHours: number;
}

export function requestSupportAccess(
  actor: Actor,
  input: RequestSupportAccessInput
): { success: boolean; approvalRequestId: string } {
  checkPortalAdmin(actor);

  if (!input.reason || input.reason.trim().length < 20) {
    throw new Error('Support access reason must be detailed and at least 20 characters.');
  }

  if (input.durationHours < 1 || input.durationHours > 24) {
    throw new Error('Support access duration must be between 1 and 24 hours.');
  }

  const organisations = (store as any).organisations || [];
  const org = organisations.find((o: any) => o.id === input.orgId);
  const orgName = org?.name || input.orgId;

  // Create dual control approval request
  const approvalReq = approvalsEngine.createApprovalRequest(
    actor,
    'support_access',
    `Support Access: Scoped ${input.resourceKind} for ${orgName}`,
    `Resource ID: ${input.resourceId}. Duration: ${input.durationHours}h. Reason: ${input.reason}`,
    {
      orgId: input.orgId,
      orgName,
      resourceKind: input.resourceKind,
      resourceId: input.resourceId,
      reason: input.reason,
      durationHours: input.durationHours,
    },
    [
      { field: 'Organisation', before: 'None', after: `${orgName} (${input.orgId})` },
      { field: 'Resource Kind', before: 'None', after: input.resourceKind },
      { field: 'Resource ID', before: 'None', after: input.resourceId },
      { field: 'Duration', before: 'None', after: `${input.durationHours} hours` },
      { field: 'Access Mode', before: 'Blocked', after: 'Watermarked Scoped Read-Only' },
    ]
  );

  appendAuditEvent(
    actor,
    'admin.support.requested',
    'approval_request',
    approvalReq.id,
    `Requested dual-control support access for ${input.resourceKind} "${input.resourceId}" belonging to ${orgName}.`
  );

  return {
    success: true,
    approvalRequestId: approvalReq.id,
  };
}

export function approveSupportAccess(
  actor: Actor,
  approvalRequestId: string
): { success: boolean; authorisation: SupportAuthorisation } {
  checkPortalAdmin(actor);

  const approvalResult = approvalsEngine.approveRequest(actor, approvalRequestId);
  if (!approvalResult.success || !approvalResult.request) {
    throw new Error(approvalResult.error || 'Failed to approve support access request.');
  }

  const payload = approvalResult.request.payload;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + payload.durationHours * 60 * 60 * 1000).toISOString();

  const authId = `supp-auth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const authorisation: SupportAuthorisation = {
    id: authId,
    orgId: payload.orgId,
    orgName: payload.orgName,
    resourceKind: payload.resourceKind,
    resourceId: payload.resourceId,
    reason: payload.reason,
    durationHours: payload.durationHours,
    requestedBy: approvalResult.request.requestedBy,
    requestedByName: approvalResult.request.requestedByName,
    requestedAt: approvalResult.request.requestedAt,
    approvedBy: actor.userId,
    approvedByName: actor.name,
    approvedAt: now.toISOString(),
    expiresAt,
    status: 'active',
  };

  supportStore.authorisations.unshift(authorisation);

  appendAuditEvent(
    actor,
    'admin.support.approved',
    'support_authorisation',
    authId,
    `Approved dual-control support access for ${authorisation.resourceKind} "${authorisation.resourceId}" (expires in ${authorisation.durationHours}h).`
  );

  return {
    success: true,
    authorisation,
  };
}

export function revokeSupportAuthorisation(
  actor: Actor,
  id: string,
  reason?: string
): { success: boolean } {
  checkPortalAdmin(actor);

  const auth = supportStore.authorisations.find((a) => a.id === id);
  if (!auth) {
    throw new Error('Support authorisation not found.');
  }

  auth.status = 'revoked';
  auth.revokedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.support.revoked',
    'support_authorisation',
    id,
    `Revoked support authorization early. Reason: ${reason || 'Administrative revocation'}.`
  );

  return { success: true };
}

export function viewSupportResource(
  actor: Actor,
  authorisationId: string
): {
  success: boolean;
  authorisation: SupportAuthorisation;
  resourceData: any;
  watermark: {
    viewer: string;
    timestamp: string;
    ipHash: string;
    authId: string;
  };
} {
  checkPortalAdmin(actor);

  const auth = getSupportAuthorisationById(actor, authorisationId);
  if (!auth) {
    throw new Error('Support authorisation not found.');
  }

  if (auth.status !== 'active') {
    throw new Error(`Support authorisation is no longer active (status: ${auth.status}).`);
  }

  if (new Date().toISOString() > auth.expiresAt) {
    auth.status = 'expired';
    throw new Error('Support authorisation has expired.');
  }

  // Scoped mock resource resolution
  let resourceData: any = null;
  if (auth.resourceKind === 'contribution') {
    // Look up in store contributions or synthesize scoped snapshot
    const contributions = (store as any).contributions || [];
    resourceData =
      contributions.find((c: any) => c.id === auth.resourceId) || {
        id: auth.resourceId,
        title: 'Customer Trade Settled Observation',
        category: 'High Volume Trading',
        description:
          'Private customer trade flow observation submitted for internal optimization testing. Contains scoped non-anonymized execution logs.',
        payloadSnippet: {
          latencyMs: 14.2,
          clusterNode: 'sg-node-04',
          tenantOrg: auth.orgName,
          executionStatus: 'FLAGGED_ANOMALY',
        },
      };
  } else if (auth.resourceKind === 'demo_run') {
    resourceData = {
      id: auth.resourceId,
      scenarioName: 'Enterprise AML Screen High-Frequency',
      orgName: auth.orgName,
      executedAt: '2026-10-29T14:22:00Z',
      inputs: { threshold: 0.95, ruleset: 'MAS-626-Enhanced' },
      executionLogs: [
        '[14:22:01] Initialized session sandbox',
        '[14:22:02] Matching against sanctions list version 2026.10',
        '[14:22:04] Simulation timeout occurred at step 4',
      ],
    };
  }

  const ipHash = 'ip_hash_sha256_' + actor.userId.slice(-6);
  const timestamp = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.support.view_resource',
    'support_authorisation',
    authorisationId,
    `Admin inspected scoped private resource ${auth.resourceKind} "${auth.resourceId}" under authorisation ${authorisationId}.`
  );

  return {
    success: true,
    authorisation: auth,
    resourceData,
    watermark: {
      viewer: actor.name,
      timestamp,
      ipHash,
      authId: authorisationId,
    },
  };
}

