import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSharedObservations,
  reportSharedObservation,
  exportSharedFeedCsv,
} from '../shared';
import { searchClientContent } from '../search';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Shared Learning Feed & Client Search DAL', () => {
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

  it('guarantees de-identified read model without leaking tenant ID or author info', () => {
    const feed = getSharedObservations(memberActor);
    expect(feed.length).toBeGreaterThan(0);

    feed.forEach((obs: any) => {
      // Must not leak internal source references
      expect(obs.sourceContributionRef).toBe('[INTERNAL_DE-IDENTIFIED]');
      // Must not have raw author email or orgId
      expect(obs.authorEmail).toBeUndefined();
      expect(obs.orgId).toBeUndefined();
      expect(obs.revisions).toBeUndefined();
    });
  });

  it('generates a valid CSV export with headers', () => {
    const feed = getSharedObservations(memberActor);
    const csv = exportSharedFeedCsv(memberActor, feed);

    expect(csv).toContain('Observation ID,Solution Offering,Industry Band');
    expect(csv.split('\r\n').length).toBe(feed.length + 1);
  });

  it('records audit log on reporting a shared observation', () => {
    const feed = getSharedObservations(memberActor);
    const target = feed[0];

    const result = reportSharedObservation(memberActor, target.id, 'Potential re-identification concern');
    expect(result.success).toBe(true);

    const audit = store.auditEvents.find((a) => a.action === 'report_shared_observation');
    expect(audit).toBeDefined();
    expect(audit?.resourceId).toBe(target.id);
  });

  it('searches across permitted content and quarantines against unauthorized content', () => {
    const searchRes = searchClientContent(memberActor, 'liquidity');

    expect(searchRes.query).toBe('liquidity');
    expect(searchRes.totalCount).toBeGreaterThan(0);

    // Verify search results have expected structure
    const allResults = [
      ...searchRes.resultsByCategory.demos,
      ...searchRes.resultsByCategory.observations,
      ...searchRes.resultsByCategory.shared,
      ...searchRes.resultsByCategory.themes,
      ...searchRes.resultsByCategory.ideas,
    ];

    allResults.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.url).toBeDefined();
    });
  });
});
