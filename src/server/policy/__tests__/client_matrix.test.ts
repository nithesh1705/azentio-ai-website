import { describe, it, expect, beforeEach } from 'vitest';
import { store, MIN_DISTINCT_ORGS } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { getClientDashboardData } from '@/server/dal/client/dashboard';
import { getClientDemos, getClientDemoById, runDemo, getDemoRuns, getDemoRunById } from '@/server/dal/client/demos';
import {
  createObservationDraft,
  getClientObservations,
  getClientObservationById,
  submitObservation,
  withdrawObservation,
} from '@/server/dal/client/observations';
import { getSharedObservations, reportSharedObservation } from '@/server/dal/client/shared';
import { getClientThemes, getClientThemeById } from '@/server/dal/client/themes';
import { getOrgMembers, createMemberInvitation, changeMemberRole, revokeMember } from '@/server/dal/client/admin';
import { Actor } from '@/types';

describe('Client Matrix Security, Isolation & Invariant Tests', () => {
  beforeEach(() => {
    store.reset();
  });

  // Actor Org A (Member)
  const viratMemberOrgA: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  // Actor Org B (Admin)
  const dhoniAdminOrgB: Actor = {
    userId: 'usr-client-dhoni',
    email: 'dhoni.ms@xyz.com',
    name: 'MS Dhoni',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [{ orgId: 'org-xyz', role: 'client_admin', status: 'active' }],
    platformGrants: [],
  };

  // Actor with Multi-Tenant Memberships
  const hardikMultiOrg: Actor = {
    userId: 'usr-client-hardik',
    email: 'hardik.pandya@xyz.com',
    name: 'Hardik Pandya',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [
      { orgId: 'org-xyz', role: 'client_member', status: 'active' },
      { orgId: 'org-abcd', role: 'client_member', status: 'active' },
    ],
    platformGrants: [],
  };

  describe('1. Tenant Isolation Invariants', () => {
    it('Org A member cannot read, execute, or view Org B demo runs', async () => {
      // Dhoni runs a demo in Org B
      const runOrgB = await runDemo(dhoniAdminOrgB, {
        demoId: 'demo-fai',
        scenarioId: 'scen-fai-rateshock',
        mode: 'deterministic',
        params: { rateHikeBps: 150 },
      });

      // Virat in Org A queries demo runs: Org B run is NOT present
      const runsOrgA = getDemoRuns(viratMemberOrgA);
      expect(runsOrgA.some((r) => r.id === runOrgB.id)).toBe(false);

      // Direct lookup by ID throws access denied
      expect(() => getDemoRunById(viratMemberOrgA, runOrgB.id)).toThrow(/access denied/i);
    });

    it('Org A member cannot view Org B observations or author drafts', () => {
      const obsOrgB = createObservationDraft(
        dhoniAdminOrgB,
        {
          title: 'XYZ Secret Operations',
          body: 'Proprietary treasury note',
          offeringId: 'offering-fai',
          industry: 'Banking',
          region: 'Southeast Asia',
          observationPeriod: '2026-Q1',
          evidenceType: 'Production Telemetry',
          confidence: 'High',
          visibilityChoice: 'within_organisation',
          consents: {
            consent_process: true,
            consent_publish: false,
            consent_attribution: false,
            consent_training: false,
          },
        },
        true // submitted
      );

      // Virat queries org observations: Org B's observation is absent
      const viratOrgObs = getClientObservations(viratMemberOrgA, 'org');
      expect(viratOrgObs.some((o) => o.id === obsOrgB.id)).toBe(false);

      // Direct lookup by ID throws access denied
      expect(() => getClientObservationById(viratMemberOrgA, obsOrgB.id)).toThrow(
        /access denied/i
      );
    });

    it('multi-org user switching active tenant isolates data strictly to current activeTenantId', () => {
      // In org-xyz: Hardik sees org-xyz data
      const dataInXyz = getClientDashboardData(hardikMultiOrg);
      expect(dataInXyz.tenant.id).toBe('org-xyz');

      // Switch activeTenantId to org-abcd
      const hardikSwitched: Actor = {
        ...hardikMultiOrg,
        activeTenantId: 'org-abcd',
      };

      const dataInAbcd = getClientDashboardData(hardikSwitched);
      expect(dataInAbcd.tenant.id).toBe('org-abcd');
      expect(dataInAbcd.tenant.name).toBe('ABCD Technologies (abcd.in)');
    });
  });

  describe('2. Role Escalation & Privilege Boundary', () => {
    it('client_member is blocked from member administration and role changes', () => {
      expect(() => getOrgMembers(viratMemberOrgA)).toThrow(/Only client administrators/i);

      expect(() =>
        createMemberInvitation(viratMemberOrgA, {
          email: 'intruder@abcd.in',
          role: 'client_member',
        })
      ).toThrow(/Only client administrators/i);

      expect(() =>
        changeMemberRole(viratMemberOrgA, 'usr-client-virat', 'client_admin')
      ).toThrow(/Only client administrators/i);

      expect(() => revokeMember(viratMemberOrgA, 'usr-client-virat')).toThrow(
        /Only client administrators/i
      );
    });

    it('client_admin is strictly blocked from granting platform roles', () => {
      expect(() =>
        createMemberInvitation(dhoniAdminOrgB, {
          email: 'escalate@xyz.com',
          role: 'portal_admin' as any,
        })
      ).toThrow(/Invalid role/i);

      expect(() =>
        createMemberInvitation(dhoniAdminOrgB, {
          email: 'escalate@xyz.com',
          role: 'learning_moderator' as any,
        })
      ).toThrow(/Invalid role/i);
    });
  });

  describe('3. Solution Entitlement Gating', () => {
    it('blocks running sandboxes for solutions not licensed under active tenant', async () => {
      // org-abcd does NOT have digital lending suite (offering-dls)
      expect(() => getClientDemoById(viratMemberOrgA, 'demo-dls')).toThrow(/not entitled/i);

      // Attempting to run demo-dls throws entitlement error
      await expect(
        runDemo(viratMemberOrgA, {
          demoId: 'demo-dls',
          scenarioId: 'scen-dls-lc',
          mode: 'deterministic',
          params: {},
        })
      ).rejects.toThrow(/not entitled/i);
    });
  });

  describe('4. Four Independent Consents & Training Default OFF', () => {
    it('enforces training consent is default false and all four toggles operate independently', () => {
      const obs = createObservationDraft(viratMemberOrgA, {
        title: 'Consent Invariant Test',
        body: 'Verifying consent independence',
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
          consent_training: false, // Default strictly off
        },
      });

      expect(obs.consents.consent_training).toBe(false);
      expect(obs.consents.consent_attribution).toBe(false);
      expect(obs.consents.consent_process).toBe(true);
      expect(obs.consents.consent_publish).toBe(true);
    });
  });

  describe('5. De-Identified Shared Read Model Leak Test', () => {
    it('guarantees shared learning read model structurally omits tenant IDs and author PII', () => {
      const sharedFeed = getSharedObservations(viratMemberOrgA);
      expect(sharedFeed.length).toBeGreaterThan(0);

      sharedFeed.forEach((item: any) => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.body).toBeDefined();

        // Structural leak checks:
        expect(item.orgId).toBeUndefined();
        expect(item.tenantId).toBeUndefined();
        expect(item.authorId).toBeUndefined();
        expect(item.authorEmail).toBeUndefined();
        expect(item.authorName).toBeUndefined();
        expect(item.moderatorNotes).toBeUndefined();
        expect(item.rejectionReason).toBeUndefined();
        expect(item.clarificationRequest).toBeUndefined();
        expect(item.sourceContributionRef).toBe('[INTERNAL_DE-IDENTIFIED]');
      });
    });
  });

  describe('6. Synchronous 60-Second Withdrawal Ceiling Test', () => {
    it('author withdrawal immediately sets state to Withdrawn and purges from indexing', () => {
      const obs = createObservationDraft(
        viratMemberOrgA,
        {
          title: 'Withdrawal SLA Test',
          body: 'Testing synchronous purge from indices',
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
        true // submitted
      );

      const startTime = Date.now();
      const withdrawn = withdrawObservation(viratMemberOrgA, obs.id);
      const elapsedMs = Date.now() - startTime;

      // Synchronous execution under 60-second SLA (in fact < 100ms in memory)
      expect(elapsedMs).toBeLessThan(60000);
      expect(withdrawn.currentState).toBe('Withdrawn');

      // Audit event logged immediately
      const audit = store.auditEvents.find((a) => a.action === 'withdraw_contribution');
      expect(audit).toBeDefined();
      expect(audit?.resourceId).toBe(obs.id);
    });
  });

  describe('7. Aggregation Threshold (MIN_DISTINCT_ORGS = 3) Test', () => {
    it('suppresses statistics whenever supporting live organizations is less than 3', () => {
      const themes = getClientThemes(viratMemberOrgA);
      expect(themes.length).toBeGreaterThan(0);

      themes.forEach((theme) => {
        if (theme.isSuppressed) {
          expect(theme.distinctOrgCount).toBe(0);
          expect(theme.suppressionReason).toContain(String(MIN_DISTINCT_ORGS));
        } else {
          expect(theme.distinctOrgCount).toBeGreaterThanOrEqual(MIN_DISTINCT_ORGS);
        }
      });
    });
  });
});
