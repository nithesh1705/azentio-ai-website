import { Actor, Theme, PublishedObservation } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { store, MIN_DISTINCT_ORGS } from '@/server/dal/store';

export function getPermittedLearningThemes(actor: Actor): Theme[] {
  // Authorize shared learning access
  const auth = authorize(actor, 'read', { kind: 'theme', audience: 'shared_learning' });
  if (!auth.allow) throw new Error(auth.reason);

  // Guarantee: only return themes where distinctOrgCount >= MIN_DISTINCT_ORGS (3)
  return store.themes.filter((t) => t.distinctOrgCount >= MIN_DISTINCT_ORGS);
}

export function getDeidentifiedObservationExcerpts(actor: Actor, observationIds: string[]): PublishedObservation[] {
  const auth = authorize(actor, 'read', { kind: 'published_observation', audience: 'shared_learning' });
  if (!auth.allow) throw new Error(auth.reason);

  // Return only published, de-identified observations (never tenant IDs or author names)
  return store.publishedObservations.filter(
    (obs) => observationIds.includes(obs.id) && obs.status === 'live'
  );
}

