import { describe, it, expect, beforeEach } from 'vitest';
import { Actor, AuditEvent } from '@/types';
import {
  getAdminAuditEvents,
  getAdminAuditEventById,
  verifyAdminAuditChain,
  exportAuditTrail,
} from '../audit';
import {
  appendAuditEvent,
  verifyAuditChain,
  computeAuditHash,
} from '@/server/services/audit';
import {
  requestStepup,
  verifyStepup,
  isStepupValid,
  clearStepup,
} from '@/server/services/stepup';
import { store } from '@/server/dal/store';

const adminActor: Actor = {
  userId: 'usr-admin-elena',
  name: 'Elena Rostova',
  isVerifiedEmployee: true,
  email: 'elena.rostova@azentio.com',
  platformGrants: ['portal_admin'],
  memberships: [],
  activeTenantId: null,
};

const clientActor: Actor = {
  userId: 'usr-client-001',
  name: 'Client User',
  isVerifiedEmployee: false,
  email: 'client@apex.com',
  platformGrants: [],
  memberships: [{ orgId: 'org-apex', role: 'client_member', status: 'active' }],
  activeTenantId: 'org-apex',
};

describe('Admin Immutable Audit Ledger & Hash-Chain DAL', () => {
  beforeEach(() => {
    clearStepup(adminActor.userId);
  });

  it('1. Requires portal_admin grant to access audit ledger', () => {
    expect(() => getAdminAuditEvents(clientActor)).toThrow(/verified employee|portal_admin/i);
    expect(() => verifyAdminAuditChain(clientActor)).toThrow(/verified employee|portal_admin/i);

    const events = getAdminAuditEvents(adminActor);
    expect(events.length).toBeGreaterThan(0);
  });

  it('2. Filters audit events by action and search term', () => {
    // Append a distinct test event
    appendAuditEvent(
      adminActor,
      'admin.test.sample_action',
      'test_resource',
      'res-12345',
      'Test audit event for filtering verification.'
    );

    const filtered = getAdminAuditEvents(adminActor, { action: 'admin.test.sample_action' });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].action).toBe('admin.test.sample_action');

    const searchMatch = getAdminAuditEvents(adminActor, { search: 'res-12345' });
    expect(searchMatch.length).toBeGreaterThan(0);
    expect(searchMatch[0].resourceId).toBe('res-12345');
  });

  it('3. Successfully verifies unbroken cryptographic hash chain', () => {
    const verification = verifyAdminAuditChain(adminActor);
    expect(verification.valid).toBe(true);
    expect(verification.totalEvents).toBeGreaterThan(0);
    expect(verification.message).toContain('intact');
  });

  it('4. Detects tampering and flags broken chain if ledger data is modified', () => {
    // Create a local copy of events to simulate tampering
    const tamperedEvents: AuditEvent[] = JSON.parse(JSON.stringify(store.auditEvents));

    // Tamper with the details of an event
    if (tamperedEvents.length > 1) {
      tamperedEvents[0].details = 'MALICIOUS_TAMPERED_CONTENT';
      const checkResult = verifyAuditChain(tamperedEvents);
      expect(checkResult.valid).toBe(false);
      expect(checkResult.message).toMatch(/Hash mismatch|Broken chain/);
    }
  });

  it('5. Enforces step-up authentication before exporting audit records', () => {
    // Without step-up, export MUST fail
    expect(() => exportAuditTrail(adminActor, 'csv')).toThrow(/Step-up verification required/);

    // Perform step-up verification for Elena
    const stepupReq = requestStepup(adminActor.userId, 'export audit ledger');
    const verifyRes = verifyStepup(adminActor.userId, stepupReq.code);
    expect(verifyRes.success).toBe(true);
    expect(isStepupValid(adminActor.userId)).toBe(true);

    // Now export succeeds
    const csvData = exportAuditTrail(adminActor, 'csv');
    expect(csvData).toContain('Timestamp (UTC)');
    expect(csvData).toContain('SHA-256 Hash');

    const jsonData = exportAuditTrail(adminActor, 'json');
    const parsed = JSON.parse(jsonData);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });
});
