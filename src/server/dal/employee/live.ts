import { Actor, LiveSession, LiveComment } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_LIVE_SESSIONS, SEED_LIVE_COMMENTS } from './seed_employee';
import { store } from '@/server/dal/store';

let activeLiveSessions: LiveSession[] = [...SEED_LIVE_SESSIONS];
let activeLiveComments: LiveComment[] = [...SEED_LIVE_COMMENTS];

export function getLiveSessions(
  actor: Actor,
  filter?: 'all' | 'upcoming' | 'recordings'
): LiveSession[] {
  const auth = authorize(actor, 'read', { kind: 'live_session', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  if (filter === 'upcoming') {
    return activeLiveSessions.filter((s) => s.status === 'scheduled' || s.status === 'live');
  }
  if (filter === 'recordings') {
    return activeLiveSessions.filter((s) => s.status === 'ended');
  }
  return activeLiveSessions;
}

export function getLiveSessionById(actor: Actor, sessionId: string): LiveSession | undefined {
  const auth = authorize(actor, 'read', { kind: 'live_session', audience: 'employee', id: sessionId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeLiveSessions.find((s) => s.id === sessionId);
}

export function createLiveSession(
  actor: Actor,
  data: {
    title: string;
    hostName: string;
    hostRole: string;
    startTime: string;
    durationMinutes: number;
    description: string;
    agenda: string[];
    tags: string[];
  }
): LiveSession {
  // Publisher gate
  const auth = authorize(actor, 'create', { kind: 'live_session', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const newSession: LiveSession = {
    id: `live-${Date.now().toString().slice(-4)}`,
    title: data.title,
    hostName: data.hostName,
    hostRole: data.hostRole,
    startTime: data.startTime,
    durationMinutes: data.durationMinutes,
    status: 'scheduled',
    description: data.description,
    agenda: data.agenda,
    tags: data.tags,
    audience: 'employee',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  };

  activeLiveSessions.unshift(newSession);

  store.logAudit(
    actor,
    'create_live_session',
    'live_session',
    newSession.id,
    `Publisher created live session "${newSession.title}"`
  );

  return newSession;
}

export function endLiveSession(actor: Actor, sessionId: string, recordingMediaId?: string): LiveSession {
  const session = activeLiveSessions.find((s) => s.id === sessionId);
  if (!session) throw new Error('Session not found');

  const auth = authorize(actor, 'update', { kind: 'live_session', audience: 'employee', id: sessionId });
  if (!auth.allow) throw new Error(auth.reason);

  session.status = 'ended';
  if (recordingMediaId) {
    session.recordingMediaId = recordingMediaId;
  }

  store.logAudit(
    actor,
    'end_live_session',
    'live_session',
    sessionId,
    `Ended live session "${session.title}"`
  );

  return session;
}

export function getLiveComments(actor: Actor, sessionId: string): LiveComment[] {
  const auth = authorize(actor, 'read', { kind: 'live_session', audience: 'employee', id: sessionId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeLiveComments.filter((c) => c.sessionId === sessionId && !c.reported);
}

export function postLiveComment(
  actor: Actor,
  sessionId: string,
  body: string,
  parentId?: string
): LiveComment {
  const auth = authorize(actor, 'comment', { kind: 'live_session', audience: 'employee', id: sessionId });
  if (!auth.allow) throw new Error(auth.reason);

  const newComment: LiveComment = {
    id: `comm-${Date.now().toString().slice(-5)}`,
    sessionId,
    userId: actor.userId,
    userName: actor.name,
    avatar: actor.avatar,
    body,
    createdAt: new Date().toISOString(),
    parentId,
  };

  activeLiveComments.push(newComment);

  store.logAudit(
    actor,
    'post_comment',
    'live_session',
    sessionId,
    `Posted Q&A comment on session ${sessionId}`
  );

  return newComment;
}

export function reportLiveComment(actor: Actor, commentId: string): boolean {
  const auth = authorize(actor, 'report', { kind: 'live_session', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const comment = activeLiveComments.find((c) => c.id === commentId);
  if (!comment) return false;

  comment.reported = true;

  store.logAudit(
    actor,
    'report_comment',
    'live_session',
    commentId,
    `Reported live comment for review`
  );

  return true;
}
