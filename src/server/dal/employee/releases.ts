import { Actor, InternalReleaseNote } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_INTERNAL_RELEASES } from './seed_employee';
import { store } from '@/server/dal/store';

let activeReleases: InternalReleaseNote[] = [...SEED_INTERNAL_RELEASES];
const subscriptionsByUser: Record<string, string[]> = {
  'usr-employee-1': ['offering-fai', 'offering-aml'],
};

export function getInternalReleases(
  actor: Actor,
  filters?: { offeringId?: string; type?: string; search?: string }
): InternalReleaseNote[] {
  const auth = authorize(actor, 'read', { kind: 'release_note', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  let result = activeReleases.filter((r) => r.published && r.audience === 'employee');

  if (filters?.offeringId && filters.offeringId !== 'all') {
    result = result.filter((r) => r.offeringId === filters.offeringId);
  }
  if (filters?.type && filters.type !== 'all') {
    result = result.filter((r) => r.type === filters.type);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.version.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.fullNotes.toLowerCase().includes(q)
    );
  }

  // Sort by date descending
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInternalReleaseById(actor: Actor, id: string): InternalReleaseNote | undefined {
  const auth = authorize(actor, 'read', { kind: 'release_note', audience: 'employee', id });
  if (!auth.allow) throw new Error(auth.reason);

  return activeReleases.find((r) => r.id === id);
}

export function createInternalRelease(
  actor: Actor,
  data: {
    version: string;
    title: string;
    offeringId: string;
    offeringName: string;
    type: 'Feature' | 'Improvement' | 'Fix' | 'Known_Issue';
    summary: string;
    fullNotes: string;
    knownIssues?: string[];
  }
): InternalReleaseNote {
  const auth = authorize(actor, 'create', { kind: 'release_note', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const newRel: InternalReleaseNote = {
    id: `rel-${Date.now().toString().slice(-4)}`,
    version: data.version,
    title: data.title,
    date: new Date().toISOString().slice(0, 10),
    offeringId: data.offeringId,
    offeringName: data.offeringName,
    type: data.type,
    summary: data.summary,
    fullNotes: data.fullNotes,
    knownIssues: data.knownIssues || [],
    audience: 'employee',
    published: true,
    authorId: actor.userId,
  };

  activeReleases.unshift(newRel);

  // Notify subscribed employees
  Object.entries(subscriptionsByUser).forEach(([userId, subbedOfferings]) => {
    if (subbedOfferings.includes(data.offeringId) && userId !== actor.userId) {
      store.notify(
        userId,
        'system',
        `New Release: ${data.version}`,
        `${data.title} has been published for ${data.offeringName}`,
        `/employee/releases/${newRel.id}`
      );
    }
  });

  store.logAudit(
    actor,
    'create_release',
    'release_note',
    newRel.id,
    `Publisher created release "${newRel.version} - ${newRel.title}"`
  );

  return newRel;
}

export function getReleaseSubscriptions(actor: Actor): string[] {
  const auth = authorize(actor, 'read', { kind: 'release_note', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  return subscriptionsByUser[actor.userId] || [];
}

export function toggleReleaseSubscription(actor: Actor, offeringId: string): string[] {
  const auth = authorize(actor, 'update', { kind: 'release_note', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const current = subscriptionsByUser[actor.userId] || [];
  let updated: string[];

  if (current.includes(offeringId)) {
    updated = current.filter((id) => id !== offeringId);
  } else {
    updated = [...current, offeringId];
  }

  subscriptionsByUser[actor.userId] = updated;
  return updated;
}
