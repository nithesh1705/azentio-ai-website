import { describe, it, expect } from 'vitest';
import { authorize } from '@/server/policy/authorize';
import { isVerifiedEmployeeEmail } from '@/server/policy/employee_allowlist';
import { Actor } from '@/types';
import { runSimulationEngine } from '@/server/services/playground/runner';
import { SEED_PLAYGROUND_SCENARIOS } from '@/server/dal/employee/seed_employee';
import { searchEmployeeContent } from '@/server/dal/employee/search';

describe('Employee Portal Security & Authorization Matrix', () => {
  const anonymousActor: Actor = {
    userId: 'anon',
    name: 'Anonymous Visitor',
    email: '',
    platformGrants: [],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: false,
  };

  const clientActor: Actor = {
    userId: 'client-1',
    name: 'Client Admin',
    email: 'admin@gulfbank.com',
    platformGrants: [],
    memberships: [{ orgId: 'org-gulf-meridian', role: 'client_admin', status: 'active' }],
    activeTenantId: 'org-gulf-meridian',
    isVerifiedEmployee: false,
  };

  const fakeDomainActor: Actor = {
    userId: 'fake-azentio',
    name: 'Fake Employee',
    email: 'imposter@azentio.com',
    platformGrants: [],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: false, // Not in allowlist
  };

  const verifiedEmployee: Actor = {
    userId: 'usr-employee-1',
    name: 'Nithesh M',
    email: 'nithesh_m@azentio.com',
    platformGrants: [],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  const publisherEmployee: Actor = {
    userId: 'usr-employee-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@azentio.com',
    platformGrants: ['content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  const productOwnerEmployee: Actor = {
    userId: 'usr-employee-po',
    name: 'Elena Rostova',
    email: 'elena.rostova@azentio.com',
    platformGrants: ['product_owner'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  describe('Two-Gate Verification Check', () => {
    it('verifies legitimate @azentio.com email addresses against allowlist', () => {
      expect(isVerifiedEmployeeEmail('nithesh_m@azentio.com')).toBe(true);
      expect(isVerifiedEmployeeEmail('marcus.vance@azentio.com')).toBe(true);
      expect(isVerifiedEmployeeEmail('priya.sharma@azentio.com')).toBe(true);
    });

    it('denies domain-alone addresses not in allowlist', () => {
      expect(isVerifiedEmployeeEmail('imposter@azentio.com')).toBe(false);
      expect(isVerifiedEmployeeEmail('unknown@azentio.com')).toBe(false);
    });

    it('denies non-azentio emails', () => {
      expect(isVerifiedEmployeeEmail('admin@gulfbank.com')).toBe(false);
      expect(isVerifiedEmployeeEmail('user@gmail.com')).toBe(false);
    });
  });

  describe('Audience Quarantine Policy Rules', () => {
    it('denies anonymous visitors from reading employee pages and resources', () => {
      const res = authorize(anonymousActor, 'read', { kind: 'page', audience: 'employee' });
      expect(res.allow).toBe(false);
    });

    it('denies client actors from accessing employee-restricted resources', () => {
      const res = authorize(clientActor, 'read', { kind: 'playground', audience: 'employee' });
      expect(res.allow).toBe(false);
    });

    it('denies unverified fake azentio actor from reading employee data', () => {
      const res = authorize(fakeDomainActor, 'read', { kind: 'experiment', audience: 'employee' });
      expect(res.allow).toBe(false);
    });

    it('allows verified employees to read employee-audience resources', () => {
      const pageRes = authorize(verifiedEmployee, 'read', { kind: 'page', audience: 'employee' });
      expect(pageRes.allow).toBe(true);

      const expRes = authorize(verifiedEmployee, 'read', { kind: 'experiment', audience: 'employee' });
      expect(expRes.allow).toBe(true);

      const kbRes = authorize(verifiedEmployee, 'read', { kind: 'knowledge', audience: 'employee' });
      expect(kbRes.allow).toBe(true);
    });
  });

  describe('Granular Platform Grants (Publishers & Product Owners)', () => {
    it('denies ordinary employees from creating release notes', () => {
      const res = authorize(verifiedEmployee, 'create', { kind: 'release_note', audience: 'employee' });
      expect(res.allow).toBe(false);
    });

    it('allows content_publishers to create release notes and live broadcasts', () => {
      const relRes = authorize(publisherEmployee, 'create', { kind: 'release_note', audience: 'employee' });
      expect(relRes.allow).toBe(true);

      const liveRes = authorize(publisherEmployee, 'create', { kind: 'live_session', audience: 'employee' });
      expect(liveRes.allow).toBe(true);
    });

    it('denies ordinary employees from updating product backlog ideas', () => {
      const res = authorize(verifiedEmployee, 'update', { kind: 'idea', audience: 'employee', id: 'idea-101' });
      expect(res.allow).toBe(false);
    });

    it('allows product_owner to update product backlog ideas', () => {
      const res = authorize(productOwnerEmployee, 'update', { kind: 'idea', audience: 'employee', id: 'idea-101' });
      expect(res.allow).toBe(true);
    });

    it('enforces ownership checks on updating experiments', () => {
      // Owner can update their own experiment
      const ownRes = authorize(verifiedEmployee, 'update', {
        kind: 'experiment',
        audience: 'employee',
        id: 'exp-1',
        authorId: verifiedEmployee.userId,
      });
      expect(ownRes.allow).toBe(true);

      // Non-owner cannot update someone else's experiment
      const otherRes = authorize(verifiedEmployee, 'update', {
        kind: 'experiment',
        audience: 'employee',
        id: 'exp-1',
        authorId: 'usr-employee-99',
      });
      expect(otherRes.allow).toBe(false);
    });
  });

  describe('Playground Simulation Engine Verification', () => {
    it('correctly calculates deterministic DSCR contract and covenant breach on SME scenario', () => {
      const scenario = SEED_PLAYGROUND_SCENARIOS[0];
      const run = runSimulationEngine(
        scenario,
        'deterministic',
        { revenueHaircutPct: 15, interestRateHikeBps: 150 },
        { userId: verifiedEmployee.userId, name: verifiedEmployee.name }
      );

      expect(run.status).toBe('completed');
      expect(run.mode).toBe('deterministic');
      expect(run.metrics.length).toBeGreaterThan(0);
      expect(run.trace.length).toBeGreaterThan(0);
      expect(run.evidence.length).toBeGreaterThan(0);
      expect(run.outputSummary).toContain('contracts from 1.42x');
    });
  });

  describe('Global Search Quarantined Retrieval', () => {
    it('returns results across multiple categories for valid queries', () => {
      const results = searchEmployeeContent(verifiedEmployee, 'Murabaha');
      expect(results.totalCount).toBeGreaterThan(0);
      expect(results.results.some((r) => r.type === 'knowledge' || r.type === 'session')).toBe(true);
    });

    it('blocks search access for non-employees', () => {
      expect(() => searchEmployeeContent(clientActor, 'Murabaha')).toThrow();
    });
  });
});

