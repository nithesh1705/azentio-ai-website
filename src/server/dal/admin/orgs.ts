import { Actor, Organisation, UserRecord, AuditEvent, ApprovalRequest } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';
import { approvalsEngine } from '@/server/services/approvals';
import { isStepupValid } from '@/server/services/stepup';

export function getAdminOrganisations(
  actor: Actor,
  filter?: { status?: string; search?: string }
): Organisation[] {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  let orgs = store.organisations.map((o) => ({
    ...o,
    status: o.status || (o.type === 'platform' ? 'active' : 'active'),
  }));

  if (filter?.status && filter.status !== 'all') {
    orgs = orgs.filter((o) => o.status === filter.status);
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    orgs = orgs.filter(
      (o) =>
        o.name.toLowerCase().includes(s) ||
        o.slug.toLowerCase().includes(s) ||
        o.domain.toLowerCase().includes(s)
    );
  }

  return orgs;
}

export function getAdminOrganisationById(
  actor: Actor,
  id: string
): {
  org: Organisation;
  users: UserRecord[];
  entitlements: string[];
  pendingRequests: any[];
  activity: AuditEvent[];
} | undefined {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) return undefined;

  // Find all users belonging to this org
  const users = store.users.filter(
    (u) => u.orgId === id || u.memberships.some((m) => m.orgId === id)
  );

  // Activity audit filtered to this org
  const activity = store.auditEvents.filter(
    (a) => a.resourceId === id || a.details.includes(org.name) || a.details.includes(id)
  );

  return {
    org: {
      ...org,
      status: org.status || 'active',
      policiesAccepted: org.policiesAccepted || {
        terms: true,
        privacy: true,
        version: 'v2026.1',
        acceptedAt: '2026-01-15T09:00:00Z',
      },
    },
    users,
    entitlements: org.entitledOfferings,
    pendingRequests: [],
    activity,
  };
}

export function createAdminOrganisation(
  actor: Actor,
  data: {
    name: string;
    domain: string;
    tier: 'Enterprise' | 'Core' | 'Standard';
    entitledOfferings: string[];
  }
): Organisation {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  if (!data.name || !data.domain) {
    throw new Error('Organisation name and domain are required.');
  }

  // Check unique domain
  const existing = store.organisations.find(
    (o) => o.domain.toLowerCase() === data.domain.toLowerCase()
  );
  if (existing) {
    throw new Error(`Domain '${data.domain}' is already registered to ${existing.name}.`);
  }

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newOrg: Organisation = {
    id: `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name,
    slug,
    tier: data.tier,
    entitledOfferings: data.entitledOfferings || [],
    domain: data.domain,
    memberCount: 0,
    synthetic: false,
    type: 'client',
    status: 'active',
    policiesAccepted: {
      terms: true,
      privacy: true,
      version: 'v2026.1',
      acceptedAt: new Date().toISOString(),
    },
  };

  store.organisations.push(newOrg);

  appendAuditEvent(
    actor,
    'admin.org.create',
    'organisation',
    newOrg.id,
    `Created new organisation ${newOrg.name} (${newOrg.domain}) with tier ${newOrg.tier}`
  );

  return newOrg;
}

export function updateAdminOrganisation(
  actor: Actor,
  id: string,
  data: Partial<Organisation>
): Organisation {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) {
    throw new Error(`Organisation not found: ${id}`);
  }

  if (org.type === 'platform') {
    throw new Error('Platform root organisation cannot be modified directly.');
  }

  // Update permissible fields (slug is immutable once active)
  if (data.name) org.name = data.name;
  if (data.tier) org.tier = data.tier;
  if (data.entitledOfferings) org.entitledOfferings = data.entitledOfferings;

  appendAuditEvent(
    actor,
    'admin.org.update',
    'organisation',
    org.id,
    `Updated organisation properties for ${org.name}`
  );

  return org;
}

export function suspendAdminOrganisation(
  actor: Actor,
  id: string,
  reason: string,
  skipStepupCheck = false
): Organisation {
  const auth = authorize(actor, 'admin.org.suspend', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  if (!reason || reason.trim().length < 10) {
    throw new Error('A detailed reason (minimum 10 characters) is required to suspend an organisation.');
  }

  if (!skipStepupCheck && !isStepupValid(actor.userId)) {
    throw new Error('Step-up authentication required for organisation suspension.');
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) {
    throw new Error(`Organisation not found: ${id}`);
  }

  if (org.type === 'platform') {
    throw new Error('Platform organisation cannot be suspended.');
  }

  org.status = 'suspended';
  org.suspendedAt = new Date().toISOString();
  org.suspendedReason = reason;

  appendAuditEvent(
    actor,
    'admin.org.suspend',
    'organisation',
    org.id,
    `Suspended organisation ${org.name}. Reason: ${reason}`
  );

  return org;
}

export function reactivateAdminOrganisation(
  actor: Actor,
  id: string
): Organisation {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) {
    throw new Error(`Organisation not found: ${id}`);
  }

  org.status = 'active';
  delete org.suspendedAt;
  delete org.suspendedReason;

  appendAuditEvent(
    actor,
    'admin.org.reactivate',
    'organisation',
    org.id,
    `Reactivated organisation ${org.name}`
  );

  return org;
}

export function requestArchiveOrganisation(
  actor: Actor,
  id: string,
  reason: string
): ApprovalRequest {
  const auth = authorize(actor, 'admin.org.archive', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) {
    throw new Error(`Organisation not found: ${id}`);
  }

  if (org.type === 'platform') {
    throw new Error('Platform organisation cannot be archived.');
  }

  // Create dual control approval request
  const req = approvalsEngine.createApprovalRequest(
    actor,
    'archive_organisation',
    `Archive Organisation: ${org.name}`,
    `Archive organisation ${org.name} (${org.domain}). Reason: ${reason}`,
    { orgId: id, orgName: org.name, reason },
    [
      { field: 'Status', before: org.status || 'active', after: 'archived' },
      { field: 'Reason', before: 'None', after: reason },
    ]
  );

  appendAuditEvent(
    actor,
    'dual_control.create_request',
    'approval_request',
    req.id,
    `Requested dual-control approval to archive organisation ${org.name}`
  );

  return req;
}

export function executeArchiveOrganisation(
  actor: Actor,
  id: string
): Organisation {
  const auth = authorize(actor, 'admin.org.archive', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === id);
  if (!org) {
    throw new Error(`Organisation not found: ${id}`);
  }

  org.status = 'archived';
  org.archivedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.org.archive',
    'organisation',
    org.id,
    `Executed archiving of organisation ${org.name}`
  );

  return org;
}

export function exportOrganisationsCSV(actor: Actor): string {
  const auth = authorize(actor, 'admin.audit.export', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const orgs = store.organisations;
  const headers = ['ID', 'Name', 'Slug', 'Domain', 'Tier', 'Status', 'Members', 'Offerings'];
  const rows = orgs.map((o) => [
    o.id,
    `"${o.name.replace(/"/g, '""')}"`,
    o.slug,
    o.domain,
    o.tier,
    o.status || 'active',
    o.memberCount,
    `"${o.entitledOfferings.join(', ')}"`,
  ]);

  appendAuditEvent(
    actor,
    'admin.orgs.export_csv',
    'organisation_list',
    'all',
    `Exported ${orgs.length} organisations as CSV`
  );

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

