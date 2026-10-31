import { describe, it, expect, beforeEach } from 'vitest';
import { Actor } from '@/types';
import {
  configOpsStore,
  getSystemConfig,
  updateSystemConfig,
  testRegexSensitivity,
  getSystemHealth,
  retryFailedOutboxItems,
  checkWithdrawalPropagationLatency,
} from '../config_ops';
import {
  enquiriesStore,
  getAdminDemoEnquiries,
  updateDemoEnquiryStatus,
  getAdminHackathonRegistrations,
  exportEnquiriesCSV,
} from '../enquiries';

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

describe('Admin Config, Ops Console & Enquiries DAL', () => {
  beforeEach(() => {
    configOpsStore.reset();
    enquiriesStore.reset();
  });

  it('1. Enforces hard invariant on MIN_DISTINCT_ORGS (cannot be set below 3)', () => {
    expect(() => updateSystemConfig(adminActor, { minDistinctOrgs: 2 })).toThrow(
      /MIN_DISTINCT_ORGS invariant violation/
    );
    expect(() => updateSystemConfig(adminActor, { minDistinctOrgs: 0 })).toThrow(
      /MIN_DISTINCT_ORGS invariant violation/
    );

    // Setting >= 3 succeeds
    const res = updateSystemConfig(adminActor, { minDistinctOrgs: 4 });
    expect(res.success).toBe(true);
    expect(res.config.minDistinctOrgs).toBe(4);
  });

  it('2. Evaluates regex sensitivity testing lab patterns accurately', () => {
    const text = 'Contact sarah.jenkins@sc.com with settlement card 4111-2222-3333-4444 under Project-Titan.';
    const results = testRegexSensitivity(adminActor, text);

    const emailPattern = results.find((r) => r.patternName.includes('Email'));
    expect(emailPattern?.matched).toBe(true);
    expect(emailPattern?.matches[0].value).toBe('sarah.jenkins@sc.com');

    const cardPattern = results.find((r) => r.patternName.includes('Credit Card'));
    expect(cardPattern?.matched).toBe(true);
    expect(cardPattern?.matches[0].value).toBe('4111-2222-3333-4444');

    const codenamePattern = results.find((r) => r.patternName.includes('Internal Project Codename'));
    expect(codenamePattern?.matched).toBe(true);
    expect(codenamePattern?.matches[0].value).toBe('Project-Titan');
  });

  it('3. Certifies 60s withdrawal propagation SLA compliance (§17 Acceptance Gate)', () => {
    const check = checkWithdrawalPropagationLatency(adminActor);
    expect(check.success).toBe(true);
    expect(check.slaCompliant).toBe(true);
    expect(check.propagationLatencyMs).toBeLessThan(60000);
    expect(check.message).toContain('verified');
  });

  it('4. Retries failed outbox queue items and recovers delivery state', () => {
    const healthBefore = getSystemHealth(adminActor);
    expect(healthBefore.services.outboxQueue.failed).toBeGreaterThan(0);

    const retryRes = retryFailedOutboxItems(adminActor);
    expect(retryRes.success).toBe(true);
    expect(retryRes.retriedCount).toBeGreaterThan(0);

    const healthAfter = getSystemHealth(adminActor);
    expect(healthAfter.services.outboxQueue.failed).toBe(0);
  });

  it('5. Manages inbound enquiries and exports sanitized CSV reports', () => {
    const demos = getAdminDemoEnquiries(adminActor);
    expect(demos.length).toBeGreaterThan(0);

    const targetId = demos[0].id;
    const updateRes = updateDemoEnquiryStatus(
      adminActor,
      targetId,
      'qualified',
      'Follow-up call completed with positive response.'
    );
    expect(updateRes.success).toBe(true);
    expect(updateRes.enquiry.status).toBe('qualified');
    expect(updateRes.enquiry.notes).toContain('positive response');

    const csvDemos = exportEnquiriesCSV(adminActor, 'demos');
    expect(csvDemos).toContain('Work Email');
    expect(csvDemos).toContain('Company Name');

    const csvHacks = exportEnquiriesCSV(adminActor, 'hackathons');
    expect(csvHacks).toContain('Track');
  });
});
