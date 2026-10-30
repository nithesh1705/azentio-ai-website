import { Actor, SavedSearch, Bookmark } from '@/types';
import { store } from '@/server/dal/store';

// In-Memory state for saved searches and bookmarks
let savedSearches: SavedSearch[] = [
  {
    id: 'search-01',
    userId: 'usr-client-virat',
    orgId: 'org-abcd',
    title: 'ASEAN SME Liquidity Shocks',
    query: 'liquidity ASEAN',
    filters: { offeringId: 'offering-fai' },
    notifyNewMatches: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

let bookmarks: Bookmark[] = [
  {
    id: 'bm-01',
    userId: 'usr-client-virat',
    orgId: 'org-abcd',
    targetType: 'demo',
    targetId: 'demo-fai',
    title: 'SME Cash Velocity & Seasonal Anomaly Stress Test',
    snippet: 'Interactive simulation evaluating ASEAN rate shocks against synthetic balance sheets.',
    url: '/client/demos/demo-fai',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

/**
 * Get saved searches for actor in their active workspace
 */
export function getSavedSearches(actor: Actor): SavedSearch[] {
  if (!actor.activeTenantId) {
    return [];
  }
  return savedSearches.filter(
    (s) => s.userId === actor.userId && s.orgId === actor.activeTenantId
  );
}

/**
 * Create a new saved search
 */
export function createSavedSearch(
  actor: Actor,
  input: {
    title: string;
    query: string;
    filters?: Record<string, string>;
    notifyNewMatches?: boolean;
  }
): SavedSearch {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to save search.');
  }

  const saved: SavedSearch = {
    id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: actor.userId,
    orgId: actor.activeTenantId,
    title: input.title,
    query: input.query,
    filters: input.filters || {},
    notifyNewMatches: input.notifyNewMatches ?? true,
    createdAt: new Date().toISOString(),
  };

  savedSearches.unshift(saved);
  store.logAudit(actor, 'create_saved_search', 'saved_search', saved.id, `Saved search "${saved.title}"`);
  return saved;
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(actor: Actor, id: string): boolean {
  const index = savedSearches.findIndex(
    (s) => s.id === id && s.userId === actor.userId && s.orgId === actor.activeTenantId
  );
  if (index === -1) return false;

  savedSearches.splice(index, 1);
  return true;
}

/**
 * Get bookmarks for actor in their active workspace
 */
export function getBookmarks(actor: Actor): Bookmark[] {
  if (!actor.activeTenantId) {
    return [];
  }
  return bookmarks.filter(
    (b) => b.userId === actor.userId && b.orgId === actor.activeTenantId
  );
}

/**
 * Toggle bookmark state
 */
export function toggleBookmark(
  actor: Actor,
  input: {
    targetType: Bookmark['targetType'];
    targetId: string;
    title: string;
    snippet?: string;
    url: string;
  }
): { bookmarked: boolean; bookmark?: Bookmark } {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to bookmark items.');
  }

  const existingIdx = bookmarks.findIndex(
    (b) =>
      b.userId === actor.userId &&
      b.orgId === actor.activeTenantId &&
      b.targetId === input.targetId
  );

  if (existingIdx !== -1) {
    bookmarks.splice(existingIdx, 1);
    return { bookmarked: false };
  }

  const newBm: Bookmark = {
    id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: actor.userId,
    orgId: actor.activeTenantId,
    targetType: input.targetType,
    targetId: input.targetId,
    title: input.title,
    snippet: input.snippet,
    url: input.url,
    createdAt: new Date().toISOString(),
  };

  bookmarks.unshift(newBm);
  return { bookmarked: true, bookmark: newBm };
}

/**
 * Remove bookmark
 */
export function removeBookmark(actor: Actor, id: string): boolean {
  const index = bookmarks.findIndex(
    (b) => b.id === id && b.userId === actor.userId && b.orgId === actor.activeTenantId
  );
  if (index === -1) return false;

  bookmarks.splice(index, 1);
  return true;
}

