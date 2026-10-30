import { describe, it, expect, beforeEach } from 'vitest';
import {
  createObservationDraft,
  getClientObservations,
  getClientObservationById,
  submitObservation,
  withdrawObservation,
} from '../observations';
import { transition } from '../state_machine';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Observations & State Machine DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const authorActor: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  const colleagueActor: Actor = {
    userId: 'usr-client-rohit',
    email: 'rohit@abcd.in',
    name: 'Rohit Sharma',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  const moderatorActor: Actor = {
    userId: 'usr-mod-pranika',
    email: 'pranika_k@azentio.com',
    name: 'Pranika K',
    isVerifiedEmployee: true,
    activeTenantId: 'org-azentio',
    memberships: [],
    platformGrants: ['learning_moderator'],
  };

  it('runs sensitivity scanner and defaults training consent to OFF', () => {
    const obs = createObservationDraft(authorActor, {
      title: 'Suspicious Wire Pattern from CFO john.doe@bank.com',
      body: 'Detected transfers of $500k into account 123456789012 with confidential NDA terms.',
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
    });

    expect(obs.currentState).toBe('Draft');
    expect(obs.sensitivityFlags.length).toBeGreaterThanOrEqual(2);
    expect(obs.consents.consent_training).toBe(false);
    expect(obs.consents.consent_process).toBe(true);
  });

  it('enforces that private drafts are invisible to other colleagues in the same tenant', () => {
    const draft = createObservationDraft(authorActor, {
      title: 'Private Test Observation Draft',
      body: 'Draft body not ready for team eyes.',
      offeringId: 'offering-fai',
      industry: 'Banking',
      region: 'Southeast Asia',
      observationPeriod: '2026-Q1',
      evidenceType: 'Production Telemetry',
      confidence: 'Medium',
      visibilityChoice: 'within_organisation',
      consents: {
        consent_process: true,
        consent_publish: false,
        consent_attribution: false,
        consent_training: false,
      },
    });

    // Author sees their draft in 'mine'
    const authorMine = getClientObservations(authorActor, 'mine');
    expect(authorMine.some((c) => c.id === draft.id)).toBe(true);

    // Colleague DOES NOT see author's draft in 'org' tab
    const colleagueOrg = getClientObservations(colleagueActor, 'org');
    expect(colleagueOrg.some((c) => c.id === draft.id)).toBe(false);

    // Direct access to draft by ID is denied
    expect(() => getClientObservationById(colleagueActor, draft.id)).toThrow(/access denied/i);
  });

  it('exercises full contribution state machine lifecycle: submit -> claim -> request_clarification -> amend_resubmit -> withdraw', () => {
    const draft = createObservationDraft(authorActor, {
      title: 'Seasonal Anomaly in Trade LC Cycle',
      body: 'Verified discrepancy in port turnaround times.',
      offeringId: 'offering-fai',
      industry: 'Trade Finance',
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
    });

    // Author submits
    const submitted = submitObservation(authorActor, draft.id);
    expect(submitted.currentState).toBe('Submitted');

    // Moderator claims
    const claimed = transition(moderatorActor, draft.id, { type: 'claim' });
    expect(claimed.currentState).toBe('In_Review');

    // Moderator requests clarification
    const returned = transition(moderatorActor, draft.id, {
      type: 'request_clarification',
      note: 'Please provide benchmark delta against baseline.',
    });
    expect(returned.currentState).toBe('Returned');
    expect(returned.clarificationRequest).toBe('Please provide benchmark delta against baseline.');

    // Author amends and resubmits
    const amended = transition(authorActor, draft.id, {
      type: 'amend_resubmit',
      title: 'Seasonal Anomaly in Trade LC Cycle (Clarified)',
      body: 'Port turnaround times increased by 4.2 days vs 2025 baseline.',
    });
    expect(amended.currentState).toBe('Submitted');
    expect(amended.currentRevision.version).toBe(2);
    expect(amended.revisions).toHaveLength(2);

    // Author exercises synchronous withdrawal (< 60s hard ceiling)
    const withdrawn = withdrawObservation(authorActor, draft.id);
    expect(withdrawn.currentState).toBe('Withdrawn');

    // Audit log records withdrawal
    const auditLogs = store.auditEvents.filter((a) => a.resourceId === draft.id);
    expect(auditLogs.some((a) => a.action === 'withdraw_contribution')).toBe(true);
  });
});
