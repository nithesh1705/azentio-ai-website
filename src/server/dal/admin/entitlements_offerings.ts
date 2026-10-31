import { Actor, Offering, AuditEvent } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';

export interface EntitlementRequest {
  id: string;
  orgId: string;
  orgName: string;
  offeringId: string;
  offeringName: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  justification: string;
  status: 'open' | 'approved' | 'declined';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewMessage?: string;
}

export interface OfferingWithStatus extends Offering {
  status: 'draft' | 'active' | 'retired';
  subscribedTenantsCount?: number;
  linkedDemoScenarios?: { id: string; name: string }[];
}

const initialEntitlementRequests: EntitlementRequest[] = [
  {
    id: 'req-ent-01',
    orgId: 'org-cedar',
    orgName: 'Cedar Capital',
    offeringId: 'offering-aml',
    offeringName: 'AML & Fraud Surveillance Suite',
    requestedBy: 'usr-client-virat',
    requestedByName: 'Virat Kohli',
    requestedAt: '2026-10-28T14:00:00Z',
    justification: 'Pilot expansion to evaluate cross-border merchant corridors and automated SAR filing.',
    status: 'open',
  },
  {
    id: 'req-ent-02',
    orgId: 'org-xyz',
    orgName: 'XYZ Global',
    offeringId: 'offering-cbe',
    offeringName: 'Core Banking Modernization Engine',
    requestedBy: 'usr-client-dhoni',
    requestedByName: 'MS Dhoni',
    requestedAt: '2026-10-20T11:30:00Z',
    justification: 'Quarterly migration of retail deposit ledger to microservices architecture.',
    status: 'approved',
    reviewedBy: 'usr-admin-max',
    reviewedByName: 'Max Verstappen',
    reviewedAt: '2026-10-21T09:15:00Z',
    reviewMessage: 'Approved per Enterprise tier subscription entitlement expansion.',
  },
];

class EntitlementsOfferingsStore {
  requests: EntitlementRequest[] = JSON.parse(JSON.stringify(initialEntitlementRequests));
  offeringStatuses: Map<string, 'draft' | 'active' | 'retired'> = new Map([
    ['offering-fai', 'active'],
    ['offering-cbe', 'active'],
    ['offering-aml', 'active'],
    ['offering-dls', 'active'],
  ]);

  reset() {
    this.requests = JSON.parse(JSON.stringify(initialEntitlementRequests));
    this.offeringStatuses = new Map([
      ['offering-fai', 'active'],
      ['offering-cbe', 'active'],
      ['offering-aml', 'active'],
      ['offering-dls', 'active'],
    ]);
  }
}

export const entitlementsOfferingsStore = new EntitlementsOfferingsStore();

// ── Entitlement Requests Functions ──

export function getAdminEntitlementRequests(
  actor: Actor,
  filter?: { status?: EntitlementRequest['status'] }
): EntitlementRequest[] {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  let list = entitlementsOfferingsStore.requests;
  if (filter?.status && filter.status !== ('all' as any)) {
    list = list.filter((r) => r.status === filter.status);
  }

  return list;
}

export function approveEntitlementRequest(
  actor: Actor,
  requestId: string
): { success: boolean; request: EntitlementRequest } {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const req = entitlementsOfferingsStore.requests.find((r) => r.id === requestId);
  if (!req) {
    throw new Error(`Entitlement request not found: ${requestId}`);
  }

  if (req.status !== 'open') {
    throw new Error(`Request cannot be approved because it is already ${req.status}.`);
  }

  // Update target organisation's entitledOfferings
  const org = store.organisations.find((o) => o.id === req.orgId);
  if (org && !org.entitledOfferings.includes(req.offeringId)) {
    org.entitledOfferings.push(req.offeringId);
  }

  req.status = 'approved';
  req.reviewedBy = actor.userId;
  req.reviewedByName = actor.name;
  req.reviewedAt = new Date().toISOString();
  req.reviewMessage = 'Approved by platform administrator.';

  // Dispatch in-app notification to requesting user
  store.notify(
    req.requestedBy,
    'system',
    `Entitlement Approved: ${req.offeringName}`,
    `Your organisation ${req.orgName} has been granted access to ${req.offeringName}.`,
    '/client/demos'
  );

  appendAuditEvent(
    actor,
    'admin.entitlement.approve',
    'entitlement_request',
    req.id,
    `Approved entitlement request for ${req.offeringName} on organisation ${req.orgName}`
  );

  return { success: true, request: req };
}

export function declineEntitlementRequest(
  actor: Actor,
  requestId: string,
  message: string
): { success: boolean; request: EntitlementRequest } {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  if (!message || message.trim().length < 5) {
    throw new Error('A detailed reason (minimum 5 characters) is required when declining an entitlement request.');
  }

  const req = entitlementsOfferingsStore.requests.find((r) => r.id === requestId);
  if (!req) {
    throw new Error(`Entitlement request not found: ${requestId}`);
  }

  if (req.status !== 'open') {
    throw new Error(`Request cannot be declined because it is already ${req.status}.`);
  }

  req.status = 'declined';
  req.reviewedBy = actor.userId;
  req.reviewedByName = actor.name;
  req.reviewedAt = new Date().toISOString();
  req.reviewMessage = message;

  store.notify(
    req.requestedBy,
    'system',
    `Entitlement Request Declined: ${req.offeringName}`,
    `Your request for ${req.offeringName} was declined: ${message}`,
    '/client'
  );

  appendAuditEvent(
    actor,
    'admin.entitlement.decline',
    'entitlement_request',
    req.id,
    `Declined entitlement request for ${req.offeringName} on ${req.orgName}. Reason: ${message}`
  );

  return { success: true, request: req };
}

// ── Offerings Catalogue Functions ──

export function getAdminOfferings(
  actor: Actor,
  filter?: { status?: 'draft' | 'active' | 'retired' }
): OfferingWithStatus[] {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  return store.offerings.map((offering) => {
    const status = entitlementsOfferingsStore.offeringStatuses.get(offering.id) || 'active';
    const subscribedTenantsCount = store.organisations.filter((o) =>
      o.entitledOfferings.includes(offering.id)
    ).length;

    const linkedDemoScenarios = [
      { id: `demo-${offering.id}-1`, name: `${offering.name} Interactive Sandbox` },
      { id: `demo-${offering.id}-2`, name: 'Stress-Test Simulation Lab' },
    ];

    return {
      ...offering,
      status,
      subscribedTenantsCount,
      linkedDemoScenarios,
    };
  }).filter((o) => {
    if (filter?.status && filter.status !== ('all' as any)) {
      return o.status === filter.status;
    }
    return true;
  });
}

export function createAdminOffering(
  actor: Actor,
  data: {
    name: string;
    category: 'Banking' | 'Lending' | 'Intelligence' | 'Compliance';
    tagline: string;
    description: string;
    features: string[];
    sandboxAvailable: boolean;
    badge?: string;
  }
): OfferingWithStatus {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `offering-${slug.slice(0, 8)}`;

  const newOffering: Offering = {
    id,
    slug,
    name: data.name,
    category: data.category,
    tagline: data.tagline,
    description: data.description,
    features: data.features || [],
    capabilities: [
      { title: 'Autonomous Engine', description: 'Enterprise inference pipelines' },
    ],
    sandboxAvailable: data.sandboxAvailable,
    badge: data.badge || 'New',
    synthetic: false,
  };

  store.offerings.push(newOffering);
  entitlementsOfferingsStore.offeringStatuses.set(newOffering.id, 'active');

  appendAuditEvent(
    actor,
    'admin.offering.create',
    'offering',
    newOffering.id,
    `Created new solution engine offering: ${newOffering.name}`
  );

  return {
    ...newOffering,
    status: 'active',
    subscribedTenantsCount: 0,
    linkedDemoScenarios: [],
  };
}

export function updateAdminOffering(
  actor: Actor,
  id: string,
  data: Partial<Offering>
): OfferingWithStatus {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const offering = store.offerings.find((o) => o.id === id);
  if (!offering) throw new Error(`Offering not found: ${id}`);

  if (data.name) offering.name = data.name;
  if (data.tagline) offering.tagline = data.tagline;
  if (data.description) offering.description = data.description;
  if (data.badge !== undefined) offering.badge = data.badge;
  if (data.sandboxAvailable !== undefined) offering.sandboxAvailable = data.sandboxAvailable;

  appendAuditEvent(
    actor,
    'admin.offering.update',
    'offering',
    id,
    `Updated properties for solution engine ${offering.name}`
  );

  const status = entitlementsOfferingsStore.offeringStatuses.get(id) || 'active';
  return { ...offering, status };
}

export function retireAdminOffering(
  actor: Actor,
  id: string,
  reason: string
): { success: boolean; subscribedTenantsCount: number } {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const offering = store.offerings.find((o) => o.id === id);
  if (!offering) throw new Error(`Offering not found: ${id}`);

  const subscribedTenants = store.organisations.filter((o) => o.entitledOfferings.includes(id));
  entitlementsOfferingsStore.offeringStatuses.set(id, 'retired');

  appendAuditEvent(
    actor,
    'admin.offering.retire',
    'offering',
    id,
    `Retired offering ${offering.name}. ${subscribedTenants.length} tenants currently subscribed. Reason: ${reason}`
  );

  return { success: true, subscribedTenantsCount: subscribedTenants.length };
}

