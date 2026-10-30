import { Actor, EmployeeTeam, TeamNote, TeamSubmission, PlaygroundRun } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_EMPLOYEE_TEAMS, SEED_TEAM_NOTES, SEED_TEAM_SUBMISSIONS, SEED_PLAYGROUND_RUNS } from './seed_employee';
import { store } from '@/server/dal/store';

let activeTeams: EmployeeTeam[] = [...SEED_EMPLOYEE_TEAMS];
let activeTeamNotes: TeamNote[] = [...SEED_TEAM_NOTES];
let activeSubmissions: TeamSubmission[] = [...SEED_TEAM_SUBMISSIONS];

export function getEmployeeTeams(actor: Actor, filter?: 'all' | 'my', search?: string): EmployeeTeam[] {
  const auth = authorize(actor, 'read', { kind: 'team', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  let result = [...activeTeams];

  if (filter === 'my') {
    result = result.filter((t) => t.memberIds.includes(actor.userId));
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.goal.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return result;
}

export function getTeamById(actor: Actor, id: string): EmployeeTeam | undefined {
  const auth = authorize(actor, 'read', { kind: 'team', audience: 'employee', id });
  if (!auth.allow) throw new Error(auth.reason);

  return activeTeams.find((t) => t.id === id);
}

export function createEmployeeTeam(
  actor: Actor,
  data: {
    name: string;
    goal: string;
    description: string;
    maxMembers?: number;
    tags: string[];
  }
): EmployeeTeam {
  const auth = authorize(actor, 'create', { kind: 'team', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const newTeam: EmployeeTeam = {
    id: `team-${Date.now().toString().slice(-4)}`,
    name: data.name,
    leadId: actor.userId,
    leadName: actor.name,
    goal: data.goal,
    description: data.description,
    maxMembers: data.maxMembers || 5,
    tags: data.tags,
    memberIds: [actor.userId],
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  activeTeams.unshift(newTeam);

  store.logAudit(actor, 'create_team', 'team', newTeam.id, `Created team "${newTeam.name}"`);
  return newTeam;
}

export function joinTeam(actor: Actor, teamId: string): EmployeeTeam {
  const team = activeTeams.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');

  const auth = authorize(actor, 'join', { kind: 'team', audience: 'employee', id: teamId });
  if (!auth.allow) throw new Error(auth.reason);

  if (team.memberIds.includes(actor.userId)) {
    return team;
  }

  if (team.memberIds.length >= team.maxMembers) {
    throw new Error('This team has reached its maximum member capacity.');
  }

  team.memberIds.push(actor.userId);

  // Notify team lead
  if (team.leadId !== actor.userId) {
    store.notify(
      team.leadId,
      'mention',
      'New Team Member',
      `${actor.name} has joined "${team.name}"`,
      `/employee/teams/${team.id}`
    );
  }

  store.logAudit(actor, 'join_team', 'team', teamId, `Joined team "${team.name}"`);
  return team;
}

export function leaveTeam(actor: Actor, teamId: string): EmployeeTeam {
  const team = activeTeams.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');

  const auth = authorize(actor, 'update', { kind: 'team', audience: 'employee', id: teamId });
  if (!auth.allow) throw new Error(auth.reason);

  team.memberIds = team.memberIds.filter((id) => id !== actor.userId);
  store.logAudit(actor, 'leave_team', 'team', teamId, `Left team "${team.name}"`);
  return team;
}

export function getTeamNotes(actor: Actor, teamId: string): TeamNote[] {
  const auth = authorize(actor, 'read', { kind: 'team_note', audience: 'employee', id: teamId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeTeamNotes
    .filter((n) => n.teamId === teamId)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

export function createTeamNote(
  actor: Actor,
  data: { teamId: string; title: string; content: string; pinned?: boolean }
): TeamNote {
  const auth = authorize(actor, 'create', { kind: 'team_note', audience: 'employee', id: data.teamId });
  if (!auth.allow) throw new Error(auth.reason);

  const newNote: TeamNote = {
    id: `tnote-${Date.now().toString().slice(-4)}`,
    teamId: data.teamId,
    authorId: actor.userId,
    authorName: actor.name,
    title: data.title,
    content: data.content,
    pinned: !!data.pinned,
    updatedAt: new Date().toISOString(),
  };

  activeTeamNotes.unshift(newNote);
  return newNote;
}

export function togglePinTeamNote(actor: Actor, noteId: string): TeamNote {
  const note = activeTeamNotes.find((n) => n.id === noteId);
  if (!note) throw new Error('Note not found');

  const auth = authorize(actor, 'update', { kind: 'team_note', audience: 'employee', id: note.teamId });
  if (!auth.allow) throw new Error(auth.reason);

  note.pinned = !note.pinned;
  note.updatedAt = new Date().toISOString();
  return note;
}

export function deleteTeamNote(actor: Actor, noteId: string): boolean {
  const note = activeTeamNotes.find((n) => n.id === noteId);
  if (!note) return false;

  const auth = authorize(actor, 'delete', {
    kind: 'team_note',
    audience: 'employee',
    authorId: note.authorId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  activeTeamNotes = activeTeamNotes.filter((n) => n.id !== noteId);
  return true;
}

export function getTeamSubmission(actor: Actor, teamId: string): TeamSubmission | undefined {
  const auth = authorize(actor, 'read', { kind: 'team', audience: 'employee', id: teamId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeSubmissions.find((s) => s.teamId === teamId);
}

export function saveTeamSubmission(
  actor: Actor,
  data: { teamId: string; title: string; summary: string; demoUrl?: string; repoUrl?: string }
): TeamSubmission {
  const team = activeTeams.find((t) => t.id === data.teamId);
  if (!team) throw new Error('Team not found');

  const auth = authorize(actor, 'update', { kind: 'team', audience: 'employee', id: data.teamId });
  if (!auth.allow) throw new Error(auth.reason);

  const existing = activeSubmissions.find((s) => s.teamId === data.teamId);
  if (existing) {
    existing.title = data.title;
    existing.summary = data.summary;
    existing.demoUrl = data.demoUrl;
    existing.repoUrl = data.repoUrl;
    existing.submittedAt = new Date().toISOString();
    return existing;
  }

  const newSub: TeamSubmission = {
    id: `tsub-${Date.now().toString().slice(-4)}`,
    teamId: data.teamId,
    title: data.title,
    summary: data.summary,
    demoUrl: data.demoUrl,
    repoUrl: data.repoUrl,
    submittedAt: new Date().toISOString(),
  };

  activeSubmissions.unshift(newSub);
  store.logAudit(actor, 'submit_team_project', 'team', data.teamId, `Submitted hackathon project "${newSub.title}"`);
  return newSub;
}
