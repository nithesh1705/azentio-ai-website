import { Actor, ClientDemo, DemoScenario, DemoRun, SavedScenario, DemoFeedback } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';

// Master catalog of client interactive demos
export const SEED_CLIENT_DEMOS: ClientDemo[] = [
  {
    id: 'demo-fai',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    name: 'SME Portfolio Stress & Liquidity Simulation',
    description:
      'Evaluate simulated macro rate shocks, post-holiday seasonality adjustments, and working capital compression across synthetic SME borrower cohorts.',
    category: 'Intelligence',
    synthetic: true,
    scenarios: [
      {
        id: 'scen-fai-rateshock',
        demoId: 'demo-fai',
        title: 'Interest Rate Spike (+200 bps) & Margin Squeeze',
        description:
          'Simulate cash flow coverage ratio (DSCR) impact when borrowing costs surge 200 bps against fixed-price sales contracts.',
        difficulty: 'Intermediate',
        inputData: {
          borrowerCohort: 'Synthetic ASEAN SME Exporters (n=250)',
          baseDSCR: 1.65,
          seasonalityFactor: 'Normal',
        },
        parameters: [
          {
            key: 'rateHikeBps',
            label: 'Benchmark Rate Shock (basis points)',
            type: 'number',
            default: 200,
          },
          {
            key: 'costInflationPct',
            label: 'Input Cost Inflation (%)',
            type: 'number',
            default: 8.5,
          },
          {
            key: 'stressPeriodMonths',
            label: 'Stress Horizon (Months)',
            type: 'select',
            default: '12',
            options: ['6', '12', '24'],
          },
          {
            key: 'hedgingActive',
            label: 'Include Synthetic FX/Interest Hedging',
            type: 'boolean',
            default: false,
          },
        ],
      },
      {
        id: 'scen-fai-seasonality',
        demoId: 'demo-fai',
        title: 'Seasonal Inventory Drawdown vs Distress Flag',
        description:
          'Benchmark our federated seasonal classifier to differentiate legitimate post-Q4 liquidity dips from genuine distress.',
        difficulty: 'Beginner',
        inputData: {
          borrowerCohort: 'Synthetic Retail & Wholesale Traders (n=120)',
          cyclicalMonth: 'February',
        },
        parameters: [
          {
            key: 'inventoryHoldWeeks',
            label: 'Average Inventory Holding Days',
            type: 'number',
            default: 65,
          },
          {
            key: 'receivableLagDays',
            label: 'DSO (Days Sales Outstanding)',
            type: 'number',
            default: 72,
          },
        ],
      },
    ],
  },
  {
    id: 'demo-aml',
    offeringId: 'offering-aml',
    offeringName: 'AML & Compliance Copilot',
    name: 'Cross-Border Layering & Synthetic SAR Assistant',
    description:
      'Simulate high-velocity multi-jurisdictional SWIFT wire clustering, anomaly score calculation, and automated SAR narrative generation.',
    category: 'Compliance',
    synthetic: true,
    scenarios: [
      {
        id: 'scen-aml-layering',
        demoId: 'demo-aml',
        title: 'Rapid Wire Fan-Out Across High-Risk Corridors',
        description:
          'Single synthetic corporate originator splitting $1.2M across 18 offshore beneficiary accounts within a 3-hour window.',
        difficulty: 'Advanced',
        inputData: {
          txCount: 18,
          totalVolumeUSD: 1200000,
          sourceCorridor: 'Synthetic Financial Centre SG',
        },
        parameters: [
          {
            key: 'velocityThresholdHours',
            label: 'Velocity Aggregation Window (Hours)',
            type: 'number',
            default: 3,
          },
          {
            key: 'structuringAmountCeiling',
            label: 'Threshold Filter (USD)',
            type: 'number',
            default: 10000,
          },
          {
            key: 'strictFATFList',
            label: 'Apply Enhanced FATF Grey List Corridors',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  },
  {
    id: 'demo-cbe',
    offeringId: 'offering-cbe',
    offeringName: 'Core Banking Engine (Amlak/Kastle)',
    name: 'Overnight Batch Settlement & Ledger Resiliency',
    description:
      'Simulate high-volume batch interest accrual, tiered overdraft postings, and concurrent retail balance reconciliations.',
    category: 'Banking',
    synthetic: true,
    scenarios: [
      {
        id: 'scen-cbe-batch',
        demoId: 'demo-cbe',
        title: '50,000 Synthetic Posting Stress Benchmark',
        description:
          'Measure end-of-day ledger throughput, concurrency lock resolution, and simulated multi-currency balance validation.',
        difficulty: 'Intermediate',
        inputData: {
          ledgerAccounts: 15000,
          postingsToExecute: 50000,
        },
        parameters: [
          {
            key: 'batchSize',
            label: 'Batch Chunk Size',
            type: 'number',
            default: 5000,
          },
          {
            key: 'failoverSimulation',
            label: 'Simulate Secondary Node Failover Mid-Run',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  },
  {
    id: 'demo-dls',
    offeringId: 'offering-dls',
    offeringName: 'Digital Lending Suite',
    name: 'Autonomous Trade Finance Document Parsing',
    description:
      'Reconcile synthetic bills of lading, certificates of origin, and commercial invoices against ICC UCP 600 validation criteria.',
    category: 'Lending',
    synthetic: true,
    scenarios: [
      {
        id: 'scen-dls-lc',
        demoId: 'demo-dls',
        title: 'Letter of Credit Discrepancy & Signature Validation',
        description:
          'Audit synthetic commercial invoice against LC terms with multi-lingual OCR discrepancy highlights.',
        difficulty: 'Intermediate',
        inputData: {
          lcValue: '$450,000 USD',
          tenor: '90 Days Sight',
          goodsDescription: 'Synthetic Raw Palm Kernel Oil (2,000 MT)',
        },
        parameters: [
          {
            key: 'tolerancePct',
            label: 'Permitted Tolerance (%)',
            type: 'number',
            default: 5,
          },
          {
            key: 'partialShipmentAllowed',
            label: 'Allow Partial Shipments',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  },
];

// In-Memory state for runs, saved scenarios, feedback
let demoRuns: DemoRun[] = [
  {
    id: 'run-seeded-01',
    orgId: 'org-abcd',
    userId: 'usr-client-virat',
    userName: 'Virat Kohli',
    demoId: 'demo-fai',
    scenarioId: 'scen-fai-rateshock',
    scenarioTitle: 'Interest Rate Spike (+200 bps) & Margin Squeeze',
    mode: 'deterministic',
    params: { rateHikeBps: 200, costInflationPct: 8.5, stressPeriodMonths: '12', hedgingActive: false },
    outputSummary: 'Simulation completed: 34 of 250 SME borrowers breached DSCR covenant (<1.10x). Average portfolio DSCR compressed from 1.65x to 1.18x.',
    metrics: [
      { label: 'Covenant Breach Rate', value: '13.6%', delta: '+8.4%' },
      { label: 'Post-Shock Median DSCR', value: '1.18x', delta: '-0.47x' },
      { label: 'Estimated Liquidity Gap', value: '$4.2M', delta: 'Synthetic' },
    ],
    trace: [
      { step: 1, title: 'Dataset Ingestion', detail: 'Loaded 250 synthetic ASEAN SME balance sheets', status: 'ok' },
      { step: 2, title: 'Rate Shock Curve Application', detail: '+200 bps applied across floating rate facilities', status: 'ok' },
      { step: 3, title: 'Covenant Stress Evaluation', detail: 'Identified 34 entities below 1.10x threshold', status: 'flagged' },
      { step: 4, title: 'Portfolio Resilience Aggregation', detail: 'Output compiled with zero tenant cross-contamination', status: 'ok' },
    ],
    evidence: [
      { rule: 'DSCR < 1.10x Threshold', matchedField: 'debt_service_coverage', confidence: 0.98, note: 'Deterministic mathematical calculation' },
      { rule: 'Working Capital Cycle > 90d', matchedField: 'cash_conversion_cycle', confidence: 0.94, note: 'Synthetic operational parameter match' },
    ],
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let savedScenarios: SavedScenario[] = [
  {
    id: 'saved-01',
    orgId: 'org-abcd',
    userId: 'usr-client-virat',
    userName: 'Virat Kohli',
    name: 'Severe 2026 Bear Market Stress Case',
    scenarioId: 'scen-fai-rateshock',
    scenarioTitle: 'Interest Rate Spike (+200 bps) & Margin Squeeze',
    params: { rateHikeBps: 300, costInflationPct: 12.0, stressPeriodMonths: '24', hedgingActive: false },
    shareScope: 'org',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let demoFeedbacks: DemoFeedback[] = [];

/**
 * Get all entitled demos for the active tenant
 */
export function getClientDemos(actor: Actor): ClientDemo[] {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to view entitled demos.');
  }

  const decision = authorize(actor, 'read', {
    kind: 'demo',
    audience: 'tenant',
    orgId: actor.activeTenantId,
  });

  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  const tenant = store.organisations.find((o) => o.id === actor.activeTenantId);
  if (!tenant) {
    throw new Error(`Tenant not found: ${actor.activeTenantId}`);
  }

  // Strictly filter by entitled offerings
  return SEED_CLIENT_DEMOS.filter((demo) =>
    tenant.entitledOfferings.includes(demo.offeringId)
  );
}

/**
 * Get single demo by ID ensuring tenant entitlement
 */
export function getClientDemoById(actor: Actor, demoId: string): ClientDemo {
  const demos = getClientDemos(actor);
  const demo = demos.find((d) => d.id === demoId);
  if (!demo) {
    throw new Error(`Demo not found or not entitled under this workspace: ${demoId}`);
  }
  return demo;
}

/**
 * Run a demo scenario (simulated deterministic or AI-assisted execution)
 */
export async function runDemo(
  actor: Actor,
  input: {
    demoId: string;
    scenarioId: string;
    mode: 'deterministic' | 'ai_assisted';
    params: Record<string, any>;
  }
): Promise<DemoRun> {
  const demo = getClientDemoById(actor, input.demoId);
  const scenario = demo.scenarios.find((s) => s.id === input.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${input.scenarioId}`);
  }

  // Simulate execution telemetry
  const rateShock = Number(input.params.rateHikeBps || 200);
  const inflation = Number(input.params.costInflationPct || 8.0);
  const isHighRisk = rateShock > 250 || inflation > 10;

  const run: DemoRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orgId: actor.activeTenantId!,
    userId: actor.userId,
    userName: actor.name,
    demoId: demo.id,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    mode: input.mode,
    params: input.params,
    outputSummary: `${input.mode === 'ai_assisted' ? 'Agentic AI analysis' : 'Deterministic stress model'} evaluated synthetic cohort against ${rateShock} bps shock and ${inflation}% input inflation. Result: ${isHighRisk ? 'Elevated portfolio vulnerability detected with multiple cluster breaches' : 'Moderate portfolio resilience with safe liquidity buffers'}.`,
    metrics: [
      {
        label: 'Covenant Breach Rate',
        value: `${(rateShock * 0.06 + inflation * 0.4).toFixed(1)}%`,
        delta: isHighRisk ? '+12.4%' : '+4.2%',
      },
      {
        label: 'Post-Shock DSCR',
        value: `${Math.max(0.92, 1.65 - rateShock * 0.0018 - inflation * 0.02).toFixed(2)}x`,
        delta: isHighRisk ? '-0.55x' : '-0.25x',
      },
      {
        label: 'Simulated Liquidity Gap',
        value: `$${(rateShock * 0.025 + inflation * 0.15).toFixed(1)}M`,
        delta: 'Synthetic only',
      },
    ],
    trace: [
      { step: 1, title: 'Synthetic Ingestion', detail: `Parsed input parameters: ${JSON.stringify(input.params)}`, status: 'ok' },
      { step: 2, title: 'Macro Sensitivity Curve', detail: `Interpolated ${rateShock} bps shift across yield matrix`, status: 'ok' },
      { step: 3, title: 'Risk Boundary Evaluation', detail: isHighRisk ? 'Flagged anomalous concentration in export receivables' : 'All parameters within baseline thresholds', status: isHighRisk ? 'flagged' : 'ok' },
      { step: 4, title: 'Verifiable Evidence Synthesis', detail: 'Compiled explainable rule weights with zero cross-tenant contamination', status: 'ok' },
    ],
    evidence: [
      {
        rule: 'Rate Shock Sensitivity Curve',
        matchedField: 'rateHikeBps',
        confidence: input.mode === 'ai_assisted' ? 0.96 : 1.0,
        note: 'Calculated via deterministic stress equation against synthetic balance sheet cohort.',
      },
      {
        rule: 'Working Capital Coverage',
        matchedField: 'costInflationPct',
        confidence: 0.92,
        note: 'Derived from historical baseline cash flow distributions in synthetic test set.',
      },
    ],
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  demoRuns.unshift(run);

  store.logAudit(
    actor,
    'execute_demo_run',
    'demo',
    run.id,
    `Executed ${run.scenarioTitle} in ${input.mode} mode for org ${actor.activeTenantId}`
  );

  return run;
}

/**
 * Get previous runs strictly scoped to the active tenant
 */
export function getDemoRuns(actor: Actor, demoId?: string): DemoRun[] {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to view demo runs.');
  }

  let runs = demoRuns.filter((r) => r.orgId === actor.activeTenantId);
  if (demoId) {
    runs = runs.filter((r) => r.demoId === demoId);
  }
  return runs;
}

/**
 * Get single demo run by ID scoped to active tenant
 */
export function getDemoRunById(actor: Actor, runId: string): DemoRun {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required.');
  }

  const run = demoRuns.find((r) => r.id === runId && r.orgId === actor.activeTenantId);
  if (!run) {
    throw new Error(`Run not found or access denied for tenant ${actor.activeTenantId}`);
  }
  return run;
}

/**
 * Save customized scenario parameters
 */
export function saveScenario(
  actor: Actor,
  input: {
    name: string;
    scenarioId: string;
    scenarioTitle: string;
    params: Record<string, any>;
    shareScope: 'private' | 'org';
  }
): SavedScenario {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to save scenario.');
  }

  const saved: SavedScenario = {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orgId: actor.activeTenantId,
    userId: actor.userId,
    userName: actor.name,
    name: input.name,
    scenarioId: input.scenarioId,
    scenarioTitle: input.scenarioTitle,
    params: input.params,
    shareScope: input.shareScope,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  savedScenarios.unshift(saved);

  store.logAudit(
    actor,
    'save_scenario',
    'saved_scenario',
    saved.id,
    `Saved scenario "${saved.name}" with shareScope ${saved.shareScope}`
  );

  return saved;
}

/**
 * Get saved scenarios visible to this actor in their active tenant
 */
export function getSavedScenarios(actor: Actor, scenarioId?: string): SavedScenario[] {
  if (!actor.activeTenantId) {
    return [];
  }

  let items = savedScenarios.filter(
    (s) =>
      s.orgId === actor.activeTenantId &&
      (s.shareScope === 'org' || s.userId === actor.userId)
  );

  if (scenarioId) {
    items = items.filter((s) => s.scenarioId === scenarioId);
  }
  return items;
}

/**
 * Submit feedback on a demo run
 */
export function submitDemoFeedback(
  actor: Actor,
  input: {
    runId: string;
    rating: number;
    isCorrect: 'yes' | 'partly' | 'no';
    comments: string;
  }
): DemoFeedback {
  // Ensure run exists and belongs to this tenant
  const run = getDemoRunById(actor, input.runId);

  const fb: DemoFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    runId: run.id,
    userId: actor.userId,
    rating: input.rating,
    isCorrect: input.isCorrect,
    comments: input.comments,
    submittedAt: new Date().toISOString(),
  };

  demoFeedbacks.unshift(fb);
  return fb;
}

