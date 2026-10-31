import { Actor, AuditEvent } from '@/types';
import { store } from '@/server/dal/store';
import crypto from 'crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computeAuditHash(
  prevHash: string,
  timestamp: string,
  actorId: string,
  action: string,
  resourceKind: string,
  resourceId: string,
  details: string
): string {
  const payload = `${prevHash}|${timestamp}|${actorId}|${action}|${resourceKind}|${resourceId}|${details}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Initializes existing store audit logs with a valid cryptographic hash chain
 * if they are unhashed.
 */
function ensureInitializedLedger() {
  const events = store.auditEvents;
  if (events.length === 0) return;

  // If the oldest event doesn't have a hash, build chain from oldest to newest
  const oldest = events[events.length - 1];
  if (!oldest.hash) {
    let currentPrev = GENESIS_HASH;
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      e.prevHash = currentPrev;
      e.hash = computeAuditHash(
        e.prevHash,
        e.timestamp,
        e.actorId,
        e.action,
        e.resourceKind,
        e.resourceId,
        e.details
      );
      e.outcome = e.outcome || 'success';
      currentPrev = e.hash;
    }
  }
}

// Run initial hash chain link on startup
ensureInitializedLedger();

/**
 * Append an immutable, cryptographically chained audit record.
 */
export function appendAuditEvent(
  actor: Actor,
  action: string,
  resourceKind: string,
  resourceId: string,
  details: string,
  ip?: string,
  outcome: 'success' | 'denied' = 'success',
  requestId?: string
): AuditEvent {
  ensureInitializedLedger();

  // store.auditEvents has newest first (index 0)
  const latestEvent = store.auditEvents[0];
  const prevHash = latestEvent?.hash || GENESIS_HASH;
  const timestamp = new Date().toISOString();

  const hash = computeAuditHash(
    prevHash,
    timestamp,
    actor.userId,
    action,
    resourceKind,
    resourceId,
    details
  );

  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp,
    actorId: actor.userId,
    actorEmail: actor.email || 'anonymous',
    action,
    resourceKind,
    resourceId,
    details,
    ip: ip || '127.0.0.1',
    prevHash,
    hash,
    outcome,
    requestId: requestId || `req-${Math.random().toString(36).slice(2, 8)}`,
  };

  store.auditEvents.unshift(event);
  return event;
}

/**
 * Verifies the integrity of the audit ledger from genesis to head.
 */
export function verifyAuditChain(
  events: AuditEvent[] = store.auditEvents
): { valid: boolean; totalEvents: number; brokenIndex?: number; message: string } {
  if (events.length === 0) {
    return { valid: true, totalEvents: 0, message: 'Ledger is empty. Zero tamper events.' };
  }

  // Events are stored newest-first. Reverse to chronological order (oldest to newest)
  const chronological = [...events].reverse();

  let expectedPrev = GENESIS_HASH;
  for (let i = 0; i < chronological.length; i++) {
    const e = chronological[i];

    if (e.prevHash !== expectedPrev) {
      return {
        valid: false,
        totalEvents: chronological.length,
        brokenIndex: i,
        message: `Broken chain link at index ${i} (${e.id}): expected prevHash ${expectedPrev.slice(0, 10)}... but found ${e.prevHash?.slice(0, 10)}...`,
      };
    }

    const recomputed = computeAuditHash(
      e.prevHash,
      e.timestamp,
      e.actorId,
      e.action,
      e.resourceKind,
      e.resourceId,
      e.details
    );

    if (recomputed !== e.hash) {
      return {
        valid: false,
        totalEvents: chronological.length,
        brokenIndex: i,
        message: `Hash mismatch at index ${i} (${e.id}): data has been modified. Expected ${recomputed.slice(0, 10)}... but found ${e.hash?.slice(0, 10)}...`,
      };
    }

    expectedPrev = e.hash;
  }

  return {
    valid: true,
    totalEvents: chronological.length,
    message: `Cryptographic audit chain intact: All ${chronological.length} entries verified against SHA-256 ledger.`,
  };
}
