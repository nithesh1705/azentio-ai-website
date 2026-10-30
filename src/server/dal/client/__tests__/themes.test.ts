import { describe, it, expect, beforeEach } from 'vitest';
import { getClientThemes, getClientThemeById } from '../themes';
import { store, MIN_DISTINCT_ORGS } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Aggregated Themes DAL', () => {
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

  it('enforces MIN_DISTINCT_ORGS (3) safeguard on aggregated themes', () => {
    const themes = getClientThemes(memberActor);
    expect(themes.length).toBeGreaterThan(0);

    themes.forEach((t) => {
      if (t.isSuppressed) {
        expect(t.distinctOrgCount).toBe(0);
        expect(t.suppressionReason).toContain(`MIN_DISTINCT_ORGS`);
      } else {
        expect(t.distinctOrgCount).toBeGreaterThanOrEqual(MIN_DISTINCT_ORGS);
      }
    });
  });

  it('resolves supporting live published observations for a valid theme', () => {
    const themes = getClientThemes(memberActor);
    const themeWithObs = themes.find((t) => t.supportingObservationIds.length > 0) || themes[0];

    const detail = getClientThemeById(memberActor, themeWithObs.id);
    expect(detail.id).toBe(themeWithObs.id);
    expect(detail.supportingObservations).toBeDefined();
  });
});

