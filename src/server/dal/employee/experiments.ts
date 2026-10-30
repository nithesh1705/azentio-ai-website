import { Actor, Experiment, ExperimentComment, ExperimentJoinRequest } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_EXPERIMENTS, SEED_EXPERIMENT_COMMENTS } from './seed_employee';
import { store } from '@/server/dal/store';

let activeExperiments: Experiment[] = [...SEED_EXPERIMENTS];
let activeExperimentComments: ExperimentComment[] = [...SEED_EXPERIMENT_COMMENTS];
let activeJoinRequests: ExperimentJoinRequest[] = [];

export function getExperiments(
  actor: Actor,
  filters?: {
    status?: string;
    offeringId?: string;
    ownerOnly?: boolean;
    search?: string;
    sort?: 'updated' | 'created' | 'title';
  }
): Experiment[] {
  const auth = authorize(actor, 'read', { kind: 'experiment', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  let result = [...activeExperiments];

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((e) => e.status === filters.status);
  }
  if (filters?.offeringId && filters.offeringId !== 'all') {
    result = result.filter((e) => e.offeringId === filters.offeringId);
  }
  if (filters?.ownerOnly) {
    result = result.filter((e) => e.ownerId === actor.userId || e.collaboratorIds.includes(actor.userId));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.hypothesis.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters?.sort === 'created') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filters?.sort === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // default: updated
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  return result;
}

export function getExperimentById(actor: Actor, id: string): Experiment | undefined {
  const auth = authorize(actor, 'read', { kind: 'experiment', audience: 'employee', id });
  if (!auth.allow) throw new Error(auth.reason);

  return activeExperiments.find((e) => e.id === id);
}

export function createExperiment(
  actor: Actor,
  data: {
    title: string;
    offeringId: string;
    offeringName: string;
    hypothesis: string;
    description: string;
    approach: string;
    expectedOutcome: string;
    successMetric: string;
    tags: string[];
    links?: { title: string; url: string }[];
  }
): Experiment {
  const auth = authorize(actor, 'create', { kind: 'experiment', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  if (!data.title || data.title.length < 5) {
    throw new Error('Title must be at least 5 characters');
  }
  if (!data.hypothesis || data.hypothesis.length < 20) {
    throw new Error('Hypothesis must be at least 20 characters');
  }

  const now = new Date().toISOString();
  const newExp: Experiment = {
    id: `exp-${Date.now().toString().slice(-5)}`,
    ownerId: actor.userId,
    ownerName: actor.name,
    offeringId: data.offeringId,
    offeringName: data.offeringName,
    title: data.title,
    hypothesis: data.hypothesis,
    description: data.description,
    approach: data.approach,
    expectedOutcome: data.expectedOutcome,
    successMetric: data.successMetric,
    status: 'Draft',
    tags: data.tags,
    collaboratorIds: [],
    links: data.links || [],
    visibility: 'employee',
    createdAt: now,
    updatedAt: now,
  };

  activeExperiments.unshift(newExp);

  store.logAudit(
    actor,
    'create_experiment',
    'experiment',
    newExp.id,
    `Created experiment "${newExp.title}"`
  );

  return newExp;
}

export function updateExperiment(
  actor: Actor,
  id: string,
  updates: Partial<Pick<Experiment, 'title' | 'description' | 'approach' | 'expectedOutcome' | 'successMetric' | 'tags' | 'results' | 'linkedPlaygroundRunIds'>>
): Experiment {
  const exp = activeExperiments.find((e) => e.id === id);
  if (!exp) throw new Error('Experiment not found');

  const auth = authorize(actor, 'update', {
    kind: 'experiment',
    audience: 'employee',
    id,
    authorId: exp.ownerId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  Object.assign(exp, updates, { updatedAt: new Date().toISOString() });

  store.logAudit(actor, 'update_experiment', 'experiment', id, `Updated experiment "${exp.title}"`);
  return exp;
}

export function transitionExperimentStatus(
  actor: Actor,
  id: string,
  newStatus: Experiment['status']
): Experiment {
  const exp = activeExperiments.find((e) => e.id === id);
  if (!exp) throw new Error('Experiment not found');

  const auth = authorize(actor, 'update', {
    kind: 'experiment',
    audience: 'employee',
    id,
    authorId: exp.ownerId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  const oldStatus = exp.status;
  exp.status = newStatus;
  exp.updatedAt = new Date().toISOString();

  store.logAudit(
    actor,
    'transition_status',
    'experiment',
    id,
    `Transitioned status from ${oldStatus} to ${newStatus}`
  );

  return exp;
}

export function requestJoinExperiment(
  actor: Actor,
  experimentId: string,
  reason: string
): ExperimentJoinRequest {
  const auth = authorize(actor, 'join', { kind: 'experiment', audience: 'employee', id: experimentId });
  if (!auth.allow) throw new Error(auth.reason);

  const exp = activeExperiments.find((e) => e.id === experimentId);
  if (!exp) throw new Error('Experiment not found');

  const req: ExperimentJoinRequest = {
    id: `req-${Date.now().toString().slice(-4)}`,
    experimentId,
    userId: actor.userId,
    userName: actor.name,
    userEmail: actor.email,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  activeJoinRequests.push(req);

  // Send notification to experiment owner
  store.notify(
    exp.ownerId,
    'mention',
    'New Experiment Join Request',
    `${actor.name} requested to join "${exp.title}"`,
    `/employee/experiments/${exp.id}`
  );

  store.logAudit(actor, 'request_join', 'experiment', experimentId, `Requested to join experiment`);
  return req;
}

export function getExperimentComments(actor: Actor, experimentId: string): ExperimentComment[] {
  const auth = authorize(actor, 'read', { kind: 'experiment', audience: 'employee', id: experimentId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeExperimentComments.filter((c) => c.experimentId === experimentId);
}

export function postExperimentComment(
  actor: Actor,
  experimentId: string,
  body: string
): ExperimentComment {
  const auth = authorize(actor, 'comment', { kind: 'experiment', audience: 'employee', id: experimentId });
  if (!auth.allow) throw new Error(auth.reason);

  const exp = activeExperiments.find((e) => e.id === experimentId);

  const newComm: ExperimentComment = {
    id: `ecomm-${Date.now().toString().slice(-5)}`,
    experimentId,
    userId: actor.userId,
    userName: actor.name,
    body,
    createdAt: new Date().toISOString(),
  };

  activeExperimentComments.push(newComm);

  // Notify owner if commenter is someone else
  if (exp && exp.ownerId !== actor.userId) {
    store.notify(
      exp.ownerId,
      'mention',
      'New Comment on Experiment',
      `${actor.name} commented on "${exp.title}"`,
      `/employee/experiments/${exp.id}`
    );
  }

  return newComm;
}

export function deleteExperimentComment(actor: Actor, commentId: string): boolean {
  const comm = activeExperimentComments.find((c) => c.id === commentId);
  if (!comm) return false;

  const auth = authorize(actor, 'delete', {
    kind: 'experiment',
    audience: 'employee',
    authorId: comm.userId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  activeExperimentComments = activeExperimentComments.filter((c) => c.id !== commentId);
  return true;
}
