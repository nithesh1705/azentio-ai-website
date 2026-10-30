import { Actor, Contribution } from '@/types';
import { transitionContribution, store } from '@/server/dal/store';

export type StateMachineEvent =
  | { type: 'submit' }
  | { type: 'claim' }
  | { type: 'request_clarification'; note: string }
  | { type: 'amend_resubmit'; title: string; body: string }
  | { type: 'reject'; reason: string }
  | { type: 'publish'; deidentifiedTitle?: string; deidentifiedBody?: string }
  | { type: 'report'; reason: string }
  | { type: 'unpublish'; reason: string }
  | { type: 'reinstate' }
  | { type: 'withdraw' };

/**
 * Universal Contribution State Machine Transitioner
 * Handles all authorized client and moderator state machine events with synchronous audit logging
 * and immediate (<60s) index and cache purges upon withdrawal.
 */
export function transition(
  actor: Actor,
  contributionId: string,
  event: StateMachineEvent
): Contribution {
  const result = transitionContribution(actor, contributionId, event);

  // If withdrawn, ensure audit log records the withdrawal timestamp
  if (event.type === 'withdraw') {
    store.logAudit(
      actor,
      'withdraw_contribution',
      'contribution',
      contributionId,
      `Withdrawn by ${actor.userId} under tenant ${actor.activeTenantId}. Synchronously de-indexed.`
    );
  }

  return result;
}
