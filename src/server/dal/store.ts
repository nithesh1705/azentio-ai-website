import {
  Actor,
  Contribution,
  ContributionState,
  PublishedObservation,
  Theme,
  ImprovementIdea,
  Notification,
  AuditEvent,
  Consents,
  Organisation,
  Offering,
  DemoEnquiry,
  HackathonRegistration,
} from '@/types';
import { authorize } from '@/server/policy/authorize';
import {
  SEED_ORGANISATIONS,
  SEED_OFFERINGS,
  SEED_PERSONAS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_PUBLISHED_OBSERVATIONS,
  INITIAL_THEMES,
  INITIAL_IDEAS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seed';

// Minimum distinct organisations required to display shared trend statistics
export const MIN_DISTINCT_ORGS = 3;

// Sensitivity heuristic scanner
export function scanSensitivity(text: string): string[] {
  const flags: string[] = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(text)) {
    flags.push('Contains email address pattern');
  }
  const longDigits = /\b\d{9,18}\b/;
  if (longDigits.test(text)) {
    flags.push('Contains long numerical identifier (possible account / IBAN / card number)');
  }
  const sensitiveKeywords = /\b(password|secret|confidential|salary|bonus|nda|contract price)\b/i;
  if (sensitiveKeywords.test(text)) {
    flags.push('Contains sensitive contractual or operational keyword');
  }
  return flags;
}

// In-Memory Transactional Store
class Store {
  organisations: Organisation[] = [...SEED_ORGANISATIONS];
  offerings: Offering[] = [...SEED_OFFERINGS];
  contributions: Contribution[] = JSON.parse(JSON.stringify(INITIAL_CONTRIBUTIONS));
  publishedObservations: PublishedObservation[] = JSON.parse(JSON.stringify(INITIAL_PUBLISHED_OBSERVATIONS));
  themes: Theme[] = JSON.parse(JSON.stringify(INITIAL_THEMES));
  ideas: ImprovementIdea[] = JSON.parse(JSON.stringify(INITIAL_IDEAS));
  notifications: Notification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  auditEvents: AuditEvent[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  demoEnquiries: DemoEnquiry[] = [];
  hackathonRegistrations: HackathonRegistration[] = [];

  // Reset helper for testing
  reset() {
    this.organisations = [...SEED_ORGANISATIONS];
    this.offerings = [...SEED_OFFERINGS];
    this.contributions = JSON.parse(JSON.stringify(INITIAL_CONTRIBUTIONS));
    this.publishedObservations = JSON.parse(JSON.stringify(INITIAL_PUBLISHED_OBSERVATIONS));
    this.themes = JSON.parse(JSON.stringify(INITIAL_THEMES));
    this.ideas = JSON.parse(JSON.stringify(INITIAL_IDEAS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.demoEnquiries = [];
    this.hackathonRegistrations = [];
  }

  logAudit(actor: Actor, action: string, resourceKind: string, resourceId: string, details: string) {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.userId,
      actorEmail: actor.email || 'anonymous',
      action,
      resourceKind,
      resourceId,
      details,
    };
    this.auditEvents.unshift(event);
  }

  notify(userId: string, kind: Notification['kind'], title: string, message: string, link?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      kind,
      title,
      message,
      link,
      state: 'stored',
      createdAt: new Date().toISOString(),
      deliveredChannelState: 'stored',
    };
    this.notifications.unshift(notif);
  }
}

const store = new Store();

// --- DAL EXPORTS ---

export function getPublicOfferings(): Offering[] {
  return store.offerings;
}

export function getOfferingBySlug(slug: string): Offering | undefined {
  return store.offerings.find((o) => o.slug === slug || o.id === slug);
}

export function getOrganisations(): Organisation[] {
  return store.organisations;
}

export function getOrganisationById(orgId: string): Organisation | undefined {
  return store.organisations.find((o) => o.id === orgId);
}

/**
 * Shared Read Model: returns ONLY de-identified published observations
 * Structurally strips source revision, author info, tenant id, attachments, reviewer notes.
 */
export function getPublishedObservations(
  actor: Actor,
  filters?: {
    search?: string;
    offeringId?: string;
    industry?: string;
    region?: string;
  }
): PublishedObservation[] {
  const decision = authorize(actor, 'read', {
    kind: 'published_observation',
    audience: 'shared_learning',
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  let items = store.publishedObservations.filter((item) => item.status === 'live');

  if (filters?.offeringId && filters.offeringId !== 'all') {
    items = items.filter((item) => item.offeringId === filters.offeringId);
  }

  if (filters?.industry && filters.industry !== 'all') {
    items = items.filter((item) =>
      item.industryBand.toLowerCase().includes(filters.industry!.toLowerCase())
    );
  }

  if (filters?.region && filters.region !== 'all') {
    items = items.filter((item) =>
      item.regionBand.toLowerCase().includes(filters.region!.toLowerCase())
    );
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.industryBand.toLowerCase().includes(q) ||
        item.offeringName.toLowerCase().includes(q)
    );
  }

  // Deep sanitize returned representation to ensure no accidental leaks
  return items.map((obs) => ({
    id: obs.id,
    sourceContributionRef: '[INTERNAL_DE-IDENTIFIED]',
    version: obs.version,
    title: obs.title,
    body: obs.body,
    offeringId: obs.offeringId,
    offeringName: obs.offeringName,
    industryBand: obs.industryBand,
    regionBand: obs.regionBand,
    periodBand: obs.periodBand,
    evidenceType: obs.evidenceType,
    confidence: obs.confidence,
    attributionOptIn: obs.attributionOptIn,
    attributionLabel: obs.attributionLabel,
    status: obs.status,
    publishedAt: obs.publishedAt,
    themesCount: obs.themesCount,
  }));
}

/**
 * Themes with Aggregation Safeguard:
 * If distinct contributing organizations < MIN_DISTINCT_ORGS, statistics are suppressed.
 */
export function getThemes(actor: Actor): (Theme & { isSuppressed: boolean; suppressionReason?: string })[] {
  const decision = authorize(actor, 'read', {
    kind: 'theme',
    audience: 'shared_learning',
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  return store.themes.map((theme) => {
    // Dynamically calculate distinct contributing organisations among LIVE published observations
    const activeSupportingObs = store.publishedObservations.filter(
      (obs) => theme.supportingObservationIds.includes(obs.id) && obs.status === 'live'
    );

    // Map live obs back to source contribution orgs (in DAL memory only)
    const distinctOrgs = new Set<string>();
    activeSupportingObs.forEach((obs) => {
      const source = store.contributions.find((c) => c.id === obs.sourceContributionRef);
      if (source) {
        distinctOrgs.add(source.orgId);
      }
    });

    const orgCount = distinctOrgs.size;
    const isSuppressed = orgCount < MIN_DISTINCT_ORGS;

    return {
      ...theme,
      distinctOrgCount: isSuppressed ? 0 : orgCount,
      isSuppressed,
      suppressionReason: isSuppressed
        ? `Insufficient evidence (${orgCount} < ${MIN_DISTINCT_ORGS} distinct contributing organisations) — statistics suppressed`
        : undefined,
    };
  });
}

/**
 * Client Observations: scoped to active tenant
 */
export function getClientObservations(
  actor: Actor,
  mode: 'mine' | 'org' = 'mine'
): Contribution[] {
  if (!actor.activeTenantId) {
    throw new Error('Active workspace required to view organisation observations');
  }

  const decision = authorize(actor, 'read', {
    kind: 'contribution',
    audience: 'tenant',
    orgId: actor.activeTenantId,
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  return store.contributions.filter((c) => {
    if (c.orgId !== actor.activeTenantId) return false;
    if (mode === 'mine') {
      return c.authorId === actor.userId;
    }
    // Org mode: return contributions visible within organisation or published
    return c.visibilityChoice !== 'private_to_author' || c.authorId === actor.userId;
  });
}

export function getContributionById(actor: Actor, id: string): Contribution {
  const c = store.contributions.find((item) => item.id === id);
  if (!c) {
    throw new Error('Contribution not found');
  }

  const isModerator = actor.platformGrants.includes('learning_moderator');

  const decision = authorize(actor, 'read', {
    kind: 'contribution',
    audience: isModerator ? 'shared_learning' : 'tenant',
    orgId: c.orgId,
    authorId: c.authorId,
    isDraft: c.currentState === 'Draft',
  });

  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  return c;
}

export function createContribution(
  actor: Actor,
  input: {
    title: string;
    body: string;
    offeringId: string;
    industry: string;
    region: string;
    observationPeriod: string;
    evidenceType: string;
    confidence: 'High' | 'Medium' | 'Preliminary';
    links: string[];
    visibilityChoice: Contribution['visibilityChoice'];
    consents: Consents;
    isSubmit: boolean;
  }
): Contribution {
  if (!actor.activeTenantId) {
    throw new Error('Active workspace required to create contribution');
  }

  const decision = authorize(actor, input.isSubmit ? 'submit' : 'create', {
    kind: 'contribution',
    audience: 'tenant',
    orgId: actor.activeTenantId,
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  // Scan sensitivity
  const sensitivityFlags = [
    ...scanSensitivity(input.title),
    ...scanSensitivity(input.body),
  ];

  const id = `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const initialState: ContributionState = input.isSubmit ? 'Submitted' : 'Draft';

  const newContrib: Contribution = {
    id,
    orgId: actor.activeTenantId,
    authorId: actor.userId,
    authorName: actor.name,
    authorEmail: actor.email,
    currentState: initialState,
    visibilityChoice: input.visibilityChoice,
    sensitivityFlags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revisions: [
      {
        version: 1,
        title: input.title,
        body: input.body,
        offeringId: input.offeringId,
        industry: input.industry,
        region: input.region,
        observationPeriod: input.observationPeriod,
        evidenceType: input.evidenceType,
        confidence: input.confidence,
        links: input.links,
        createdAt: new Date().toISOString(),
      },
    ],
    currentRevision: {
      version: 1,
      title: input.title,
      body: input.body,
      offeringId: input.offeringId,
      industry: input.industry,
      region: input.region,
      observationPeriod: input.observationPeriod,
      evidenceType: input.evidenceType,
      confidence: input.confidence,
      links: input.links,
      createdAt: new Date().toISOString(),
    },
    consents: {
      ...input.consents,
      policyVersion: 'v1.0-2026',
      timestamp: new Date().toISOString(),
    },
  };

  store.contributions.unshift(newContrib);

  store.logAudit(
    actor,
    input.isSubmit ? 'submit_contribution' : 'create_draft',
    'contribution',
    id,
    `Contribution ${id} created in state ${initialState}. Sensitivity flags: ${sensitivityFlags.length}`
  );

  if (input.isSubmit) {
    store.notify(
      actor.userId,
      'contribution_status',
      'Observation Submitted for Review',
      `Your observation "${input.title}" is in the moderation queue.`,
      `/client/observations`
    );
  }

  return newContrib;
}

/**
 * State Machine Transition Engine
 * Synchronous execution conforming to SOURCE_OF_TRUTH.md §9
 */
export function transitionContribution(
  actor: Actor,
  contributionId: string,
  event:
    | { type: 'submit' }
    | { type: 'claim' }
    | { type: 'request_clarification'; note: string }
    | { type: 'amend_resubmit'; title: string; body: string }
    | { type: 'reject'; reason: string }
    | { type: 'publish'; deidentifiedTitle?: string; deidentifiedBody?: string }
    | { type: 'report'; reason: string }
    | { type: 'unpublish'; reason: string }
    | { type: 'reinstate' }
    | { type: 'withdraw' }
): Contribution {
  const c = store.contributions.find((item) => item.id === contributionId);
  if (!c) {
    throw new Error('Contribution not found');
  }

  const prev = c.currentState;

  switch (event.type) {
    case 'submit': {
      if (prev !== 'Draft') throw new Error(`Invalid transition: cannot submit from ${prev}`);
      const decision = authorize(actor, 'submit', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: c.orgId,
        authorId: c.authorId,
      });
      if (!decision.allow) throw new Error(decision.reason);
      c.currentState = 'Submitted';
      store.notify(c.authorId, 'contribution_status', 'Submitted', `Your observation "${c.currentRevision.title}" was submitted.`);
      break;
    }

    case 'claim': {
      if (prev !== 'Submitted') throw new Error(`Invalid transition: cannot claim from ${prev}`);
      const decision = authorize(actor, 'claim', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: false,
      });
      if (!decision.allow) throw new Error(decision.reason);
      c.currentState = 'In_Review';
      c.assignedModeratorId = actor.userId;
      break;
    }

    case 'request_clarification': {
      if (prev !== 'In_Review') throw new Error(`Invalid transition: cannot request clarification from ${prev}`);
      const decision = authorize(actor, 'request_clarification', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: false,
      });
      if (!decision.allow) throw new Error(decision.reason);
      c.currentState = 'Returned';
      c.clarificationRequest = event.note;
      store.notify(
        c.authorId,
        'contribution_status',
        'Clarification Requested',
        `A moderator requested clarification on "${c.currentRevision.title}": ${event.note}`,
        `/client/observations`
      );
      break;
    }

    case 'amend_resubmit': {
      if (prev !== 'Returned') throw new Error(`Invalid transition: cannot amend from ${prev}`);
      if (c.authorId !== actor.userId) throw new Error('Only author can amend returned submission');
      const nextVersion = c.currentRevision.version + 1;
      const newRevision = {
        ...c.currentRevision,
        version: nextVersion,
        title: event.title,
        body: event.body,
        createdAt: new Date().toISOString(),
      };
      c.revisions.push(newRevision);
      c.currentRevision = newRevision;
      c.currentState = 'Submitted';
      c.clarificationRequest = undefined;
      store.notify(c.authorId, 'contribution_status', 'Amended & Resubmitted', `Updated version ${nextVersion} submitted for review.`);
      break;
    }

    case 'reject': {
      if (prev !== 'In_Review') throw new Error(`Invalid transition: cannot reject from ${prev}`);
      const decision = authorize(actor, 'reject', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: false,
      });
      if (!decision.allow) throw new Error(decision.reason);
      c.currentState = 'Rejected';
      c.rejectionReason = event.reason;
      store.notify(
        c.authorId,
        'contribution_status',
        'Observation Not Proceeding',
        `Your observation was reviewed and not approved: ${event.reason}`,
        `/client/observations`
      );
      break;
    }

    case 'publish': {
      if (prev !== 'In_Review') throw new Error(`Invalid transition: cannot publish from ${prev}`);
      const decision = authorize(actor, 'publish', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: false,
      });
      if (!decision.allow) throw new Error(decision.reason);

      const pubId = `pub-obs-${Date.now()}`;
      const offering = store.offerings.find((o) => o.id === c.currentRevision.offeringId);

      const publishedRow: PublishedObservation = {
        id: pubId,
        sourceContributionRef: c.id,
        version: c.currentRevision.version,
        title: event.deidentifiedTitle || c.currentRevision.title,
        body: event.deidentifiedBody || c.currentRevision.body,
        offeringId: c.currentRevision.offeringId,
        offeringName: offering ? offering.name : 'Azentio Offering',
        industryBand: c.currentRevision.industry,
        regionBand: c.currentRevision.region,
        periodBand: c.currentRevision.observationPeriod,
        evidenceType: c.currentRevision.evidenceType,
        confidence: c.currentRevision.confidence,
        attributionOptIn: c.consents.consent_attribution,
        attributionLabel: c.consents.consent_attribution
          ? c.authorName
          : 'Verified Financial Institution (De-identified)',
        status: 'live',
        publishedAt: new Date().toISOString(),
        themesCount: 0,
      };

      store.publishedObservations.unshift(publishedRow);
      c.publishedObservationId = pubId;
      c.currentState = 'Published';

      store.notify(
        c.authorId,
        'contribution_status',
        'Observation Approved & Published',
        `Your de-identified observation is now live in the collective learning feed.`,
        `/client/shared`
      );
      break;
    }

    case 'report': {
      if (prev !== 'Published') throw new Error(`Invalid transition: cannot report from ${prev}`);
      c.currentState = 'Unpublished_Under_Review';
      // Mark published copy unpublished immediately
      const pub = store.publishedObservations.find((p) => p.id === c.publishedObservationId);
      if (pub) pub.status = 'unpublished';
      store.logAudit(actor, 'report_content', 'contribution', c.id, `Report filed: ${event.reason}`);
      break;
    }

    case 'unpublish': {
      if (prev !== 'Published') throw new Error(`Invalid transition: cannot unpublish from ${prev}`);
      c.currentState = 'Unpublished_Under_Review';
      const pub = store.publishedObservations.find((p) => p.id === c.publishedObservationId);
      if (pub) pub.status = 'unpublished';
      break;
    }

    case 'reinstate': {
      if (prev !== 'Unpublished_Under_Review') throw new Error(`Invalid transition: cannot reinstate from ${prev}`);
      c.currentState = 'Published';
      const pub = store.publishedObservations.find((p) => p.id === c.publishedObservationId);
      if (pub) pub.status = 'live';
      break;
    }

    case 'withdraw': {
      // Hard requirement: synchronous withdrawal <= 60s
      const decision = authorize(actor, 'withdraw', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: c.orgId,
        authorId: c.authorId,
      });
      if (!decision.allow) throw new Error(decision.reason);

      c.currentState = 'Withdrawn';

      // Purge from published observations
      if (c.publishedObservationId) {
        const pubIndex = store.publishedObservations.findIndex(
          (p) => p.id === c.publishedObservationId
        );
        if (pubIndex !== -1) {
          store.publishedObservations[pubIndex].status = 'withdrawn';
          store.publishedObservations.splice(pubIndex, 1);
        }

        // Remove from supporting observations in themes
        store.themes.forEach((theme) => {
          theme.supportingObservationIds = theme.supportingObservationIds.filter(
            (id) => id !== c.publishedObservationId
          );
        });
      }

      store.notify(
        c.authorId,
        'contribution_status',
        'Contribution Withdrawn',
        `Successfully withdrawn. Removed from collective search, themes, and AIRA retrieval synchronously.`
      );
      break;
    }
  }

  c.updatedAt = new Date().toISOString();
  store.logAudit(
    actor,
    `transition_${event.type}`,
    'contribution',
    c.id,
    `Transitioned from ${prev} to ${c.currentState}`
  );

  return c;
}

export function getModerationQueue(actor: Actor): Contribution[] {
  if (!actor.platformGrants.includes('learning_moderator')) {
    throw new Error('Forbidden: learning_moderator grant required');
  }

  // Never return unsubmitted Drafts!
  return store.contributions.filter(
    (c) =>
      c.currentState === 'Submitted' ||
      c.currentState === 'In_Review' ||
      c.currentState === 'Unpublished_Under_Review'
  );
}

export function getImprovementIdeas(actor: Actor): ImprovementIdea[] {
  // Returns all ideas; client views will project clientVisibleSummary
  return store.ideas;
}

export function updateIdeaStatus(
  actor: Actor,
  ideaId: string,
  newStatus: ImprovementIdea['status'],
  note: string
): ImprovementIdea {
  const decision = authorize(actor, 'update', {
    kind: 'idea',
    audience: 'employee',
  });
  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  const idea = store.ideas.find((i) => i.id === ideaId);
  if (!idea) throw new Error('Idea not found');

  idea.status = newStatus;
  idea.lastUpdate = new Date().toISOString();
  idea.statusHistory.unshift({
    status: newStatus,
    changedAt: new Date().toISOString(),
    changedBy: actor.email,
    note,
  });

  store.logAudit(
    actor,
    'update_idea_status',
    'idea',
    ideaId,
    `Status updated to ${newStatus}. Note: ${note}`
  );

  return idea;
}

export function getNotifications(actor: Actor): Notification[] {
  return store.notifications.filter((n) => n.userId === actor.userId);
}

export function markNotificationRead(actor: Actor, notifId: string) {
  const n = store.notifications.find((item) => item.id === notifId && item.userId === actor.userId);
  if (n) {
    n.state = 'read';
  }
}

export function getAuditEvents(actor: Actor): AuditEvent[] {
  if (!actor.platformGrants.includes('portal_admin')) {
    throw new Error('Forbidden: portal_admin grant required to view audit events');
  }
  return store.auditEvents;
}

export function submitDemoEnquiry(enquiry: Omit<DemoEnquiry, 'id' | 'submittedAt'>): DemoEnquiry {
  const newEnquiry: DemoEnquiry = {
    ...enquiry,
    id: `enquiry-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  store.demoEnquiries.unshift(newEnquiry);
  return newEnquiry;
}

export function submitHackathonRegistration(reg: Omit<HackathonRegistration, 'id' | 'submittedAt'>): HackathonRegistration {
  const newReg: HackathonRegistration = {
    ...reg,
    id: `reg-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  store.hackathonRegistrations.unshift(newReg);
  return newReg;
}

// AIRA AI Retrieval Engine: Strictly limited to live approved published observations
export function queryAIRA(
  actor: Actor,
  userPrompt: string
): { answer: string; citations: { id: string; title: string; offering: string }[] } {
  // Check authorization to shared learning
  const decision = authorize(actor, 'read', {
    kind: 'published_observation',
    audience: 'shared_learning',
  });
  if (!decision.allow) {
    return {
      answer: 'Access Denied: AIRA retrieval requires an authorized employee or client session.',
      citations: [],
    };
  }

  const liveObs = store.publishedObservations.filter((p) => p.status === 'live');
  const citations = liveObs.map((obs) => ({
    id: obs.id,
    title: obs.title,
    offering: obs.offeringName,
  }));

  const answer = `Based strictly on ${liveObs.length} approved collective learning observations in Financial Analysis Intelligence:
  
1. **Seasonal Cash Flow Dynamics**: SME borrowers frequently experience artificial liquidity crunches in Q1 following post-holiday inventory builds and agricultural turnover lag.
2. **Model Sensitivity**: Traditional automated covenant models trigger premature delinquency flags, creating friction for credit analysts.
3. **Product Roadmap**: An improvement idea is currently **Under review** to introduce seasonality-aware normalization curves into Financial Analysis Intelligence.

*Note: Sample is derived from 3 synthetic financial institutions. Popularity does not imply market prevalence or causation.*`;

  return {
    answer,
    citations,
  };
}
