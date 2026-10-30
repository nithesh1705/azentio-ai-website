import { Actor } from '@/types';
import { store } from '@/server/dal/store';
import { getClientDemos } from './demos';
import { getClientObservations } from './observations';
import { getSharedObservations } from './shared';

export interface SearchResultItem {
  id: string;
  category: 'demos' | 'observations' | 'shared' | 'themes' | 'ideas';
  title: string;
  snippet: string;
  badge?: string;
  url: string;
  updatedAt?: string;
}

export interface ClientSearchResult {
  query: string;
  totalCount: number;
  resultsByCategory: {
    demos: SearchResultItem[];
    observations: SearchResultItem[];
    shared: SearchResultItem[];
    themes: SearchResultItem[];
    ideas: SearchResultItem[];
  };
}

export function searchClientContent(actor: Actor, query: string): ClientSearchResult {
  const q = query.trim().toLowerCase();

  const emptyResult: ClientSearchResult = {
    query,
    totalCount: 0,
    resultsByCategory: {
      demos: [],
      observations: [],
      shared: [],
      themes: [],
      ideas: [],
    },
  };

  if (!q) {
    return emptyResult;
  }

  // 1. Entitled Demos
  let demos: SearchResultItem[] = [];
  try {
    const entitledDemos = getClientDemos(actor);
    demos = entitledDemos
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.offeringName.toLowerCase().includes(q)
      )
      .map((d) => ({
        id: d.id,
        category: 'demos',
        title: d.name,
        snippet: d.description,
        badge: d.offeringName,
        url: `/client/demos/${d.id}`,
      }));
  } catch (e) {
    demos = [];
  }

  // 2. Client Observations (scoped strictly to active tenant, private drafts of others excluded)
  let observations: SearchResultItem[] = [];
  try {
    const clientObs = getClientObservations(actor, 'org');
    observations = clientObs
      .filter(
        (o) =>
          o.currentRevision.title.toLowerCase().includes(q) ||
          o.currentRevision.body.toLowerCase().includes(q) ||
          o.currentRevision.industry.toLowerCase().includes(q)
      )
      .map((o) => ({
        id: o.id,
        category: 'observations',
        title: o.currentRevision.title,
        snippet: o.currentRevision.body,
        badge: o.currentState,
        url: `/client/observations/${o.id}`,
        updatedAt: o.updatedAt || o.createdAt,
      }));
  } catch (e) {
    observations = [];
  }

  // 3. Shared Learning Feed (de-identified published items)
  let shared: SearchResultItem[] = [];
  try {
    const published = getSharedObservations(actor, { search: q });
    shared = published.map((p) => ({
      id: p.id,
      category: 'shared',
      title: p.title,
      snippet: p.body,
      badge: p.attributionOptIn ? p.attributionLabel : 'Anonymous',
      url: `/client/shared`,
      updatedAt: p.publishedAt,
    }));
  } catch (e) {
    shared = [];
  }

  // 4. Themes
  let themes: SearchResultItem[] = [];
  try {
    themes = store.themes
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.limitations && t.limitations.toLowerCase().includes(q))
      )
      .map((t) => ({
        id: t.id,
        category: 'themes',
        title: t.title,
        snippet: t.description,
        badge: `${t.supportingObservationIds.length} Patterns`,
        url: `/client/themes/${t.id}`,
      }));
  } catch (e) {
    themes = [];
  }

  // 5. Improvement Ideas
  let ideas: SearchResultItem[] = [];
  try {
    ideas = store.ideas
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.problemStatement.toLowerCase().includes(q) ||
          i.clientVisibleSummary.toLowerCase().includes(q)
      )
      .map((i) => ({
        id: i.id,
        category: 'ideas',
        title: i.title,
        snippet: i.clientVisibleSummary || i.problemStatement,
        badge: i.status.replace('_', ' '),
        url: `/client/ideas`,
      }));
  } catch (e) {
    ideas = [];
  }

  const totalCount =
    demos.length + observations.length + shared.length + themes.length + ideas.length;

  return {
    query,
    totalCount,
    resultsByCategory: {
      demos,
      observations,
      shared,
      themes,
      ideas,
    },
  };
}
