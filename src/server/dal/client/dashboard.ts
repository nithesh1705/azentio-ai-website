import { Actor, Offering, Contribution, ImprovementIdea, Notification, Organisation } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';

export interface ClientDashboardDemoScenario {
  id: string;
  offeringId: string;
  offeringName: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  syntheticDataset: string;
  honestyNotice: string;
}

export interface ClientDashboardWebinar {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  offeringName: string;
  registrationStatus: 'open' | 'registered' | 'closed';
  calendarUrl: string;
}

export interface ClientDashboardData {
  tenant: Organisation;
  entitledOfferings: Offering[];
  demos: ClientDashboardDemoScenario[];
  contributionsSummary: {
    total: number;
    drafts: number;
    submitted: number;
    inReview: number;
    clarificationRequested: number;
    published: number;
    withdrawn: number;
  };
  actionNeededContributions: Contribution[];
  upcomingWebinars: ClientDashboardWebinar[];
  visibleIdeas: ImprovementIdea[];
  recentNotifications: Notification[];
}

export const CLIENT_DEMO_SCENARIOS: ClientDashboardDemoScenario[] = [
  {
    id: 'demo-sme-liquidity',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    title: 'SME Cash Velocity & Seasonal Anomaly Stress Test',
    description:
      'Run stress tests across 500 synthetic SME balance sheets with simulated interest rate shocks (+150 bps) and inventory cycle volatility.',
    estimatedMinutes: 3,
    syntheticDataset: 'Synthetic SME Cohort 2026-Q1 (100% de-identified)',
    honestyNotice: 'Sample data • Simulated output • Not an approved credit or business decision.',
  },
  {
    id: 'demo-aml-layering',
    offeringId: 'offering-aml',
    offeringName: 'AML & Compliance Copilot',
    title: 'Cross-Border Layering & Rapid Flow Detection',
    description:
      'Evaluate simulated multi-hop wire transfers spanning 4 synthetic jurisdictions with contextual SAR narrative drafting.',
    estimatedMinutes: 4,
    syntheticDataset: 'Synthetic SWIFT MT103/202 Cohort (simulated test payload)',
    honestyNotice: 'Sample data • Simulated output • Not a regulatory compliance filing.',
  },
  {
    id: 'demo-cbe-settlement',
    offeringId: 'offering-cbe',
    offeringName: 'Core Banking Engine (Amlak/Kastle)',
    title: 'High-Throughput Overnight Batch Settlement Sandbox',
    description:
      'Simulate 50,000 synthetic retail ledger postings with zero downtime concurrent interest accrual calculations.',
    estimatedMinutes: 5,
    syntheticDataset: 'Synthetic Ledger Stream 50k (zero PII)',
    honestyNotice: 'Sample data • Simulated output • Benchmark performance environment only.',
  },
  {
    id: 'demo-dls-instant-lc',
    offeringId: 'offering-dls',
    offeringName: 'Digital Lending Suite',
    title: 'Autonomous Letter of Credit Discrepancy Parsing',
    description:
      'Extract and reconcile bills of lading and commercial invoices against UCP 600 validation rules.',
    estimatedMinutes: 2,
    syntheticDataset: 'Synthetic Maritime Bill of Lading Suite',
    honestyNotice: 'Sample data • Simulated output • Demo scenario.',
  },
];

export const UPCOMING_CLIENT_WEBINARS: ClientDashboardWebinar[] = [
  {
    id: 'webinar-2026-q2-fai',
    title: 'Agentic Credit Decisions: Operationalizing Generative Risk Scoring in BFSI',
    speaker: 'Lewis Hamilton & Azentio AI Research Group',
    date: 'Nov 12, 2026',
    time: '14:00 SGT (Singapore)',
    offeringName: 'Financial Analysis Intelligence',
    registrationStatus: 'open',
    calendarUrl: '/client/resources/webinar-2026-q2-fai.ics',
  },
  {
    id: 'webinar-2026-q2-aml',
    title: 'De-Identifying Multi-Tenant Learning for Fraud & AML Anomaly Models',
    speaker: 'Pranika K, Head of Collective Learning',
    date: 'Nov 19, 2026',
    time: '15:30 SGT (Singapore)',
    offeringName: 'AML & Compliance Copilot',
    registrationStatus: 'open',
    calendarUrl: '/client/resources/webinar-2026-q2-aml.ics',
  },
];

/**
 * Returns strictly tenant-scoped and authorized dashboard data for the client portal.
 * Deny by default: throws error if actor does not have an active tenant or lacks permission.
 */
export function getClientDashboardData(actor: Actor): ClientDashboardData {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to access client dashboard.');
  }

  const authDecision = authorize(actor, 'read', {
    kind: 'org',
    id: actor.activeTenantId,
    orgId: actor.activeTenantId,
    audience: 'tenant',
  });

  if (!authDecision.allow) {
    throw new Error(`Unauthorized: ${authDecision.reason}`);
  }

  const tenant = store.organisations.find((o) => o.id === actor.activeTenantId);
  if (!tenant) {
    throw new Error(`Organisation not found: ${actor.activeTenantId}`);
  }

  // Filter entitled offerings
  const entitledOfferings = store.offerings.filter((offering) =>
    tenant.entitledOfferings.includes(offering.id)
  );

  // Available demos matching entitled offerings
  const demos = CLIENT_DEMO_SCENARIOS.filter((demo) =>
    tenant.entitledOfferings.includes(demo.offeringId)
  );

  // Tenant contributions
  const orgContributions = store.contributions.filter(
    (c) => c.orgId === actor.activeTenantId
  );

  const myContributions = orgContributions.filter((c) => c.authorId === actor.userId);

  // Count by currentState
  const contributionsSummary = {
    total: orgContributions.length,
    drafts: myContributions.filter((c) => c.currentState === 'Draft').length,
    submitted: orgContributions.filter((c) => c.currentState === 'Submitted').length,
    inReview: orgContributions.filter((c) => c.currentState === 'In_Review').length,
    clarificationRequested: myContributions.filter(
      (c) => c.currentState === 'Returned'
    ).length,
    published: orgContributions.filter((c) => c.currentState === 'Published').length,
    withdrawn: orgContributions.filter((c) => c.currentState === 'Withdrawn').length,
  };

  // Contributions where clarification is requested from the author (ACTION NEEDED)
  const actionNeededContributions = myContributions.filter(
    (c) => c.currentState === 'Returned'
  );

  // Webinars filtered by sector/offerings
  const upcomingWebinars = UPCOMING_CLIENT_WEBINARS.filter((w) =>
    entitledOfferings.some((o) => o.name === w.offeringName)
  );

  // Visible ideas (client-safe projections)
  const visibleIdeas = store.ideas
    .filter((idea) => ['in_review', 'on_roadmap', 'shipped'].includes(idea.status))
    .filter(
      (idea) =>
        !idea.offeringId || tenant.entitledOfferings.includes(idea.offeringId)
    )
    .slice(0, 4);

  // In-app notifications
  const recentNotifications = store.notifications
    .filter((n) => n.userId === actor.userId)
    .slice(0, 5);

  return {
    tenant,
    entitledOfferings,
    demos,
    contributionsSummary,
    actionNeededContributions,
    upcomingWebinars,
    visibleIdeas,
    recentNotifications,
  };
}
