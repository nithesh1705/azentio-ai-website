import { Actor, AuditEvent } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { store } from '@/server/dal/store';
import { verifyAuditChain, appendAuditEvent } from '@/server/services/audit';
import { isStepupValid } from '@/server/services/stepup';

function checkPortalAdmin(actor: Actor) {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason || 'Requires portal_admin platform grant.');
  }
}

export interface AuditFilterOptions {
  actorId?: string;
  action?: string;
  resourceKind?: string;
  outcome?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function getAdminAuditEvents(actor: Actor, filter?: AuditFilterOptions): AuditEvent[] {
  checkPortalAdmin(actor);

  let events = [...store.auditEvents];

  if (filter?.actorId) {
    events = events.filter((e) => e.actorId === filter.actorId || e.actorEmail?.includes(filter.actorId!));
  }
  if (filter?.action) {
    events = events.filter((e) => e.action === filter.action);
  }
  if (filter?.resourceKind) {
    events = events.filter((e) => e.resourceKind === filter.resourceKind);
  }
  if (filter?.outcome) {
    events = events.filter((e) => e.outcome === filter.outcome);
  }
  if (filter?.startDate) {
    events = events.filter((e) => e.timestamp >= filter.startDate!);
  }
  if (filter?.endDate) {
    events = events.filter((e) => e.timestamp <= filter.endDate!);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.action.toLowerCase().includes(s) ||
        e.actorEmail?.toLowerCase().includes(s) ||
        e.actorId.toLowerCase().includes(s) ||
        e.details.toLowerCase().includes(s) ||
        e.resourceId?.toLowerCase().includes(s) ||
        e.id.toLowerCase().includes(s)
    );
  }

  return events;
}

export function getAdminAuditEventById(actor: Actor, id: string): AuditEvent | undefined {
  checkPortalAdmin(actor);
  return store.auditEvents.find((e) => e.id === id);
}

export function verifyAdminAuditChain(actor: Actor): {
  valid: boolean;
  totalEvents: number;
  brokenIndex?: number;
  message: string;
} {
  checkPortalAdmin(actor);
  return verifyAuditChain(store.auditEvents);
}

export function exportAuditTrail(
  actor: Actor,
  format: 'csv' | 'json',
  filter?: AuditFilterOptions
): string {
  checkPortalAdmin(actor);

  // STEP-UP VERIFICATION INVARIANT: Exporting sensitive audit trails requires active step-up session!
  if (!isStepupValid(actor.userId)) {
    throw new Error('Step-up verification required: Please complete fresh email verification before exporting audit records.');
  }

  const events = getAdminAuditEvents(actor, filter);

  appendAuditEvent(
    actor,
    'admin.audit.export',
    'audit_ledger',
    'all',
    `Exported ${events.length} audit records in ${format.toUpperCase()} format.`
  );

  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }

  // Format as CSV
  const headers = [
    'ID',
    'Timestamp (UTC)',
    'Actor ID',
    'Actor Email',
    'Action',
    'Resource Kind',
    'Resource ID',
    'Outcome',
    'IP Hash',
    'Details',
    'SHA-256 Hash',
    'Previous Hash',
  ];

  const rows = events.map((e) => [
    e.id,
    e.timestamp,
    e.actorId,
    `"${(e.actorEmail || '').replace(/"/g, '""')}"`,
    e.action,
    e.resourceKind,
    e.resourceId || '',
    e.outcome || 'success',
    e.ip || '',
    `"${(e.details || '').replace(/"/g, '""')}"`,
    e.hash || '',
    e.prevHash || '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
