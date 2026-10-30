import { Actor } from '@/types';
import { authorize } from '@/server/policy/authorize';
import {
  SEED_EXPERIMENTS,
  SEED_KNOWLEDGE_ITEMS,
  SEED_INTERNAL_RELEASES,
  SEED_LIVE_SESSIONS,
  SEED_EMPLOYEE_TEAMS,
} from './seed_employee';

export interface SearchResultItem {
  id: string;
  type: 'experiment' | 'knowledge' | 'release' | 'session' | 'team';
  title: string;
  snippet: string;
  url: string;
  metadata: string;
}

export interface GroupedSearchResults {
  query: string;
  totalCount: number;
  countsByType: {
    experiment: number;
    knowledge: number;
    release: number;
    session: number;
    team: number;
  };
  results: SearchResultItem[];
}

export function searchEmployeeContent(
  actor: Actor,
  query: string,
  typeFilter: string = 'all'
): GroupedSearchResults {
  const auth = authorize(actor, 'search', { kind: 'page', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const q = query.trim().toLowerCase();
  const allResults: SearchResultItem[] = [];

  if (!q) {
    return {
      query: '',
      totalCount: 0,
      countsByType: { experiment: 0, knowledge: 0, release: 0, session: 0, team: 0 },
      results: [],
    };
  }

  // 1. Experiments
  SEED_EXPERIMENTS.forEach((exp) => {
    if (
      exp.title.toLowerCase().includes(q) ||
      exp.hypothesis.toLowerCase().includes(q) ||
      exp.description.toLowerCase().includes(q) ||
      exp.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      allResults.push({
        id: exp.id,
        type: 'experiment',
        title: exp.title,
        snippet: exp.hypothesis,
        url: `/employee/experiments/${exp.id}`,
        metadata: `${exp.offeringName} • ${exp.status.replace('_', ' ')}`,
      });
    }
  });

  // 2. Knowledge
  SEED_KNOWLEDGE_ITEMS.forEach((kb) => {
    if (
      kb.title.toLowerCase().includes(q) ||
      kb.body.toLowerCase().includes(q) ||
      kb.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      allResults.push({
        id: kb.id,
        type: 'knowledge',
        title: kb.title,
        snippet: kb.body.replace(/#{1,6}\s?/g, '').slice(0, 140) + '...',
        url: `/employee/knowledge/${kb.id}`,
        metadata: `${kb.category} • Review: ${kb.reviewStatus}`,
      });
    }
  });

  // 3. Release Notes
  SEED_INTERNAL_RELEASES.forEach((rel) => {
    if (
      rel.version.toLowerCase().includes(q) ||
      rel.title.toLowerCase().includes(q) ||
      rel.summary.toLowerCase().includes(q) ||
      rel.fullNotes.toLowerCase().includes(q)
    ) {
      allResults.push({
        id: rel.id,
        type: 'release',
        title: `${rel.version} — ${rel.title}`,
        snippet: rel.summary,
        url: `/employee/releases/${rel.id}`,
        metadata: `${rel.offeringName} • ${rel.type}`,
      });
    }
  });

  // 4. Live Sessions
  SEED_LIVE_SESSIONS.forEach((session) => {
    if (
      session.title.toLowerCase().includes(q) ||
      session.description.toLowerCase().includes(q) ||
      session.hostName.toLowerCase().includes(q) ||
      session.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      allResults.push({
        id: session.id,
        type: 'session',
        title: session.title,
        snippet: session.description,
        url: `/employee/live/${session.id}`,
        metadata: `Host: ${session.hostName} • ${session.status.toUpperCase()}`,
      });
    }
  });

  // 5. Teams
  SEED_EMPLOYEE_TEAMS.forEach((team) => {
    if (
      team.name.toLowerCase().includes(q) ||
      team.goal.toLowerCase().includes(q) ||
      team.description.toLowerCase().includes(q) ||
      team.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      allResults.push({
        id: team.id,
        type: 'team',
        title: team.name,
        snippet: team.goal,
        url: `/employee/teams/${team.id}`,
        metadata: `Lead: ${team.leadName} • ${team.memberIds.length} Members`,
      });
    }
  });

  const countsByType = {
    experiment: allResults.filter((r) => r.type === 'experiment').length,
    knowledge: allResults.filter((r) => r.type === 'knowledge').length,
    release: allResults.filter((r) => r.type === 'release').length,
    session: allResults.filter((r) => r.type === 'session').length,
    team: allResults.filter((r) => r.type === 'team').length,
  };

  const filtered =
    typeFilter === 'all'
      ? allResults
      : allResults.filter((r) => r.type === typeFilter);

  return {
    query,
    totalCount: allResults.length,
    countsByType,
    results: filtered,
  };
}
