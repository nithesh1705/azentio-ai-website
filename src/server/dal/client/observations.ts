import {
  Actor,
  Contribution,
  ContributionRevision,
  Consents,
  VisibilityChoice,
  ContributionState,
} from '@/types';
import { store, scanSensitivity } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { transition } from './state_machine';

export interface CreateObservationInput {
  title: string;
  body: string;
  offeringId: string;
  industry: string;
  region: string;
  observationPeriod: string;
  evidenceType: string;
  confidence: 'High' | 'Medium' | 'Preliminary';
  visibilityChoice: VisibilityChoice;
  consents: {
    consent_process: boolean;
    consent_publish: boolean;
    consent_attribution: boolean;
    consent_training: boolean;
  };
}

export function computeWhoCanSee(
  visibility: VisibilityChoice,
  state: ContributionState
): { summary: string; audienceLabel: string; isPublic: boolean } {
  if (state === 'Draft') {
    return {
      summary: 'Only you can see this draft version. No colleagues or moderators have access.',
      audienceLabel: 'Private to Author',
      isPublic: false,
    };
  }

  if (state === 'Withdrawn') {
    return {
      summary: 'Withdrawn from all shared feeds and indexing. Only you and your org admin see historical status.',
      audienceLabel: 'Withdrawn',
      isPublic: false,
    };
  }

  if (visibility === 'private_to_author') {
    return {
      summary: 'Visible only to you and assigned Azentio research moderators reviewing your submission.',
      audienceLabel: 'Author & Moderators Only',
      isPublic: false,
    };
  }

  if (state === 'Published') {
    return {
      summary: 'Published as a de-identified pattern across the federated learning feed. Tenant identity is stripped.',
      audienceLabel: 'Shared Learning (De-identified)',
      isPublic: true,
    };
  }

  return {
    summary: 'Colleagues inside your active organization and Azentio research moderators can view this observation.',
    audienceLabel: 'Our Organisation & Moderators',
    isPublic: false,
  };
}

/**
 * Returns observations scoped strictly to actor's active client workspace
 */
export function getClientObservations(
  actor: Actor,
  tab: 'mine' | 'org' = 'mine',
  filters?: { status?: ContributionState; offeringId?: string }
): Contribution[] {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to view observations.');
  }

  const decision = authorize(actor, 'read', {
    kind: 'contribution',
    audience: 'tenant',
    orgId: actor.activeTenantId,
  });

  if (!decision.allow) {
    throw new Error(`Unauthorized: ${decision.reason}`);
  }

  // Filter to active tenant
  let items = store.contributions.filter((c) => c.orgId === actor.activeTenantId);

  if (tab === 'mine') {
    items = items.filter((c) => c.authorId === actor.userId);
  } else {
    // Org tab: never show private drafts of other authors
    items = items.filter(
      (c) =>
        c.visibilityChoice === 'within_organisation' ||
        c.authorId === actor.userId ||
        c.currentState === 'Published'
    );
    // Exclude drafts written by other authors
    items = items.filter(
      (c) => c.currentState !== 'Draft' || c.authorId === actor.userId
    );
  }

  if (filters?.status) {
    items = items.filter((c) => c.currentState === filters.status);
  }

  if (filters?.offeringId && filters.offeringId !== 'all') {
    items = items.filter((c) => c.currentRevision.offeringId === filters.offeringId);
  }

  return items;
}

/**
 * Get single observation ensuring tenant isolation and draft author rules
 */
export function getClientObservationById(actor: Actor, id: string): Contribution {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required.');
  }

  const c = store.contributions.find((item) => item.id === id);
  if (!c || c.orgId !== actor.activeTenantId) {
    throw new Error('Observation not found or access denied for this workspace.');
  }

  // If Draft, only author can read
  if (c.currentState === 'Draft' && c.authorId !== actor.userId) {
    throw new Error('Access denied: drafts are private to author.');
  }

  return c;
}

/**
 * Create a new observation draft with sensitivity scanning & 4 consents
 */
export function createObservationDraft(
  actor: Actor,
  input: CreateObservationInput,
  autoSubmit = false
): Contribution {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required to create an observation.');
  }

  const now = new Date().toISOString();
  const flags = [
    ...scanSensitivity(input.title),
    ...scanSensitivity(input.body),
  ];

  const initialRevision: ContributionRevision = {
    version: 1,
    title: input.title,
    body: input.body,
    offeringId: input.offeringId,
    industry: input.industry,
    region: input.region,
    observationPeriod: input.observationPeriod,
    evidenceType: input.evidenceType,
    confidence: input.confidence,
    links: [],
    createdAt: now,
  };

  const fullConsents: Consents = {
    consent_process: input.consents.consent_process ?? true,
    consent_publish: input.consents.consent_publish ?? true,
    consent_attribution: input.consents.consent_attribution ?? false,
    consent_training: input.consents.consent_training ?? false, // Strictly default off
    policyVersion: '2026.1',
    timestamp: now,
  };

  const contribution: Contribution = {
    id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orgId: actor.activeTenantId,
    authorId: actor.userId,
    authorName: actor.name,
    authorEmail: actor.email,
    currentState: 'Draft',
    visibilityChoice: input.visibilityChoice,
    revisions: [initialRevision],
    currentRevision: initialRevision,
    consents: fullConsents,
    sensitivityFlags: flags,
    createdAt: now,
    updatedAt: now,
  };

  store.contributions.unshift(contribution);

  store.logAudit(
    actor,
    'create_contribution_draft',
    'contribution',
    contribution.id,
    `Created observation draft: "${input.title}"`
  );

  if (autoSubmit) {
    return transition(actor, contribution.id, { type: 'submit' });
  }

  return contribution;
}

/**
 * Update an existing observation draft
 */
export function updateObservationDraft(
  actor: Actor,
  id: string,
  input: Partial<CreateObservationInput>
): Contribution {
  const c = getClientObservationById(actor, id);

  if (c.authorId !== actor.userId) {
    throw new Error('Only the author can edit this observation.');
  }

  if (c.currentState !== 'Draft') {
    throw new Error(`Cannot edit an observation in state "${c.currentState}".`);
  }

  const now = new Date().toISOString();
  if (input.title) c.currentRevision.title = input.title;
  if (input.body) c.currentRevision.body = input.body;
  if (input.offeringId) c.currentRevision.offeringId = input.offeringId;
  if (input.industry) c.currentRevision.industry = input.industry;
  if (input.region) c.currentRevision.region = input.region;
  if (input.observationPeriod) c.currentRevision.observationPeriod = input.observationPeriod;
  if (input.evidenceType) c.currentRevision.evidenceType = input.evidenceType;
  if (input.confidence) c.currentRevision.confidence = input.confidence;
  if (input.visibilityChoice) c.visibilityChoice = input.visibilityChoice;
  if (input.consents) {
    c.consents = {
      ...c.consents,
      ...input.consents,
      timestamp: now,
    };
  }

  c.sensitivityFlags = [
    ...scanSensitivity(c.currentRevision.title),
    ...scanSensitivity(c.currentRevision.body),
  ];
  c.updatedAt = now;

  return c;
}

/**
 * Submit draft for moderation review
 */
export function submitObservation(actor: Actor, id: string): Contribution {
  return transition(actor, id, { type: 'submit' });
}

/**
 * Withdraw observation synchronously (<60s ceiling)
 */
export function withdrawObservation(actor: Actor, id: string): Contribution {
  return transition(actor, id, { type: 'withdraw' });
}
