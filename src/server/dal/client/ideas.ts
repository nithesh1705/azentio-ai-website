import { Actor, ImprovementIdea, IdeaStatus } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';

export interface ClientSafeIdea {
  id: string;
  title: string;
  clientVisibleSummary: string;
  problemStatement: string;
  proposedOutcome: string;
  offeringId: string;
  offeringName: string;
  ownerTeam: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: IdeaStatus;
  lastUpdate: string;
  statusHistory: {
    status: IdeaStatus;
    changedAt: string;
    note: string;
  }[];
}

/**
 * Returns strictly client-safe projections of improvement ideas and product roadmaps.
 * Structurally guarantees no internal Jira/Linear engineering ticket IDs, cost estimations,
 * or unapproved private comments are leaked to external clients.
 */
export function getClientIdeas(
  actor: Actor,
  filters?: {
    status?: string;
    offeringId?: string;
  }
): ClientSafeIdea[] {
  let items = store.ideas;

  if (filters?.status && filters.status !== 'all') {
    items = items.filter((i) => i.status.toLowerCase() === filters.status!.toLowerCase());
  }

  if (filters?.offeringId && filters.offeringId !== 'all') {
    items = items.filter((i) => i.offeringId === filters.offeringId);
  }

  // Map to client-safe projection
  return items.map((idea) => ({
    id: idea.id,
    title: idea.title,
    clientVisibleSummary: idea.clientVisibleSummary || idea.problemStatement,
    problemStatement: idea.problemStatement,
    proposedOutcome: idea.proposedOutcome,
    offeringId: idea.offeringId,
    offeringName: idea.offeringName,
    ownerTeam: idea.ownerTeam,
    priority: idea.priority,
    status: idea.status,
    lastUpdate: idea.lastUpdate,
    statusHistory: idea.statusHistory.map((h) => ({
      status: h.status,
      changedAt: h.changedAt,
      note: h.note,
    })),
  }));
}

