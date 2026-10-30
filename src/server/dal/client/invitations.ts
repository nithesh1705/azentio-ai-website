import crypto from 'crypto';
import { Actor, ClientInvitation, TermsAcceptance } from '@/types';
import { store } from '@/server/dal/store';

// Helper: SHA-256 hash token for secure lookup
export function hashInvitationToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

// Seed sample tokens for test/demo:
// Token 'inv-token-abcd-789' hashes to 'abcd789...'
const sampleTokenA = 'inv-token-abcd-789';
const sampleTokenB = 'inv-token-xyz-456';
const sampleTokenExpired = 'inv-token-expired-000';

let activeInvitations: ClientInvitation[] = [
  {
    id: 'inv-01',
    tokenHash: hashInvitationToken(sampleTokenA),
    orgId: 'org-abcd',
    orgName: 'ABCD Technologies',
    email: 'virat_kohli@abcd.in',
    role: 'client_member',
    invitedBy: 'usr-client-dhoni',
    invitedByName: 'MS Dhoni',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48h valid
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-02',
    tokenHash: hashInvitationToken(sampleTokenB),
    orgId: 'org-xyz',
    orgName: 'XYZ Global',
    email: 'hardik.pandya@xyz.com',
    role: 'client_member',
    invitedBy: 'usr-client-dhoni',
    invitedByName: 'MS Dhoni',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-03',
    tokenHash: hashInvitationToken(sampleTokenExpired),
    orgId: 'org-cedar',
    orgName: 'Cedar Capital',
    email: 'test@cedar.synthetic',
    role: 'client_member',
    invitedBy: 'usr-client-dhoni',
    invitedByName: 'MS Dhoni',
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Expired
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

let termsAcceptances: TermsAcceptance[] = [
  {
    userId: 'usr-client-virat',
    orgId: 'org-abcd',
    version: '2026.1-v1',
    acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

export function getInvitationByToken(token: string): {
  valid: boolean;
  reason?: string;
  invitation?: ClientInvitation;
} {
  const hash = hashInvitationToken(token);
  const inv = activeInvitations.find((i) => i.tokenHash === hash);

  if (!inv) {
    return { valid: false, reason: 'Invitation not found or invalid link.' };
  }
  if (inv.usedAt) {
    return { valid: false, reason: 'This invitation has already been accepted.' };
  }
  if (inv.revokedAt) {
    return { valid: false, reason: 'This invitation was revoked by the organisation administrator.' };
  }
  if (new Date() > new Date(inv.expiresAt)) {
    return { valid: false, reason: 'This invitation has expired. Contact your administrator for a new invite.' };
  }

  return { valid: true, invitation: inv };
}

export function acceptClientInvitation(
  actor: Actor,
  token: string
): { success: boolean; orgId: string; message: string } {
  const check = getInvitationByToken(token);
  if (!check.valid || !check.invitation) {
    throw new Error(check.reason || 'Invalid invitation.');
  }

  const inv = check.invitation;

  // Strict email equality check: Verified account email must equal invited email
  if (actor.email.trim().toLowerCase() !== inv.email.trim().toLowerCase()) {
    throw new Error(
      `Email mismatch: This invitation was issued to "${inv.email}", but you are signed in as "${actor.email}". Please sign in with the invited email address.`
    );
  }

  // Atomically create membership
  const targetUser = store.users.find((u) => u.id === actor.userId || u.email.toLowerCase() === actor.email.toLowerCase());
  if (targetUser) {
    const existingMembership = targetUser.memberships?.find((m) => m.orgId === inv.orgId);
    if (!existingMembership) {
      targetUser.memberships = targetUser.memberships || [];
      targetUser.memberships.push({
        orgId: inv.orgId,
        role: inv.role,
        status: 'active',
      });
    } else {
      existingMembership.status = 'active';
      existingMembership.role = inv.role;
    }
  }

  // Update actor memberships in runtime
  const existingActorM = actor.memberships?.find((m) => m.orgId === inv.orgId);
  if (!existingActorM) {
    actor.memberships = actor.memberships || [];
    actor.memberships.push({
      orgId: inv.orgId,
      role: inv.role,
      status: 'active',
    });
  } else {
    existingActorM.status = 'active';
    existingActorM.role = inv.role;
  }
  actor.activeTenantId = inv.orgId;

  // Mark token used
  inv.usedAt = new Date().toISOString();

  // Audit event
  store.logAudit(
    actor,
    'accept_invitation',
    'membership',
    inv.id,
    `User ${actor.email} accepted invitation to join ${inv.orgName} as ${inv.role}`
  );

  // Notify inviting admin
  store.notify(
    inv.invitedBy,
    'mention',
    'Invitation Accepted',
    `${actor.name} (${actor.email}) has accepted the invitation to join ${inv.orgName}.`,
    '/client/admin/members'
  );

  return {
    success: true,
    orgId: inv.orgId,
    message: `Successfully joined ${inv.orgName} as ${inv.role.replace('_', ' ')}.`,
  };
}

export function declineClientInvitation(actor: Actor, token: string): void {
  const check = getInvitationByToken(token);
  if (!check.valid || !check.invitation) {
    throw new Error(check.reason || 'Invalid invitation.');
  }

  check.invitation.revokedAt = new Date().toISOString();

  store.logAudit(
    actor,
    'decline_invitation',
    'invitation',
    check.invitation.id,
    `User ${actor.email} declined invitation to join ${check.invitation.orgName}`
  );
}

export function recordTermsAcceptance(
  actor: Actor,
  orgId: string,
  version: string = '2026.1-v1'
): TermsAcceptance {
  const acceptance: TermsAcceptance = {
    userId: actor.userId,
    orgId,
    version,
    acceptedAt: new Date().toISOString(),
  };

  termsAcceptances.push(acceptance);

  store.logAudit(
    actor,
    'accept_terms',
    'org',
    orgId,
    `Accepted workspace terms version ${version} for org ${orgId}`
  );

  return acceptance;
}

export function hasAcceptedTerms(actor: Actor, orgId: string): boolean {
  return termsAcceptances.some((t) => t.userId === actor.userId && t.orgId === orgId);
}
