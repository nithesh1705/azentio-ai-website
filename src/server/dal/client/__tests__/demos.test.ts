import { describe, it, expect, beforeEach } from 'vitest';
import {
  getClientDemos,
  getClientDemoById,
  runDemo,
  getDemoRuns,
  getDemoRunById,
  saveScenario,
  getSavedScenarios,
  submitDemoFeedback,
} from '../demos';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Demos DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const abcdActor: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  const xyzActor: Actor = {
    userId: 'usr-client-dhoni',
    email: 'dhoni.ms@xyz.com',
    name: 'MS Dhoni',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [{ orgId: 'org-xyz', role: 'client_admin', status: 'active' }],
    platformGrants: [],
  };

  it('filters demos according to tenant entitlements', () => {
    // org-abcd has offering-fai, offering-cbe, offering-aml (NOT offering-dls)
    const demos = getClientDemos(abcdActor);
    const demoIds = demos.map((d) => d.id);
    expect(demoIds).toContain('demo-fai');
    expect(demoIds).toContain('demo-aml');
    expect(demoIds).toContain('demo-cbe');
    expect(demoIds).not.toContain('demo-dls');

    // Accessing unentitled demo throws error
    expect(() => getClientDemoById(abcdActor, 'demo-dls')).toThrow('not entitled');
  });

  it('executes a simulation run and isolates it strictly to active tenant', async () => {
    const run = await runDemo(abcdActor, {
      demoId: 'demo-fai',
      scenarioId: 'scen-fai-rateshock',
      mode: 'deterministic',
      params: { rateHikeBps: 250, costInflationPct: 10.0 },
    });

    expect(run.id).toBeDefined();
    expect(run.orgId).toBe('org-abcd');
    expect(run.userId).toBe('usr-client-virat');
    expect(run.metrics.length).toBeGreaterThan(0);
    expect(run.evidence.length).toBeGreaterThan(0);

    // ABCD actor can retrieve it
    const abcdRuns = getDemoRuns(abcdActor);
    expect(abcdRuns.some((r) => r.id === run.id)).toBe(true);

    // XYZ actor CANNOT retrieve it (Cross-tenant leak prevention)
    const xyzRuns = getDemoRuns(xyzActor);
    expect(xyzRuns.some((r) => r.id === run.id)).toBe(false);
    expect(() => getDemoRunById(xyzActor, run.id)).toThrow('access denied');
  });

  it('supports saving customized scenarios with shareScope enforcement', () => {
    const privateSaved = saveScenario(abcdActor, {
      name: 'Private Test Case',
      scenarioId: 'scen-fai-rateshock',
      scenarioTitle: 'Rate Shock',
      params: { rateHikeBps: 350 },
      shareScope: 'private',
    });

    const orgSaved = saveScenario(abcdActor, {
      name: 'Org Shared Baseline',
      scenarioId: 'scen-fai-rateshock',
      scenarioTitle: 'Rate Shock',
      params: { rateHikeBps: 150 },
      shareScope: 'org',
    });

    // Author sees both
    const abcdList = getSavedScenarios(abcdActor);
    expect(abcdList.some((s) => s.id === privateSaved.id)).toBe(true);
    expect(abcdList.some((s) => s.id === orgSaved.id)).toBe(true);

    // Another colleague in org-abcd sees org-scoped one
    const colleagueActor: Actor = {
      ...abcdActor,
      userId: 'usr-client-colleague',
    };
    const colleagueList = getSavedScenarios(colleagueActor);
    expect(colleagueList.some((s) => s.id === orgSaved.id)).toBe(true);
    expect(colleagueList.some((s) => s.id === privateSaved.id)).toBe(false);
  });

  it('records feedback against a completed run', async () => {
    const run = await runDemo(abcdActor, {
      demoId: 'demo-fai',
      scenarioId: 'scen-fai-rateshock',
      mode: 'ai_assisted',
      params: { rateHikeBps: 150 },
    });

    const feedback = submitDemoFeedback(abcdActor, {
      runId: run.id,
      rating: 5,
      isCorrect: 'yes',
      comments: 'Simulation perfectly captured our credit exposure sensitivity.',
    });

    expect(feedback.runId).toBe(run.id);
    expect(feedback.rating).toBe(5);
  });
});

