import { describe, it, expect, beforeEach } from 'vitest';
import { requestStepup, verifyStepup, isStepupValid, clearStepup } from '../stepup';
import { approvalsEngine } from '../approvals';
import { appendAuditEvent, verifyAuditChain, computeAuditHash, GENESIS_HASH } from '../audit';
import { Actor } from '@/types';
import { store } from '@/server/dal/store';

describe('Admin Core Security Services', () => {
  const adminMax: Actor = {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  const adminFernando: Actor = {
    userId: 'usr-admin-fernando',
    name: 'Fernando Alonso',
    email: 'fernando_alonso@azentio.com',
    platformGrants: ['portal_admin'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  beforeEach(() => {
    approvalsEngine.reset();
    clearStepup(adminMax.userId);
    clearStepup(adminFernando.userId);
  });

  describe('1. Step-Up Verification Service', () => {
    it('Requires verification and validates correct OTP code', () => {
      expect(isStepupValid(adminMax.userId)).toBe(false);

      const challenge = requestStepup(adminMax.userId, 'Suspend Organisation');
      expect(challenge.code).toBe('123456');

      const failedResult = verifyStepup(adminMax.userId, '999999');
      expect(failedResult.success).toBe(false);
      expect(failedResult.error).toMatch(/Invalid verification code/);
      expect(isStepupValid(adminMax.userId)).toBe(false);

      const successResult = verifyStepup(adminMax.userId, '123456');
      expect(successResult.success).toBe(true);
      expect(isStepupValid(adminMax.userId)).toBe(true);
    });

    it('Allows clearing step-up clearance after sensitive operation', () => {
      requestStepup(adminMax.userId, 'Audit Export');
      verifyStepup(adminMax.userId, '123456');
      expect(isStepupValid(adminMax.userId)).toBe(true);

      clearStepup(adminMax.userId);
      expect(isStepupValid(adminMax.userId)).toBe(false);
    });
  });

  describe('2. Dual Control Approvals Engine', () => {
    it('Enforces dual control: Prevents self-approval of requests', () => {
      const req = approvalsEngine.createApprovalRequest(
        adminMax,
        'grant_portal_admin',
        'Grant Portal Admin to New Hire',
        'Promotion request for Platform Ops Engineer',
        { targetUserId: 'usr-new' }
      );

      expect(req.status).toBe('pending');

      // Attempting to self-approve MUST THROW
      expect(() => {
        approvalsEngine.approveRequest(adminMax, req.id);
      }).toThrow(/Dual control violation: You cannot approve your own request/);

      // Status remains pending
      const check = approvalsEngine.getApprovalRequestById(req.id);
      expect(check?.status).toBe('pending');
    });

    it('Allows second independent administrator to approve request', () => {
      const req = approvalsEngine.createApprovalRequest(
        adminMax,
        'broadcast_all_clients',
        'Maintenance Alert',
        'Broadcast to all tenant workspaces',
        { recipientCount: 350 }
      );

      const approvalResult = approvalsEngine.approveRequest(adminFernando, req.id);
      expect(approvalResult.success).toBe(true);
      expect(approvalResult.request?.status).toBe('approved');
      expect(approvalResult.request?.approvedBy).toBe(adminFernando.userId);
    });

    it('Allows rejection with mandatory explanation', () => {
      const req = approvalsEngine.createApprovalRequest(
        adminMax,
        'archive_organisation',
        'Archive Inactive Org',
        'Sunset tenant abcd.in',
        { orgId: 'org-abcd' }
      );

      const rejectionResult = approvalsEngine.rejectRequest(
        adminFernando,
        req.id,
        'Client has renewed annual enterprise contract.'
      );
      expect(rejectionResult.success).toBe(true);
      expect(rejectionResult.request?.status).toBe('rejected');
      expect(rejectionResult.request?.rejectionReason).toBe('Client has renewed annual enterprise contract.');
    });
  });

  describe('3. Cryptographic Hash-Chain Audit Ledger', () => {
    it('Appends hash-chained audit events and verifies chain integrity', () => {
      const event1 = appendAuditEvent(
        adminMax,
        'admin.org.suspend',
        'org',
        'org-cedar',
        'Suspended for payment default'
      );
      expect(event1.hash).toBeDefined();
      expect(event1.prevHash).toBeDefined();

      const event2 = appendAuditEvent(
        adminFernando,
        'admin.grant.assign',
        'grant',
        'usr-mod-pranika',
        'Assigned learning_moderator grant'
      );
      expect(event2.prevHash).toBe(event1.hash);

      const verification = verifyAuditChain(store.auditEvents);
      expect(verification.valid).toBe(true);
      expect(verification.message).toMatch(/Cryptographic audit chain intact/);
    });

    it('Detects tampering if an audit record in the chain is modified', () => {
      // Append two events
      appendAuditEvent(adminMax, 'test.action.1', 'test', 'id-1', 'details 1');
      appendAuditEvent(adminMax, 'test.action.2', 'test', 'id-2', 'details 2');

      // Tamper with the details of the most recent event
      const originalDetails = store.auditEvents[0].details;
      store.auditEvents[0].details = 'TAMPERED: Details altered by unauthorized actor';

      const verification = verifyAuditChain(store.auditEvents);
      expect(verification.valid).toBe(false);
      expect(verification.message).toMatch(/Hash mismatch/);

      // Restore original
      store.auditEvents[0].details = originalDetails;
      expect(verifyAuditChain(store.auditEvents).valid).toBe(true);
    });
  });
});

