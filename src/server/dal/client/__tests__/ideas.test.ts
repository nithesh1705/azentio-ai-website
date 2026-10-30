import { describe, it, expect, beforeEach } from 'vitest';
import { getClientIdeas } from '../ideas';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Improvement Ideas DAL', () => {
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

  it('projects client-safe views of improvement ideas without internal tickets', () => {
    const ideas = getClientIdeas(memberActor);
    expect(ideas.length).toBeGreaterThan(0);

    ideas.forEach((idea: any) => {
      expect(idea.title).toBeDefined();
      expect(idea.problemStatement).toBeDefined();
      expect(idea.clientVisibleSummary).toBeDefined();
      expect(idea.proposedOutcome).toBeDefined();
      expect(idea.ownerTeam).toBeDefined();
      expect(idea.status).toBeDefined();

      // Invariant: No internal private ticket tracking keys or cost fields leaked
      expect(idea.internalTicketKey).toBeUndefined();
      expect(idea.developerCostEstimate).toBeUndefined();
    });
  });

  it('filters ideas by offering ID', () => {
    const ideas = getClientIdeas(memberActor, { offeringId: 'offering-fai' });
    ideas.forEach((idea) => {
      expect(idea.offeringId).toBe('offering-fai');
    });
  });
});
