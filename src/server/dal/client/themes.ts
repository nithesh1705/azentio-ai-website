import { Actor, Theme, PublishedObservation } from '@/types';
import { getThemes, store, MIN_DISTINCT_ORGS } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';

export interface EnrichedTheme extends Theme {
  isSuppressed: boolean;
  suppressionReason?: string;
  supportingObservations?: PublishedObservation[];
}

/**
 * Get aggregated learning themes with MIN_DISTINCT_ORGS (3) safeguard.
 */
export function getClientThemes(actor: Actor): EnrichedTheme[] {
  return getThemes(actor);
}

/**
 * Get single aggregated theme by ID with supporting de-identified excerpts
 */
export function getClientThemeById(actor: Actor, themeId: string): EnrichedTheme {
  const themes = getClientThemes(actor);
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  // Supporting live published observations
  const supportingObservations = store.publishedObservations.filter(
    (obs) => theme.supportingObservationIds.includes(obs.id) && obs.status === 'live'
  );

  return {
    ...theme,
    supportingObservations,
  };
}

