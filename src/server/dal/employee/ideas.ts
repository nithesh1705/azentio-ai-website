import { Actor, ImprovementIdea, IdeaStatus } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { store } from '@/server/dal/store';

export function getEmployeeIdeas(actor: Actor, offeringId?: string): ImprovementIdea[] {
  const auth = authorize(actor, 'read', { kind: 'idea', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  let result = [...store.ideas];
  if (offeringId && offeringId !== 'all') {
    result = result.filter((i) => i.offeringId === offeringId);
  }
  return result;
}

export function transitionIdeaStatus(
  actor: Actor,
  ideaId: string,
  newStatus: IdeaStatus,
  note: string
): ImprovementIdea {
  // Strict product_owner gate enforced
  const auth = authorize(actor, 'update', { kind: 'idea', audience: 'employee', id: ideaId });
  if (!auth.allow) throw new Error(auth.reason);

  const idea = store.ideas.find((i) => i.id === ideaId);
  if (!idea) throw new Error('Idea not found');

  const oldStatus = idea.status;
  idea.status = newStatus;
  idea.lastUpdate = new Date().toISOString();
  idea.statusHistory.push({
    status: newStatus,
    changedAt: new Date().toISOString(),
    changedBy: actor.name,
    note,
  });

  store.logAudit(
    actor,
    'transition_idea_status',
    'idea',
    ideaId,
    `Transitioned idea "${idea.title}" from ${oldStatus} to ${newStatus}`
  );

  return idea;
}

