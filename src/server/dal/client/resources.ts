import { Actor, ClientResource, WebinarRegistration } from '@/types';
import { store } from '@/server/dal/store';

export const CLIENT_RESOURCES_DATA: ClientResource[] = [
  {
    id: 'res-briefing-fai-2026',
    title: 'Financial Analysis Intelligence: 2026 Seasonality Adjustment Model Briefing',
    type: 'briefing',
    summary:
      'Executive methodology briefing detailing our federated variance filter designed to separate Q1 inventory build cycles from distress indicators.',
    body: 'This operational paper covers how Azentio Financial Analysis Intelligence utilizes de-identified peer telemetry across 60+ countries to suppress false-positive seasonal alerts. Recommended for credit risk officers, underwriting committee heads, and portfolio leads.',
    date: '2026-02-15',
    audience: 'entitled',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
  },
  {
    id: 'res-whitepaper-aml-swift',
    title: 'Architecting Zero-Leakage Cross-Border AML Layering Detection in BFSI',
    type: 'briefing',
    summary:
      'Technical architecture guide exploring agentic SAR narrative synthesis and sub-second multi-hop wire graph clustering.',
    body: 'A deep-dive on applying privacy-preserving pattern detection algorithms over SWIFT MT103/202 messages without exposing sensitive client counterparty details or proprietary account topologies.',
    date: '2026-03-01',
    audience: 'entitled',
    offeringId: 'offering-aml',
    offeringName: 'AML & Compliance Copilot',
  },
  {
    id: 'res-release-cbe-patch',
    title: 'Core Banking Engine v5.4: Overnight Batch Settlement Latency Optimizations',
    type: 'release_note',
    summary:
      'Detailed release notes for Amlak/Kastle engine performance patch, reducing EOD batch reconciliation window by 38%.',
    body: 'Includes configuration flags for multi-threaded ledger postings, distributed partition locks, and non-blocking real-time retail balance updates during active batch cycles.',
    date: '2026-03-12',
    audience: 'entitled',
    offeringId: 'offering-cbe',
    offeringName: 'Core Banking Engine',
  },
  {
    id: 'res-webinar-collective-ai',
    title: 'Masterclass: Operationalizing Generative AI Under Singapore MAS & Basel Guidelines',
    type: 'webinar',
    summary:
      'Live interactive technical session and demo exploring explainable AI risk governance in commercial banking.',
    body: 'Join Azentio Chief AI Scientist and guest bank risk directors as we explore live audit trails, explainability weight calculations, and verifiable model governance.',
    date: '2026-04-18',
    audience: 'entitled',
    offeringId: 'offering-fai',
    offeringName: 'Financial Analysis Intelligence',
    webinarDetails: {
      startTime: '14:00 SGT (Singapore)',
      durationMinutes: 60,
      speakerName: 'Dr. Lewis Hamilton',
      speakerRole: 'VP of Financial AI Research',
    },
  },
];

let webinarRegistrations: WebinarRegistration[] = [];

/**
 * Get client resources filtered by entitled offerings
 */
export function getClientResources(
  actor: Actor,
  filters?: { type?: ClientResource['type']; offeringId?: string }
): ClientResource[] {
  if (!actor.activeTenantId) {
    return [];
  }

  const tenant = store.organisations.find((o) => o.id === actor.activeTenantId);
  if (!tenant) return [];

  let items = CLIENT_RESOURCES_DATA.filter(
    (res) => !res.offeringId || tenant.entitledOfferings.includes(res.offeringId)
  );

  if (filters?.type && filters.type !== ('all' as any)) {
    items = items.filter((r) => r.type === filters.type);
  }

  if (filters?.offeringId && filters.offeringId !== 'all') {
    items = items.filter((r) => r.offeringId === filters.offeringId);
  }

  return items;
}

/**
 * Register user for an enterprise webinar
 */
export function registerForWebinar(
  actor: Actor,
  webinarId: string
): { success: boolean; message: string; icsContent: string } {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to register.');
  }

  const resource = CLIENT_RESOURCES_DATA.find((r) => r.id === webinarId && r.type === 'webinar');
  if (!resource) {
    throw new Error('Webinar not found');
  }

  const existing = webinarRegistrations.find(
    (w) => w.webinarId === webinarId && w.userId === actor.userId
  );

  if (!existing) {
    const reg: WebinarRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      webinarId,
      userId: actor.userId,
      userEmail: actor.email,
      orgId: actor.activeTenantId,
      registeredAt: new Date().toISOString(),
    };
    webinarRegistrations.push(reg);

    store.logAudit(
      actor,
      'register_webinar',
      'client_resource',
      webinarId,
      `Registered for "${resource.title}"`
    );
  }

  const ics = generateIcsContent(resource);

  return {
    success: true,
    message: `Registered successfully for ${resource.title}.`,
    icsContent: ics,
  };
}

/**
 * Get registration status for actor
 */
export function getWebinarRegistrationStatus(
  actor: Actor,
  webinarId: string
): boolean {
  return webinarRegistrations.some(
    (w) => w.webinarId === webinarId && w.userId === actor.userId
  );
}

/**
 * Generate standard iCalendar (.ics) string
 */
export function generateIcsContent(resource: ClientResource): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const eventDate = resource.date.replace(/-/g, '') + 'T060000Z'; // 14:00 SGT = 06:00 UTC
  const eventEndDate = resource.date.replace(/-/g, '') + 'T070000Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Azentio Software//Azentio.ai Client Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${resource.id}@azentio.ai`,
    `DTSTAMP:${now}`,
    `DTSTART:${eventDate}`,
    `DTEND:${eventEndDate}`,
    `SUMMARY:Azentio Enterprise Briefing: ${resource.title}`,
    `DESCRIPTION:${resource.summary}`,
    'LOCATION:Virtual / Microsoft Teams Live Event',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

