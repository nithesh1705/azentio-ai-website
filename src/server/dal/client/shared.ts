import { Actor, PublishedObservation } from '@/types';
import { getPublishedObservations, store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';

export interface SharedFeedFilters {
  search?: string;
  offeringId?: string;
  industry?: string;
  region?: string;
}

/**
 * Returns de-identified shared observations feed.
 * Structurally strips source revision, author info, tenant id, attachments, reviewer notes.
 */
export function getSharedObservations(
  actor: Actor,
  filters?: SharedFeedFilters
): PublishedObservation[] {
  return getPublishedObservations(actor, filters);
}

/**
 * Report a published shared observation for moderator investigation
 */
export function reportSharedObservation(
  actor: Actor,
  observationId: string,
  reason: string
): { success: boolean; message: string } {
  const obs = store.publishedObservations.find((o) => o.id === observationId);
  if (!obs) {
    throw new Error('Observation not found');
  }

  // Audit log the report
  store.logAudit(
    actor,
    'report_shared_observation',
    'published_observation',
    observationId,
    `Reported by ${actor.userId} (${actor.email || 'anonymous'}). Reason: ${reason}`
  );

  // Notify moderators
  const moderators = store.users.filter((u) => u.role === 'learning_moderator');
  moderators.forEach((m) => {
    store.notify(
      m.id,
      'system',
      'Observation Reported',
      `Shared observation "${obs.title}" was flagged by a client user. Reason: ${reason}`,
      `/employee/learning/queue`
    );
  });

  return {
    success: true,
    message: 'Report submitted. Our moderation team has queued this item for investigation.',
  };
}

/**
 * Generates a clean CSV export string of de-identified shared observations
 */
export function exportSharedFeedCsv(
  actor: Actor,
  observations: PublishedObservation[]
): string {
  const headers = [
    'Observation ID',
    'Solution Offering',
    'Industry Band',
    'Region Band',
    'Period Band',
    'Confidence',
    'Attribution Label',
    'Published Date',
    'Title',
    'De-Identified Finding',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = observations.map((obs) => [
    escapeCsv(obs.id),
    escapeCsv(obs.offeringName),
    escapeCsv(obs.industryBand),
    escapeCsv(obs.regionBand),
    escapeCsv(obs.periodBand),
    escapeCsv(obs.confidence),
    escapeCsv(obs.attributionOptIn ? obs.attributionLabel : 'Anonymous BFSI Contributor'),
    escapeCsv(obs.publishedAt),
    escapeCsv(obs.title),
    escapeCsv(obs.body),
  ]);

  store.logAudit(
    actor,
    'export_shared_feed_csv',
    'published_observation',
    'all',
    `Exported ${observations.length} de-identified observations to CSV`
  );

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
