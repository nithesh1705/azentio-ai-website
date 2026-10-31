import { describe, it, expect, beforeEach } from 'vitest';
import { Actor } from '@/types';
import {
  supportStore,
  getSupportAuthorisations,
  getSupportAuthorisationById,
  requestSupportAccess,
  approveSupportAccess,
  revokeSupportAuthorisation,
  viewSupportResource,
} from '../support';
import { approvalsEngine } from '@/server/services/approvals';

const adminRequester: Actor = {
  userId: 'usr-admin-elena',
  name: 'Elena Rostova',
  isVerifiedEmployee: true,
  email: 'elena.rostova@azentio.com',
  platformGrants: ['portal_admin'],
  memberships: [],
  activeTenantId: null,
};

const adminApprover: Actor = {
  userId: 'usr-admin-fernando',
  name: 'Fernando Alonso',
  isVerifiedEmployee: true,
  email: 'fernando.alonso@azentio.com',
  platformGrants: ['portal_admin'],
  memberships: [],
  activeTenantId: null,
};

const clientActor: Actor = {
  userId: 'usr-client-001',
  name: 'Client Member',
  isVerifiedEmployee: false,
  email: 'client@apex.com',
  platformGrants: [],
  memberships: [{ orgId: 'org-apex', role: 'client_member', status: 'active' }],
  activeTenantId: 'org-apex',
};

describe('Admin Support Access & Dual-Control Approvals DAL', () => {
  beforeEach(() => {
    supportStore.reset();
    approvalsEngine.reset();
  });

  it('1. Requires portal_admin grant to query support authorisations', () => {
    expect(() => getSupportAuthorisations(clientActor)).toThrow(/verified employee|portal_admin/i);

    const auths = getSupportAuthorisations(adminRequester);
    expect(auths.length).toBeGreaterThan(0);
  });

  it('2. Enforces validation rules on support access requests', () => {
    // Reason too short
    expect(() =>
      requestSupportAccess(adminRequester, {
        orgId: 'org-apex',
        resourceKind: 'contribution',
        resourceId: 'contrib-seed-001',
        reason: 'Too short',
        durationHours: 4,
      })
    ).toThrow(/at least 20 characters/);

    // Duration out of bounds
    expect(() =>
      requestSupportAccess(adminRequester, {
        orgId: 'org-apex',
        resourceKind: 'contribution',
        resourceId: 'contrib-seed-001',
        reason: 'Valid detailed reason for customer escalation testing',
        durationHours: 48,
      })
    ).toThrow(/between 1 and 24 hours/);

    // Valid request succeeds and creates dual control request
    const res = requestSupportAccess(adminRequester, {
      orgId: 'org-apex',
      resourceKind: 'contribution',
      resourceId: 'contrib-seed-001',
      reason: 'Valid detailed customer escalation ticket MAS-9902 inspection',
      durationHours: 6,
    });

    expect(res.success).toBe(true);
    expect(res.approvalRequestId).toBeDefined();
  });

  it('3. Strictly forbids self-approval of support access (Dual Control Invariant)', () => {
    const res = requestSupportAccess(adminRequester, {
      orgId: 'org-apex',
      resourceKind: 'contribution',
      resourceId: 'contrib-seed-001',
      reason: 'Valid detailed customer escalation ticket MAS-9902 inspection',
      durationHours: 6,
    });

    // Requester attempting to approve their own request MUST fail
    expect(() => approveSupportAccess(adminRequester, res.approvalRequestId)).toThrow(
      /Dual control violation/
    );

    // Second administrator CAN approve
    const approval = approveSupportAccess(adminApprover, res.approvalRequestId);
    expect(approval.success).toBe(true);
    expect(approval.authorisation.status).toBe('active');
    expect(approval.authorisation.approvedBy).toBe(adminApprover.userId);
  });

  it('4. Provides watermarked scoped data inspection and prevents access once revoked', () => {
    const res = requestSupportAccess(adminRequester, {
      orgId: 'org-apex',
      resourceKind: 'demo_run',
      resourceId: 'run-seed-002',
      reason: 'Reviewing sandbox run execution logs for timeout investigation',
      durationHours: 2,
    });

    const approval = approveSupportAccess(adminApprover, res.approvalRequestId);
    const authId = approval.authorisation.id;

    // View watermarked resource
    const viewerResult = viewSupportResource(adminRequester, authId);
    expect(viewerResult.success).toBe(true);
    expect(viewerResult.resourceData).toBeDefined();
    expect(viewerResult.watermark.viewer).toBe(adminRequester.name);
    expect(viewerResult.watermark.ipHash).toContain('ip_hash_sha256');

    // Revoke authorization early
    const revokeRes = revokeSupportAuthorisation(adminRequester, authId, 'Session complete');
    expect(revokeRes.success).toBe(true);

    // Subsequent access attempts MUST fail
    expect(() => viewSupportResource(adminRequester, authId)).toThrow(/no longer active/);
  });
});

