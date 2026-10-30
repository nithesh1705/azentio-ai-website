import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOrgOverview,
  requestEntitlement,
  getOrgObservationsOversight,
  adminWithdrawOrgObservation,
} from '../admin';
import { createObservationDraft, submitObservation } from '../observations';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Admin Org Overview & Oversight DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const adminActor: Actor = {
    userId: 'usr-client-dhoni',
    email: 'dhoni.ms@xyz.com',
    name: 'MS Dhoni',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [{ orgId: 'org-xyz', role: 'client_admin', status: 'active' }],
    platformGrants: [],
  };

  const memberActor: Actor = {
    userId: 'usr-client-hardik',
    email: 'hardik.pandya@xyz.com',
    name: 'Hardik Pandya',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [{ orgId: 'org-xyz', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  it('retrieves organisation overview with entitled and unentitled solutions', () => {
    const overview = getOrgOverview(adminActor);

    expect(overview.tenant.id).toBe('org-xyz');
    expect(overview.entitledOfferings.length).toBeGreaterThan(0);
    expect(overview.unentitledOfferings.length).toBeGreaterThan(0);
    expect(overview.memberCount).toBeGreaterThan(0);
    expect(overview.adminCount).toBe(1);
  });

  it('submits a solution entitlement request and logs audit', () => {
    const req = requestEntitlement(adminActor, {
      offeringId: 'offering-cbe',
      businessJustification: 'Evaluating overnight retail ledger settlement performance.',
    });

    expect(req.id).toBeDefined();
    expect(req.offeringId).toBe('offering-cbe');
    expect(req.status).toBe('pending');

    const overview = getOrgOverview(adminActor);
    expect(overview.recentRequests.some((r) => r.id === req.id)).toBe(true);
  });

  it('protects privacy boundary: oversight strictly excludes private drafts and private-to-author notes', () => {
    // 1. Hardik creates a draft marked within_organisation
    const draft = createObservationDraft(memberActor, {
      title: 'Draft Observation',
      body: 'Work in progress',
      offeringId: 'offering-fai',
      industry: 'Banking',
      region: 'Southeast Asia',
      observationPeriod: '2026-Q1',
      evidenceType: 'Production Telemetry',
      confidence: 'Medium',
      visibilityChoice: 'within_organisation',
      consents: {
        consent_process: true,
        consent_publish: true,
        consent_attribution: false,
        consent_training: false,
      },
    });

    // 2. Hardik creates a private_to_author submitted observation
    const privateObs = createObservationDraft(
      memberActor,
      {
        title: 'Private to Author Note',
        body: 'Confidential personal note',
        offeringId: 'offering-fai',
        industry: 'Banking',
        region: 'Southeast Asia',
        observationPeriod: '2026-Q1',
        evidenceType: 'Production Telemetry',
        confidence: 'Medium',
        visibilityChoice: 'private_to_author',
        consents: {
          consent_process: true,
          consent_publish: false,
          consent_attribution: false,
          consent_training: false,
        },
      },
      true // autoSubmit
    );

    // 3. Hardik creates and submits an org-visible observation
    const orgObs = createObservationDraft(
      memberActor,
      {
        title: 'Team Shared Pattern',
        body: 'Safe to share with team and moderators',
        offeringId: 'offering-fai',
        industry: 'Banking',
        region: 'Southeast Asia',
        observationPeriod: '2026-Q1',
        evidenceType: 'Production Telemetry',
        confidence: 'High',
        visibilityChoice: 'within_organisation',
        consents: {
          consent_process: true,
          consent_publish: true,
          consent_attribution: false,
          consent_training: false,
        },
      },
      true // autoSubmit
    );

    // Oversight check by Admin
    const oversight = getOrgObservationsOversight(adminActor);

    // Invariant: Draft must NOT be visible
    expect(oversight.some((c) => c.id === draft.id)).toBe(false);

    // Invariant: Private to author must NOT be visible
    expect(oversight.some((c) => c.id === privateObs.id)).toBe(false);

    // Org-shared submitted item MUST be visible
    expect(oversight.some((c) => c.id === orgObs.id)).toBe(true);
  });

  it('allows admin to withdraw an org-level shared item and notifies author', () => {
    const orgObs = createObservationDraft(
      memberActor,
      {
        title: 'Team Shared Observation for Withdrawal Test',
        body: 'Disclosed non-compliant volume metrics.',
        offeringId: 'offering-fai',
        industry: 'Banking',
        region: 'Southeast Asia',
        observationPeriod: '2026-Q1',
        evidenceType: 'Production Telemetry',
        confidence: 'High',
        visibilityChoice: 'within_organisation',
        consents: {
          consent_process: true,
          consent_publish: true,
          consent_attribution: false,
          consent_training: false,
        },
      },
      true
    );

    const withdrawn = adminWithdrawOrgObservation(
      adminActor,
      orgObs.id,
      'Internal policy violation: non-compliant volume figures.'
    );

    expect(withdrawn.currentState).toBe('Withdrawn');

    // Author received notification
    const authorNotif = store.notifications.find((n) => n.userId === memberActor.userId);
    expect(authorNotif).toBeDefined();
    expect(authorNotif?.title).toContain('Withdrawn by Org Administrator');

    // Audit log recorded
    const audit = store.auditEvents.find((a) => a.action === 'admin_withdraw_observation');
    expect(audit).toBeDefined();
    expect(audit?.resourceId).toBe(orgObs.id);
  });
});
