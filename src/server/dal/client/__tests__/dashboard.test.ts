import { describe, it, expect, beforeEach } from 'vitest';
import { getClientDashboardData } from '../dashboard';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Dashboard DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const memberActor: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  it('rejects actors without activeTenantId', () => {
    const actorWithoutTenant: Actor = {
      ...memberActor,
      activeTenantId: null,
    };

    expect(() => getClientDashboardData(actorWithoutTenant)).toThrow(
      'Active client workspace required'
    );
  });

  it('returns correctly scoped offerings and summary for active tenant', () => {
    const data = getClientDashboardData(memberActor);

    expect(data.tenant.id).toBe('org-abcd');
    expect(data.tenant.name).toBe('ABCD Technologies (abcd.in)');

    // abcd has entitledOfferings: ['offering-fai', 'offering-cbe', 'offering-aml']
    const offeringIds = data.entitledOfferings.map((o) => o.id);
    expect(offeringIds).toContain('offering-fai');
    expect(offeringIds).toContain('offering-cbe');
    expect(offeringIds).toContain('offering-aml');
    expect(offeringIds).not.toContain('offering-dls');

    // Demos match entitled offerings
    data.demos.forEach((demo) => {
      expect(['offering-fai', 'offering-cbe', 'offering-aml']).toContain(demo.offeringId);
    });

    // Verify contributions summary structure
    expect(data.contributionsSummary).toBeDefined();
    expect(typeof data.contributionsSummary.total).toBe('number');
    expect(typeof data.contributionsSummary.drafts).toBe('number');
  });

  it('correctly isolates empty entitlement tenant', () => {
    const emptyTenantActor: Actor = {
      userId: 'usr-delta-test',
      email: 'tester@delta.synthetic',
      name: 'Delta Member',
      isVerifiedEmployee: false,
      activeTenantId: 'org-delta-empty',
      memberships: [{ orgId: 'org-delta-empty', role: 'client_member', status: 'active' }],
      platformGrants: [],
    };

    const data = getClientDashboardData(emptyTenantActor);
    expect(data.tenant.id).toBe('org-delta-empty');
    expect(data.entitledOfferings).toHaveLength(0);
    expect(data.demos).toHaveLength(0);
  });
});
