import {
  PlaygroundScenario,
  PlaygroundRun,
  PlaygroundFeedback,
  LiveSession,
  LiveComment,
  Experiment,
  ExperimentJoinRequest,
  ExperimentComment,
  InternalReleaseNote,
  KnowledgeItem,
  KnowledgeVersion,
  KnowledgeFeedback,
  EmployeeTeam,
  TeamNote,
  TeamSubmission,
} from '@/types';

// ============================================================================
// 1. PLAYGROUND SCENARIOS (Synthetic Enterprise Scenarios)
// ============================================================================
export const SEED_PLAYGROUND_SCENARIOS: PlaygroundScenario[] = [
  {
    id: 'scen-fai-01',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    title: 'SME Working Capital Stress & Debt Service Anomaly',
    description: 'Evaluate a mid-market manufacturing borrower undergoing a 24% revenue slowdown with increasing receivables lag.',
    difficulty: 'Intermediate',
    tags: ['Credit Analysis', 'Cash Flow', 'SME', 'Stress Testing'],
    synthetic: true,
    inputData: {
      borrower: 'Azentio SynthMfg Ltd (Singapore)',
      industry: 'Precision Engineering & Component Assembly',
      annualRevenueUSD: 14200000,
      ebitdaMarginPct: 11.4,
      existingDebtUSD: 4800000,
      currentRatio: 1.15,
      quickRatio: 0.82,
      dsoDays: 78,
      inventoryTurnover: 4.2,
      requestedFacilityUSD: 1500000,
      proposedTenorMonths: 36,
      covenantLimits: {
        maxDscr: 1.35,
        maxLeverage: 3.5,
      },
    },
    parameters: [
      {
        key: 'revenueHaircutPct',
        label: 'Simulated Stress Haircut on Revenue (%)',
        type: 'number',
        default: 15,
      },
      {
        key: 'interestRateHikeBps',
        label: 'Base Rate Shift (Basis Points)',
        type: 'number',
        default: 150,
      },
      {
        key: 'auditVerificationStrictness',
        label: 'Accounting Rigor Threshold',
        type: 'select',
        default: 'Standard',
        options: ['Relaxed', 'Standard', 'Forensic'],
      },
    ],
  },
  {
    id: 'scen-fai-02',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    title: 'Commercial Real Estate Cap-Rate Shift & Refinancing Risk',
    description: 'Model refinancing covenants for commercial office portfolio facing rising vacancy and floating rate debt maturity.',
    difficulty: 'Advanced',
    tags: ['Real Estate', 'Refinancing', 'Cap Rate', 'LTV'],
    synthetic: true,
    inputData: {
      borrower: 'Meridian Capital Properties SPE-4',
      assetType: 'Grade-B Commercial Office (140,000 sq ft)',
      grossAssetValueUSD: 38500000,
      netOperatingIncomeUSD: 2450000,
      currentOccupancyPct: 84.5,
      maturingMortgageUSD: 25000000,
      currentCapRatePct: 6.36,
      projectedExitCapPct: 7.25,
    },
    parameters: [
      {
        key: 'vacancyIncreasePct',
        label: 'Additional Vacancy Shock (%)',
        type: 'number',
        default: 8,
      },
      {
        key: 'refinanceSpreadBps',
        label: 'Refinancing Margin Over SOFR (bps)',
        type: 'number',
        default: 275,
      },
    ],
  },
  {
    id: 'scen-sharia-01',
    offeringId: 'offering-isb',
    offeringName: 'Islamic Banking & Sharia Compliance AI',
    title: 'Murabaha Facility Mark-up & Asset Title Passage Verification',
    description: 'Verify sequential compliance steps for commodity Murabaha transactions to ensure zero constructive ownership violation.',
    difficulty: 'Beginner',
    tags: ['Islamic Banking', 'Murabaha', 'AAOIFI', 'Compliance'],
    synthetic: true,
    inputData: {
      contractType: 'Commodity Murabaha (Tawwaruq)',
      brokerA: 'Bursa Suq Al-Sila Platform',
      brokerB: 'International Commodity Trading House',
      assetClass: 'Crude Palm Oil (Warrants)',
      notionalAmountUSD: 5000000,
      possessionLagSeconds: 14,
      dualAgentSigned: false,
    },
    parameters: [
      {
        key: 'requirePhysicalHoldingCert',
        label: 'Require Explicit Holding Certificate',
        type: 'boolean',
        default: true,
      },
      {
        key: 'shariaStandardBoard',
        label: 'Governing Standard Board',
        type: 'select',
        default: 'AAOIFI',
        options: ['AAOIFI', 'BNM SAC', 'UAE Central Bank HAS'],
      },
    ],
  },
  {
    id: 'scen-aml-01',
    offeringId: 'offering-aml',
    offeringName: 'Trade Finance AML & Dual-Use Screening',
    title: 'Letter of Credit Discrepancy & High-Risk Dual-Use Cargo',
    description: 'Scan bill of lading and customs manifests for maritime transshipment deviations and dual-use aerospace component codes.',
    difficulty: 'Intermediate',
    tags: ['Trade Finance', 'Sanctions', 'AML', 'Dual-Use Goods'],
    synthetic: true,
    inputData: {
      lcNumber: 'LC-AZ-2026-88912',
      issuingBank: 'Gulf Meridian Commercial Bank',
      applicant: 'Al-Farah Logistics LLC (Dubai)',
      beneficiary: 'Nordic Sensor Dynamics AS',
      goodsDescription: 'Industrial telemetry gyroscopes and precision accelerometers',
      hsCode: '9014.20.00',
      portOfLoading: 'Rotterdam (NLRTM)',
      portOfDischarge: 'Jebel Ali (AEJEA)',
      flagOfVessel: 'Panama (IMO 9482104)',
      transshipmentFlag: true,
    },
    parameters: [
      {
        key: 'strictECCNMatch',
        label: 'Strict US/EU Dual-Use ECCN List Check',
        type: 'boolean',
        default: true,
      },
      {
        key: 'vesselSpoofingToleranceHours',
        label: 'AIS Dark Activity Detection Window (Hours)',
        type: 'number',
        default: 12,
      },
    ],
  },
  {
    id: 'scen-ins-01',
    offeringId: 'offering-ins',
    offeringName: 'Insurance Risk & Underwriting Copilot',
    title: 'Fleet Commercial Motor Claim Frequency Anomaly',
    description: 'Analyze telemetry and loss history for 450 commercial delivery vans with abnormal third-party liability surges.',
    difficulty: 'Intermediate',
    tags: ['Insurance', 'Underwriting', 'Loss Ratio', 'Telematics'],
    synthetic: true,
    inputData: {
      insuredParty: 'Apex Urban Logistics Pte Ltd',
      fleetSize: 450,
      vehicleTypes: ['EV Light Vans', 'Diesel 3.5T Box Trucks'],
      lossRatioThreeYearAvgPct: 78.4,
      harshBrakingPer1000Km: 14.2,
      nightTimeDrivingRatio: 0.38,
      annualGrossPremiumUSD: 890000,
    },
    parameters: [
      {
        key: 'telematicsPenaltyWeight',
        label: 'Telematics Score Weighting Factor (0 - 1.0)',
        type: 'number',
        default: 0.65,
      },
    ],
  },
];

// ============================================================================
// 2. PLAYGROUND RUNS (Past Synthetic Runs)
// ============================================================================
export const SEED_PLAYGROUND_RUNS: PlaygroundRun[] = [
  {
    id: 'run-fai-801',
    userId: 'usr-employee-1',
    userName: 'Nithesh M',
    scenarioId: 'scen-fai-01',
    scenarioTitle: 'SME Working Capital Stress & Debt Service Anomaly',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    mode: 'deterministic',
    params: {
      revenueHaircutPct: 15,
      interestRateHikeBps: 150,
      auditVerificationStrictness: 'Standard',
    },
    outputSummary: 'Under 15% revenue haircut, Borrower DSCR degrades from 1.42x to 1.08x, breaching covenant minimum (1.35x). Working capital gap expands by $420,000.',
    metrics: [
      { label: 'Baseline DSCR', value: '1.42x' },
      { label: 'Stressed DSCR', value: '1.08x', delta: '-0.34x' },
      { label: 'Max Facility Eligible', value: '$840,000', delta: '-$660,000' },
      { label: 'Probability of Default', value: '4.8%', delta: '+2.1%' },
    ],
    trace: [
      { step: 1, title: 'Input Parse & Ratio Normalization', detail: 'Ingested 36-month P&L and Balance Sheet; computed standard GAAP EBITDA margin 11.4%.', status: 'ok' },
      { step: 2, title: 'Revenue Shock Application', detail: 'Applied 15.0% haircut across quarterly revenue lines; fixed overheads held flat.', status: 'ok' },
      { step: 3, title: 'Covenant Evaluation Rule #104', detail: 'DSCR 1.08x fell below threshold 1.35x. Triggered conditional covenant flag.', status: 'flagged' },
      { step: 4, title: 'Mitigation Sizing', detail: 'Calculated maximum borrowing capacity that keeps post-shock DSCR >= 1.35x ($840k).', status: 'ok' },
    ],
    evidence: [
      { rule: 'RULE-DSCR-MIN-COVENANT', matchedField: 'inputData.covenantLimits.maxDscr', confidence: 0.99, note: 'Deterministic threshold calculation verified against facility agreement terms.' },
      { rule: 'RULE-WORKING-CAPITAL-STRESS', matchedField: 'inputData.dsoDays', confidence: 0.92, note: 'DSO of 78 days compounds working capital lockup when top-line contracts.' },
    ],
    limitations: [
      'Model assumes no discretionary capex reduction by borrower management.',
      'Supplier credit terms held at 45 days constant without renegotiation simulation.',
    ],
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'run-aml-802',
    userId: 'usr-employee-1',
    userName: 'Nithesh M',
    scenarioId: 'scen-aml-01',
    scenarioTitle: 'Letter of Credit Discrepancy & High-Risk Dual-Use Cargo',
    offeringId: 'offering-aml',
    offeringName: 'Trade Finance AML & Dual-Use Screening',
    mode: 'deterministic',
    params: {
      strictECCNMatch: true,
      vesselSpoofingToleranceHours: 12,
    },
    outputSummary: 'Suspicious HS Code match (9014.20.00: Aeronautical Inertial Navigation). Vessel IMO 9482104 has 2 recorded AIS blackout intervals in Strait of Hormuz.',
    metrics: [
      { label: 'Dual-Use Risk Index', value: 'High (84/100)' },
      { label: 'Vessel Dark Hours', value: '18.4 hrs', delta: '+6.4 hrs vs limit' },
      { label: 'Recommendation', value: 'Escalate to L2 Sanctions Officer' },
    ],
    trace: [
      { step: 1, title: 'HS Code Dual-Use Cross-Check', detail: 'Matched HS Code 9014.20 against Wassenaar Arrangement Dual-Use Annex 7A103.', status: 'flagged' },
      { step: 2, title: 'Maritime AIS History Scan', detail: 'Discovered transponder silence between 2026-02-14 and 2026-02-15.', status: 'flagged' },
      { step: 3, title: 'Sanctions List Matching', detail: 'Zero direct SDN list hits for applicant and beneficiary corporate entities.', status: 'ok' },
    ],
    evidence: [
      { rule: 'RULE-WASSENAAR-7A103', matchedField: 'inputData.hsCode', confidence: 0.96, note: 'Inertial equipment with angular drift specification meets dual-use military criteria.' },
    ],
    limitations: [
      'AIS telemetry accuracy subject to satellite coverage density in maritime chokepoints.',
    ],
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'run-sharia-803',
    userId: 'usr-employee-2',
    userName: 'Priya Sharma',
    scenarioId: 'scen-sharia-01',
    scenarioTitle: 'Murabaha Facility Mark-up & Asset Title Passage Verification',
    offeringId: 'offering-isb',
    offeringName: 'Islamic Banking & Sharia Compliance AI',
    mode: 'deterministic',
    params: {
      requirePhysicalHoldingCert: true,
      shariaStandardBoard: 'AAOIFI',
    },
    outputSummary: 'Compliant execution sequence. Title passage validated at 14-second holding interval; dual-agency segregation confirmed.',
    metrics: [
      { label: 'AAOIFI Standard 8 Compliance', value: '100% Passed' },
      { label: 'Title Passage Latency', value: '14.0s' },
      { label: 'Audit Trail Signature', value: 'Valid SHA-256' },
    ],
    trace: [
      { step: 1, title: 'Offer & Acceptance Timestamp Check', detail: 'Seller offer accepted within broker matching window.', status: 'ok' },
      { step: 2, title: 'Possession Verification', detail: 'Constructive holding certificate generated before sale to end customer.', status: 'ok' },
    ],
    evidence: [
      { rule: 'AAOIFI-SS8-MURABAHA', matchedField: 'inputData.contractType', confidence: 0.99, note: 'Sequence complies with Sharīʿah Standard No. (8) on Murabaha.' },
    ],
    limitations: ['Broker electronic certificates simulated in sandbox.'],
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

// ============================================================================
// 3. LIVE SESSIONS & BROADCASTS
// ============================================================================
export const SEED_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-2026-01',
    title: 'Financial Analysis Intelligence v2.5 Architectural Deep Dive & Stress Models',
    hostName: 'Dr. Marcus Vance',
    hostRole: 'Chief Financial Modeling Architect',
    startTime: new Date(Date.now() + 1000 * 60 * 35).toISOString(), // Starts in 35 mins
    durationMinutes: 45,
    status: 'scheduled',
    description: 'Internal engineering walkthrough on the non-linear cash flow normalization engine, handling micro-seasonal SME borrower distortions without false credit alarms.',
    agenda: [
      'Micro-seasonality normalization curve implementation',
      'Benchmark backtesting across 40,000 anonymized syndicated loan facilities',
      'Integration points with core banking general ledgers (Kastle Core & Amlak)',
      'Open Q&A with quantitative credit researchers',
    ],
    tags: ['Architecture', 'FAI', 'Credit Models', 'Engineering'],
    audience: 'employee',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'live-2026-02',
    title: 'Azentio Engineering Town Hall: Agentic Workflows & Multi-Tenant Boundaries',
    hostName: 'Sanjay Deshmukh',
    hostRole: 'Global Chief Technology Officer',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    durationMinutes: 60,
    status: 'ended',
    description: 'Quarterly global technology town hall discussing zero-trust DAL scoping, tenant quarantine invariants, and roadmap for Autonomous Banking agents.',
    agenda: [
      'Q1 Tech Milestones & Delivery Performance',
      'Security posture: Strict denial-by-default in DAL',
      'Demonstration of the new Employee Innovation Sandbox',
      'Employee Recognition & Innovation Hackathon launch',
    ],
    tags: ['Town Hall', 'Security', 'CTO', 'Strategy'],
    audience: 'employee',
    recordingMediaId: 'media-rec-townhall-q1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'live-2026-03',
    title: 'Islamic Banking AAOIFI Standard 59 Walkthrough & Smart Contracts',
    hostName: 'Fatima Al-Husseini',
    hostRole: 'Principal Islamic Finance Specialist',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    durationMinutes: 50,
    status: 'ended',
    description: 'Technical briefing on implementing AAOIFI Standard 59 (Sale of Debt) compliance within automated syndicated financing workflows.',
    agenda: [
      'Core requirements of Standard 59',
      'Handling debt-for-asset swaps in digital murabaha',
      'Audit trail cryptography and immutable ledgers',
    ],
    tags: ['Islamic Finance', 'Compliance', 'AAOIFI'],
    audience: 'employee',
    recordingMediaId: 'media-rec-sharia-std59',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
];

export const SEED_LIVE_COMMENTS: LiveComment[] = [
  {
    id: 'comment-101',
    sessionId: 'live-2026-02',
    userId: 'usr-employee-1',
    userName: 'Nithesh M',
    body: 'Will the new tenant boundary isolation also apply to cross-region read replicas?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
  {
    id: 'comment-102',
    sessionId: 'live-2026-02',
    userId: 'usr-employee-3',
    userName: 'Marcus Vance',
    body: 'Yes, absolutely. The de-identified shared read model strips all source metadata before replication.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    parentId: 'comment-101',
  },
];

// ============================================================================
// 4. EXPERIMENTS (Employee Innovation Lifecycle)
// ============================================================================
export const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-2026-01',
    ownerId: 'usr-employee-1',
    ownerName: 'Nithesh M',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    title: 'Adaptive Seasonality Weighting for SME Working Capital Delinquency',
    hypothesis: 'Applying dynamic Fourier seasonality smoothing to SME monthly revenue profiles will reduce false positive early delinquency alerts by > 35% without delaying true default detection.',
    description: 'Traditional automated covenant models trigger premature delinquency flags during seasonal lulls (e.g. Q1 post-holiday retail lull). This experiment builds a lightweight Kalman filter on top of the standard ratio extractor.',
    approach: 'Extract 12-month trailing cash flow indices, calculate historical amplitude of seasonal dip per industry sub-sector, and apply dampening before triggering credit officer alerts.',
    expectedOutcome: 'Reduction of alert fatigue for credit analysts handling seasonal corporate portfolios in ASEAN and MENA regions.',
    successMetric: '>= 30% reduction in false-alarm credit reviews; 0% missed true defaults on synthetic benchmark testbed.',
    status: 'In_Progress',
    tags: ['SME', 'Seasonality', 'Credit Risk', 'Kalman Filter'],
    collaboratorIds: ['usr-employee-2', 'usr-employee-3'],
    links: [
      { title: 'Project Research Whitepaper (PDF)', url: 'https://arxiv.org/abs/2104.03212' },
      { title: 'Synthetic Test Data Repo', url: 'https://github.com/azentio-internal/sme-seasonality-data' },
    ],
    visibility: 'employee',
    results: {
      outcome: 'Initial test across 800 synthetic borrower profiles achieved 38.2% drop in false covenant warnings.',
      metrics: 'Precision improved from 64% to 89%; Recall maintained at 98.4%.',
      learnings: 'Requires minimum 24-month operating history to distinguish seasonal slump from secular business distress.',
    },
    linkedPlaygroundRunIds: ['run-fai-801'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'exp-2026-02',
    ownerId: 'usr-employee-2',
    ownerName: 'Priya Sharma',
    offeringId: 'offering-aml',
    offeringName: 'Trade Finance AML & Dual-Use Screening',
    title: 'Graph Neural Network (GNN) Transshipment Shell Company Ring Detection',
    hypothesis: 'Transshipment container paths that route through more than three intermediate free-trade zones have a 4x correlation with beneficial ownership cloaking rings.',
    description: 'Screening individual bills of lading fails to catch coordinated maritime layering. Building a temporal graph of consignees and vessel flags enables real-time ring identification.',
    approach: 'Construct bipartite graph of shippers, consignees, vessels, and customs agents from synthetic port manifest logs.',
    expectedOutcome: 'Automated clustering of shell entities operating across Singapore, Jebel Ali, and Rotterdam ports.',
    successMetric: 'Detection of synthesized 6-hop laundering circles in < 150ms query time.',
    status: 'Submitted',
    tags: ['Graph AI', 'AML', 'Sanctions', 'Maritime'],
    collaboratorIds: ['usr-employee-1'],
    links: [],
    visibility: 'employee',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'exp-2026-03',
    ownerId: 'usr-employee-3',
    ownerName: 'Marcus Vance',
    offeringId: 'offering-isb',
    offeringName: 'Islamic Banking & Sharia Compliance AI',
    title: 'Zero-Knowledge Proofs for Anonymous Commodity Murabaha Ownership Audit',
    hypothesis: 'ZKP snarks can prove commodity possession title without revealing physical warehouse locations or purchase prices to counterparties.',
    description: 'AAOIFI Standard 8 mandates ownership before resale, but institutional traders resist disclosing confidential inventory warrants.',
    approach: 'Implement Groth16 zk-SNARK circuits representing warehouse receipt possession timestamps.',
    expectedOutcome: 'Cryptographic compliance verification acceptable to Sharia Supervisory Boards.',
    successMetric: 'Proof verification time under 50ms on standard cloud instances.',
    status: 'Draft',
    tags: ['ZKP', 'Cryptography', 'Islamic Banking', 'Privacy'],
    collaboratorIds: [],
    links: [],
    visibility: 'employee',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'exp-2026-04',
    ownerId: 'usr-employee-1',
    ownerName: 'Nithesh M',
    offeringId: 'offering-ins',
    offeringName: 'Insurance Risk & Underwriting Copilot',
    title: 'Real-time Commercial Vehicle Telematics Risk Scoring Engine',
    hypothesis: 'Edge scoring of harsh braking and nighttime speeding allows commercial fleet insurers to dynamically adjust monthly premiums, reducing claim frequency by 18%.',
    description: 'Built a streaming processor consuming 10Hz OBD-II sensor data to produce normalized risk indices.',
    approach: 'Event-driven Kafka architecture coupled with logistic regression risk scoring.',
    expectedOutcome: 'Live telematics risk telemetry ready for insurance actuarial team review.',
    successMetric: 'Achieved 22% reduction in fleet claim loss ratio in 6-month simulation.',
    status: 'Completed',
    tags: ['Telematics', 'Actuarial', 'Underwriting', 'Kafka'],
    collaboratorIds: ['usr-employee-2'],
    links: [{ title: 'Actuarial Simulation Results (PDF)', url: 'https://azentio.com/research/telematics-actuarial' }],
    visibility: 'employee',
    results: {
      outcome: 'Validated on synthetic fleet dataset of 2,000 delivery vehicles over 180 simulated days.',
      metrics: 'Claim frequency reduced by 21.4%; average settlement turnaround dropped from 14 days to 4 days.',
      learnings: 'Driver feedback coaching in mobile app produced 60% of the risk reduction behavior.',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

export const SEED_EXPERIMENT_COMMENTS: ExperimentComment[] = [
  {
    id: 'exp-comm-1',
    experimentId: 'exp-2026-01',
    userId: 'usr-employee-2',
    userName: 'Priya Sharma',
    body: 'The 38.2% false alarm reduction in ASEAN retail sectors is remarkable. Have we checked apparel manufacturing in Vietnam where fabric lead times fluctuate unpredictably?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

// ============================================================================
// 5. INTERNAL RELEASE NOTES
// ============================================================================
export const SEED_INTERNAL_RELEASES: InternalReleaseNote[] = [
  {
    id: 'rel-2026-03',
    version: 'v2.5.0-rc1',
    title: 'Financial Analysis Intelligence 2.5: Seasonality Normalization & Multi-Currency DSCR',
    date: '2026-02-28',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    type: 'Feature',
    summary: 'Introduces advanced seasonal cash flow smoothing, multi-currency cross-hedging stress calculation, and unified Basel III liquidity coverage ratio telemetry.',
    fullNotes: `### What's New in v2.5.0-rc1
- **Fourier Seasonality Smoothing Engine**: Eliminates artificial Q1 delinquency false alarms for cyclical borrowers.
- **Cross-Currency Swap Stress Simulator**: Computes FX basis spread shocks across USD/SGD, USD/AED, and EUR/USD facilities.
- **Direct Core Ledger Adapter**: Read-only high throughput ingestion connector for Kastle Universal Lending.

### Known Limitations
- Seasonality smoothing requires at least 24 months of synthetic historical P&L records.
- For loan facilities with bespoke bullet payment covenants, manual verification remains mandatory.`,
    knownIssues: [
      'Edge case: Leap-year day calculations on 30/360 European bond basis may produce a 0.002% rounding variance.',
    ],
    audience: 'employee',
    published: true,
    authorId: 'usr-employee-3',
  },
  {
    id: 'rel-2026-02',
    version: 'v2.4.2',
    title: 'Trade Finance AML: IMO Vessel Dark Blackout Detector & Container Transshipment Graph',
    date: '2026-02-15',
    offeringId: 'offering-aml',
    offeringName: 'Trade Finance AML & Dual-Use Screening',
    type: 'Improvement',
    summary: 'Enhanced satellite AIS tracking integration to detect maritime transponder blackouts exceeding 12 hours in sanctioned maritime corridors.',
    fullNotes: `### Enhancements
- Automated alert triggers when a vessel flag changes within 30 days prior to bill of lading presentation.
- Dual-use goods cross-matching against Wassenaar Munitions and Dual-Use Control Lists (2025 revision).
- High-performance parallelized fuzzy string search for sanctions watchlist screening.`,
    audience: 'employee',
    published: true,
    authorId: 'usr-employee-3',
  },
  {
    id: 'rel-2026-01',
    version: 'v2.4.1',
    title: 'Core Platform Security: Two-Gate Employee Allowlist & Invariant Audit Enforcement',
    date: '2026-02-01',
    offeringId: 'offering-core',
    offeringName: 'Azentio Core Enterprise Platform',
    type: 'Fix',
    summary: 'Enforces strict two-gate verification (@azentio.com verified email + employee_allowlist table record) across all internal API endpoints.',
    fullNotes: `### Security Fixes
- Added server-side deny-by-default policy execution inside \`src/server/policy/authorize.ts\`.
- Guaranteed zero database queries from UI components or raw server actions — all data flows through strictly scoped Data Access Layer.
- Added append-only immutable audit logging for all platform grant modifications.`,
    audience: 'employee',
    published: true,
    authorId: 'usr-employee-3',
  },
];

// ============================================================================
// 6. KNOWLEDGE LIBRARY (Employee Internal Documentation)
// ============================================================================
export const SEED_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-2026-01',
    title: 'Data Access Layer (DAL) Architecture Guidelines & Anti-Bypass Invariants',
    category: 'Architecture & Security',
    body: `## Core DAL Rules

1. **Zero Database Import in UI**: Under no circumstance should \`db\` or ORM queries be executed in components, pages, or client actions.
2. **Mandatory Authorization Gate**: Every DAL routine must call \`authorize(actor, action, resource)\` before fetching or mutating records.
3. **Tenant Quarantine**: Ensure cross-tenant data leaks are structurally impossible by filtering by \`actor.activeTenantId\`.
4. **De-Identified Shared Read Model**: Shared cross-tenant collective observations must strip tenant ID, author name, exact loan values, and revision traces.

## Code Pattern
\`\`\`typescript
export async function getTenantFacility(actor: Actor, facilityId: string) {
  const decision = authorize(actor, 'read', {
    kind: 'facility',
    audience: 'tenant',
    orgId: actor.activeTenantId
  });
  if (!decision.allow) throw new Error(decision.reason);
  return store.facilities.find(f => f.id === facilityId && f.tenantId === actor.activeTenantId);
}
\`\`\``,
    ownerId: 'usr-employee-1',
    ownerName: 'Nithesh M',
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // Due in 10 days! (due_soon)
    reviewIntervalDays: 90,
    reviewStatus: 'due_soon',
    usefulnessScore: 48,
    tags: ['Architecture', 'Security', 'DAL', 'Guidelines'],
    relatedOfferingIds: ['offering-fai', 'offering-aml'],
    version: 3,
    status: 'Published',
  },
  {
    id: 'kb-2026-02',
    title: 'Synthetic Data Ingestion Protocols for Banking Sandbox Simulations',
    category: 'Data Engineering',
    body: `## Guidelines for Generating Realistic Financial Synthetic Data

- **Never Use Production Data**: Real client customer records, accounts, or PII must never enter development or sandbox environments.
- **Benford Law Adherence**: Financial quantities should reflect natural digit distributions to allow realistic anomaly detection testing.
- **Credit Stress Consistency**: Ensure simulated cash flows, interest expenses, and DSCR mathematically correlate without logical contradictions.
- **Flagging**: Always annotate synthetic records with \`synthetic: true\` to uphold transparency invariants.`,
    ownerId: 'usr-employee-2',
    ownerName: 'Priya Sharma',
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 190).toISOString(),
    nextReviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // Overdue by 10 days! (overdue)
    reviewIntervalDays: 180,
    reviewStatus: 'overdue',
    usefulnessScore: 34,
    tags: ['Synthetic Data', 'Testing', 'Compliance'],
    relatedOfferingIds: ['offering-fai'],
    version: 1,
    status: 'Published',
  },
  {
    id: 'kb-2026-03',
    title: 'AAOIFI Sharia Governance Standards for Automated Commodity Murabaha',
    category: 'Compliance & Regulations',
    body: `## Essential Rules for Murabaha Automation

According to AAOIFI Sharia Standard No. 8:
- The financial institution must take constructive possession of the underlying commodity prior to executing the resale agreement.
- Agency contracts (Wakala) must maintain clear separation: the customer cannot act as an undisclosed agent buying from themselves.
- Pricing mark-up must be stated as an explicit fixed rate or transparent contractual index at execution time.`,
    ownerId: 'usr-employee-3',
    ownerName: 'Marcus Vance',
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
    reviewIntervalDays: 60,
    reviewStatus: 'current',
    usefulnessScore: 29,
    tags: ['Islamic Banking', 'AAOIFI', 'Murabaha'],
    relatedOfferingIds: ['offering-isb'],
    version: 2,
    status: 'Published',
  },
];

// ============================================================================
// 7. EMPLOYEE TEAMS & HACKATHON SPACES
// ============================================================================
export const SEED_EMPLOYEE_TEAMS: EmployeeTeam[] = [
  {
    id: 'team-az-01',
    name: 'Team Autonomous Credit (Alpha)',
    leadId: 'usr-employee-1',
    leadName: 'Nithesh M',
    goal: 'Build an autonomous multi-agent credit analyst assistant that drafts institutional loan committee memorandums from raw audited financial filings.',
    description: 'Participating in the Global Azentio FinTech Innovation Hackathon 2026. Exploring LangGraph agents and deterministic ratio verification.',
    maxMembers: 5,
    tags: ['Hackathon', 'Credit AI', 'LLM Agents', 'Automation'],
    memberIds: ['usr-employee-1', 'usr-employee-2', 'usr-employee-3'],
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'team-az-02',
    name: 'Sanctions Radar Squad',
    leadId: 'usr-employee-2',
    leadName: 'Priya Sharma',
    goal: 'Graph intelligence engine for multi-hop maritime transshipment screening.',
    description: 'Cross-functional engineering team testing neo4j / duckdb graph queries against global maritime AIS vessel trajectories.',
    maxMembers: 4,
    tags: ['AML', 'Trade Finance', 'Graph Database'],
    memberIds: ['usr-employee-2'],
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

export const SEED_TEAM_NOTES: TeamNote[] = [
  {
    id: 'tnote-01',
    teamId: 'team-az-01',
    authorId: 'usr-employee-1',
    authorName: 'Nithesh M',
    title: 'Credit Memorandum Generation Architecture Plan',
    content: `Phase 1: Parse XBRL / balance sheet JSON into standardized GAAP / IFRS schema.
Phase 2: Run deterministic ratio verifier (DSCR, Quick Ratio, Debt/EBITDA).
Phase 3: Generate explainability trace with citation references.
Phase 4: Export formatted PDF executive memo with mandatory disclaimer banner.`,
    pinned: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'tnote-02',
    teamId: 'team-az-01',
    authorId: 'usr-employee-2',
    authorName: 'Priya Sharma',
    title: 'Synthetic Test Data Generated',
    content: 'Uploaded 45 synthetic manufacturing and commercial retail financial statements to the team shared sandbox storage.',
    pinned: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const SEED_TEAM_SUBMISSIONS: TeamSubmission[] = [
  {
    id: 'tsub-01',
    teamId: 'team-az-01',
    title: 'Autonomous Credit Copilot — Hackathon Proof-of-Concept',
    summary: 'A 4-step pipeline that reduces initial credit appraisal memo drafting time from 6 hours to 4 minutes while strictly verifying all covenant thresholds deterministically.',
    demoUrl: 'https://demo.azentio.internal/autonomous-credit',
    repoUrl: 'https://github.com/azentio-internal/hackathon-credit-copilot',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

