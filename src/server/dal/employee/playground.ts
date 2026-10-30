import { Actor, PlaygroundScenario, PlaygroundRun, PlaygroundFeedback, Offering } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_PLAYGROUND_SCENARIOS, SEED_PLAYGROUND_RUNS } from './seed_employee';
import { runSimulationEngine } from '@/server/services/playground/runner';
import { store } from '@/server/dal/store';

// In-memory runtime cache for runs and feedback
let activePlaygroundRuns: PlaygroundRun[] = [...SEED_PLAYGROUND_RUNS];
let activePlaygroundFeedbacks: PlaygroundFeedback[] = [
  {
    id: 'fb-01',
    runId: 'run-fai-801',
    userId: 'usr-employee-1',
    rating: 5,
    correctness: 'yes',
    workedWell: 'The DSCR covenant breakdown matched our Excel credit models perfectly.',
    issuesFound: 'Would be helpful to also calculate interest coverage ratio (ICR) alongside DSCR.',
    tags: ['DSCR', 'Credit Analysis', 'Accuracy'],
    submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    editableUntil: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
  },
];

export function getPlaygroundOfferings(actor: Actor): Offering[] {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  return store.offerings;
}

export function getPlaygroundScenarios(actor: Actor, offeringId?: string): PlaygroundScenario[] {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  if (offeringId) {
    return SEED_PLAYGROUND_SCENARIOS.filter((s) => s.offeringId === offeringId);
  }
  return SEED_PLAYGROUND_SCENARIOS;
}

export function getPlaygroundScenarioById(actor: Actor, scenarioId: string): PlaygroundScenario | undefined {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  return SEED_PLAYGROUND_SCENARIOS.find((s) => s.id === scenarioId);
}

export function executePlaygroundRun(
  actor: Actor,
  input: {
    scenarioId: string;
    mode: 'deterministic' | 'ai_assisted';
    params: Record<string, any>;
  }
): PlaygroundRun {
  const auth = authorize(actor, 'create', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const scenario = SEED_PLAYGROUND_SCENARIOS.find((s) => s.id === input.scenarioId);
  if (!scenario) throw new Error(`Scenario "${input.scenarioId}" not found`);

  const run = runSimulationEngine(scenario, input.mode, input.params, {
    userId: actor.userId,
    name: actor.name,
  });

  activePlaygroundRuns.unshift(run);

  // Audit event
  store.logAudit(
    actor,
    'execute_run',
    'playground',
    run.id,
    `Executed ${input.mode} run on scenario "${scenario.title}"`
  );

  return run;
}

export function getPlaygroundRuns(actor: Actor): PlaygroundRun[] {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  // Return all employee runs (quarantined to employee audience)
  return activePlaygroundRuns;
}

export function getPlaygroundRunById(actor: Actor, runId: string): PlaygroundRun | undefined {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  return activePlaygroundRuns.find((r) => r.id === runId);
}

export function deletePlaygroundRun(actor: Actor, runId: string): boolean {
  const run = activePlaygroundRuns.find((r) => r.id === runId);
  if (!run) return false;

  const auth = authorize(actor, 'delete', {
    kind: 'playground',
    audience: 'employee',
    authorId: run.userId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  activePlaygroundRuns = activePlaygroundRuns.filter((r) => r.id !== runId);
  store.logAudit(actor, 'delete_run', 'playground', runId, `Deleted run ${runId}`);
  return true;
}

export function submitPlaygroundFeedback(
  actor: Actor,
  feedback: {
    runId: string;
    rating: number;
    correctness: 'yes' | 'partly' | 'no';
    workedWell: string;
    issuesFound: string;
    tags: string[];
  }
): PlaygroundFeedback {
  const auth = authorize(actor, 'create', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const existingIndex = activePlaygroundFeedbacks.findIndex(
    (fb) => fb.runId === feedback.runId && fb.userId === actor.userId
  );

  const newFeedback: PlaygroundFeedback = {
    id: `fb-${Date.now().toString().slice(-5)}`,
    runId: feedback.runId,
    userId: actor.userId,
    rating: feedback.rating,
    correctness: feedback.correctness,
    workedWell: feedback.workedWell,
    issuesFound: feedback.issuesFound,
    tags: feedback.tags,
    submittedAt: new Date().toISOString(),
    editableUntil: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Editable for 24h
  };

  if (existingIndex >= 0) {
    // Check if within 24h
    const current = activePlaygroundFeedbacks[existingIndex];
    if (new Date() > new Date(current.editableUntil)) {
      throw new Error('Feedback is locked after 24 hours.');
    }
    activePlaygroundFeedbacks[existingIndex] = newFeedback;
  } else {
    activePlaygroundFeedbacks.unshift(newFeedback);
  }

  store.logAudit(
    actor,
    'submit_feedback',
    'playground',
    feedback.runId,
    `Submitted rating ${feedback.rating}/5 for run ${feedback.runId}`
  );

  return newFeedback;
}

export function getPlaygroundFeedback(actor: Actor, runId: string): PlaygroundFeedback | undefined {
  const auth = authorize(actor, 'read', { kind: 'playground', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  return activePlaygroundFeedbacks.find((fb) => fb.runId === runId);
}
