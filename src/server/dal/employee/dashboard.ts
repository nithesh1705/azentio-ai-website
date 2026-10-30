import { Actor, LiveSession, PlaygroundRun, Experiment, InternalReleaseNote, KnowledgeItem, Notification, EmployeeTeam, TeamNote } from '@/types';
import { authorize } from '@/server/policy/authorize';
import {
  SEED_LIVE_SESSIONS,
  SEED_PLAYGROUND_RUNS,
  SEED_EXPERIMENTS,
  SEED_INTERNAL_RELEASES,
  SEED_KNOWLEDGE_ITEMS,
  SEED_EMPLOYEE_TEAMS,
  SEED_TEAM_NOTES,
} from './seed_employee';
import { store } from '@/server/dal/store';

export interface DashboardData {
  actor: {
    userId: string;
    name: string;
    email: string;
    platformGrants: string[];
    isVerifiedEmployee: boolean;
  };
  nextLiveSession: LiveSession | null;
  recentRuns: PlaygroundRun[];
  myExperimentsSummary: {
    total: number;
    byStatus: {
      Draft: number;
      Submitted: number;
      In_Progress: number;
      Completed: number;
      Archived: number;
    };
    recent: Experiment[];
  };
  myTeamSummary: {
    team: EmployeeTeam | null;
    memberCount: number;
    latestNote: TeamNote | null;
  } | null;
  latestReleases: InternalReleaseNote[];
  knowledgeDueForReview: KnowledgeItem[];
  recentNotifications: Notification[];
  assignedIdeasCount: number;
  assignedLearningCount: number;
}

export function getEmployeeDashboardData(actor: Actor): DashboardData {
  // Gate 1 & 2 Check via Authorize
  const decision = authorize(actor, 'read', {
    kind: 'page',
    audience: 'employee',
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  // 1. Next live or scheduled session
  const sortedSessions = [...SEED_LIVE_SESSIONS].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const nextLiveSession =
    sortedSessions.find((s) => s.status === 'live') ||
    sortedSessions.find((s) => s.status === 'scheduled') ||
    null;

  // 2. My recent playground runs (scoped to actor.userId or fallback to recent employee runs)
  const myRuns = SEED_PLAYGROUND_RUNS.filter(
    (r) => r.userId === actor.userId || actor.isVerifiedEmployee
  ).slice(0, 5);

  // 3. My experiments status counts
  const userExperiments = SEED_EXPERIMENTS.filter(
    (e) => e.ownerId === actor.userId || e.collaboratorIds.includes(actor.userId)
  );
  const statusCounts = {
    Draft: 0,
    Submitted: 0,
    In_Progress: 0,
    Completed: 0,
    Archived: 0,
  };
  userExperiments.forEach((exp) => {
    if (statusCounts[exp.status] !== undefined) {
      statusCounts[exp.status]++;
    }
  });

  // 4. My team space
  const myTeam =
    SEED_EMPLOYEE_TEAMS.find((t) => t.memberIds.includes(actor.userId)) || null;
  let latestNote: TeamNote | null = null;
  if (myTeam) {
    const teamNotes = SEED_TEAM_NOTES.filter((n) => n.teamId === myTeam.id).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    latestNote = teamNotes[0] || null;
  }

  // 5. Latest 3 release notes
  const latestReleases = SEED_INTERNAL_RELEASES.filter(
    (r) => r.published && r.audience === 'employee'
  ).slice(0, 3);

  // 6. Knowledge items due for review (items owned by actor or due soon <= 14 days)
  const nowTime = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const knowledgeDueForReview = SEED_KNOWLEDGE_ITEMS.filter((item) => {
    const reviewDate = new Date(item.nextReviewDate).getTime();
    const isDueSoon = reviewDate - nowTime <= fourteenDaysMs;
    return isDueSoon && (item.ownerId === actor.userId || actor.isVerifiedEmployee);
  });

  // 7. Recent notifications (last 5)
  const userNotifications = store.notifications
    .filter((n) => n.userId === actor.userId)
    .slice(0, 5);

  // 8. Assigned ideas count (only if product_owner or assigned)
  let assignedIdeasCount = 0;
  if (actor.platformGrants.includes('product_owner') || actor.platformGrants.includes('portal_admin')) {
    assignedIdeasCount = store.ideas.length;
  }

  // 9. Assigned learning count (shared learning themes)
  const assignedLearningCount = store.themes.length;

  return {
    actor: {
      userId: actor.userId,
      name: actor.name,
      email: actor.email,
      platformGrants: actor.platformGrants || [],
      isVerifiedEmployee: actor.isVerifiedEmployee,
    },
    nextLiveSession,
    recentRuns: myRuns,
    myExperimentsSummary: {
      total: userExperiments.length,
      byStatus: statusCounts,
      recent: userExperiments.slice(0, 4),
    },
    myTeamSummary: myTeam
      ? {
          team: myTeam,
          memberCount: myTeam.memberIds.length,
          latestNote,
        }
      : null,
    latestReleases,
    knowledgeDueForReview,
    recentNotifications: userNotifications,
    assignedIdeasCount,
    assignedLearningCount,
  };
}
