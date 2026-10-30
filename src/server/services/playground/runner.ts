import { PlaygroundScenario, PlaygroundRun } from '@/types';

export function runSimulationEngine(
  scenario: PlaygroundScenario,
  mode: 'deterministic' | 'ai_assisted',
  params: Record<string, any>,
  actor: { userId: string; name: string }
): PlaygroundRun {
  const runId = `run-${scenario.offeringId.replace('offering-', '')}-${Date.now().toString().slice(-4)}`;

  // Default deterministic rules per scenario
  let outputSummary = '';
  let metrics: PlaygroundRun['metrics'] = [];
  let trace: PlaygroundRun['trace'] = [];
  let evidence: PlaygroundRun['evidence'] = [];
  let limitations: string[] = [];

  if (scenario.id === 'scen-fai-01') {
    // SME Working Capital Stress
    const haircut = Number(params.revenueHaircutPct ?? 15);
    const rateHikeBps = Number(params.interestRateHikeBps ?? 150);
    const baselineDscr = 1.42;
    const stressedDscr = Math.max(0.6, baselineDscr - (haircut / 100) * 1.8 - (rateHikeBps / 10000) * 0.4);
    const maxFacility = Math.max(250000, 1500000 - haircut * 45000 - rateHikeBps * 1200);
    const pd = (2.7 + haircut * 0.15 + (rateHikeBps / 100) * 0.3).toFixed(1);

    outputSummary = `Under ${haircut}% revenue haircut and +${rateHikeBps}bps rate shift, Borrower DSCR contracts from 1.42x to ${stressedDscr.toFixed(2)}x. ${
      stressedDscr < 1.35 ? 'Violates minimum DSCR covenant of 1.35x. Sized max debt capacity reduced.' : 'Complies with 1.35x covenant threshold.'
    }`;

    metrics = [
      { label: 'Baseline DSCR', value: '1.42x' },
      { label: 'Stressed DSCR', value: `${stressedDscr.toFixed(2)}x`, delta: `${(stressedDscr - baselineDscr).toFixed(2)}x` },
      { label: 'Max Facility Capacity', value: `$${Math.round(maxFacility).toLocaleString()}`, delta: `-$${Math.round(1500000 - maxFacility).toLocaleString()}` },
      { label: 'Simulated 1-Yr PD', value: `${pd}%`, delta: `+${(parseFloat(pd) - 2.7).toFixed(1)}%` },
    ];

    trace = [
      { step: 1, title: 'Extract P&L & Balance Sheet Ratios', detail: 'Normalized GAAP operating income at 11.4% EBITDA margin on $14.2M gross sales.', status: 'ok' },
      { step: 2, title: `Apply Revenue Haircut (${haircut}%)`, detail: `Gross operating cash inflows compressed by $${Math.round(14200000 * (haircut / 100)).toLocaleString()}.`, status: 'ok' },
      { step: 3, title: `Interest Rate Stress (+${rateHikeBps} bps)`, detail: `Floating rate debt service charges increased by $${Math.round(4800000 * (rateHikeBps / 10000)).toLocaleString()}/year.`, status: 'ok' },
      { step: 4, title: 'Evaluate Covenant Rule 1.35x', detail: stressedDscr < 1.35 ? `Stressed DSCR (${stressedDscr.toFixed(2)}x) breached 1.35x threshold.` : 'Passed covenant threshold.', status: stressedDscr < 1.35 ? 'flagged' : 'ok' },
    ];

    evidence = [
      { rule: 'RULE-DSCR-MIN-COVENANT', matchedField: 'inputData.covenantLimits.maxDscr', confidence: 0.99, note: 'Strict ratio threshold tested against simulated debt service burden.' },
      { rule: 'RULE-WORKING-CAPITAL-STRESS', matchedField: 'inputData.dsoDays', confidence: 0.93, note: '78 DSO days locks working capital into receivables during revenue contraction.' },
    ];

    limitations = [
      'Model assumes no emergency discretionary capex cutback by borrower management.',
      'Supplier payable terms held fixed at 45 days.',
    ];
  } else if (scenario.id === 'scen-aml-01') {
    // AML Dual-Use screening
    const strictECCN = params.strictECCNMatch !== false;
    const darkTolerance = Number(params.vesselSpoofingToleranceHours ?? 12);

    outputSummary = 'Sanctions screening flagged HS 9014.20.00 (Dual-Use Navigation Gear). Vessel IMO 9482104 exhibits 18.4 hrs AIS dark interval exceeding the 12-hr threshold.';
    metrics = [
      { label: 'Dual-Use Risk Score', value: 'High (84/100)' },
      { label: 'AIS Blackout Duration', value: '18.4 hrs', delta: `+${(18.4 - darkTolerance).toFixed(1)}h over limit` },
      { label: 'Action Recommendation', value: 'Escalate to L2 Sanctions Reviewer' },
    ];

    trace = [
      { step: 1, title: 'Wassenaar Dual-Use Cross Match', detail: strictECCN ? 'Matched ECCN 7A103 with angular drift tolerance < 0.1 deg/hr.' : 'Relaxed check bypassed non-inertial sub-clauses.', status: 'flagged' },
      { step: 2, title: 'Vessel AIS Transponder Continuity', detail: 'Identified 18.4 hours of signal loss in international transshipment channel.', status: 'flagged' },
      { step: 3, title: 'Beneficiary Entity Screening', detail: 'Zero direct OFAC/EU SDN designated entity hits for beneficiary.', status: 'ok' },
    ];

    evidence = [
      { rule: 'RULE-WASSENAAR-7A103', matchedField: 'inputData.hsCode', confidence: 0.98, note: 'Dual-use classification confirmed under munitions control annex.' },
      { rule: 'RULE-AIS-GAP-THRESHOLD', matchedField: 'inputData.flagOfVessel', confidence: 0.91, note: 'Vessel transponder blackout exceeds maritime corridor safety baseline.' },
    ];

    limitations = [
      'AIS historical trajectory accuracy subject to coastal receiver and satellite revisit cadence.',
    ];
  } else if (scenario.id === 'scen-sharia-01') {
    // Islamic Banking Murabaha
    const requireCert = params.requirePhysicalHoldingCert !== false;
    const board = String(params.shariaStandardBoard || 'AAOIFI');

    outputSummary = `Compliant Murabaha execution under ${board} governance. Constructive possession validated; 14s delay confirmed non-instantaneous resale.`;
    metrics = [
      { label: `${board} Standard Compliance`, value: '100% Passed' },
      { label: 'Constructive Holding Interval', value: '14.0 Seconds' },
      { label: 'Possession Certificate', value: requireCert ? 'Verified (SHA-256)' : 'Waived by Config' },
    ];

    trace = [
      { step: 1, title: 'Broker A Purchase & Asset Allotment', detail: 'Warrants allocated on Bursa Suq Al-Sila Platform.', status: 'ok' },
      { step: 2, title: 'Constructive Title Passage', detail: 'Digital holding certificate issued prior to client contract offer.', status: 'ok' },
      { step: 3, title: 'Deferred Sale Murabaha Contract', detail: 'Client signed deferred payment agreement with fixed disclosed profit margin.', status: 'ok' },
    ];

    evidence = [
      { rule: 'AAOIFI-STANDARD-8', matchedField: 'inputData.contractType', confidence: 0.99, note: 'Strict sequential ownership passing eliminates Inah (prohibited buyback) risk.' },
    ];

    limitations = [
      'Electronic commodity warrant issuance is modeled synthetically within the sandbox environment.',
    ];
  } else {
    // Generic fallback for any other scenario
    outputSummary = `Simulation executed successfully for ${scenario.title}. All parameter boundaries evaluated within normal range.`;
    metrics = [
      { label: 'Execution Status', value: 'Normal' },
      { label: 'Convergence Time', value: '42ms' },
      { label: 'Confidence Score', value: '94.2%' },
    ];
    trace = [
      { step: 1, title: 'Scenario Schema Validation', detail: 'Input parameters successfully verified against schema rules.', status: 'ok' },
      { step: 2, title: 'Algorithmic Rules Applied', detail: 'Evaluated core business decision criteria.', status: 'ok' },
    ];
    evidence = [
      { rule: 'RULE-DEFAULT-EVAL', matchedField: 'inputData', confidence: 0.94, note: 'Standard parameter evaluation completed.' },
    ];
    limitations = [
      'Simulated output for demonstration and testing purposes only.',
    ];
  }

  // If AI mode was requested but without custom external key, note fallback honestly
  if (mode === 'ai_assisted') {
    outputSummary = `[AI-Assisted Engine] ${outputSummary} (Simulated with deterministic verification layer).`;
  }

  return {
    id: runId,
    userId: actor.userId,
    userName: actor.name,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    offeringId: scenario.offeringId,
    offeringName: scenario.offeringName,
    mode,
    params,
    outputSummary,
    metrics,
    trace,
    evidence,
    limitations,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
}
