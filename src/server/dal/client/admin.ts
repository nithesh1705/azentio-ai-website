import crypto from 'crypto';
import { Actor, UserRecord, ClientInvitation } from '@/types';
import { store } from '@/server/dal/store';
import { hashInvitationToken } from './invitations';

export interface OrgMemberView {
  userId: string;
  name: string;
  email: string;
  role: 'client_member' | 'client_admin';
  status: 'active' | 'suspended';
  avatar?: string;
  joinedAt: string;
}

function verifyClientAdmin(actor: Actor) {
  if (!actor.activeTenantId) {
    throw new Error('Active client workspace required.');
  }

  const isAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  if (!isAdmin) {
    throw new Error('Forbidden: Only client administrators can manage workspace members.');
  }
}

/**
 * Returns all members of the active organisation
 */
export function getOrgMembers(actor: Actor): OrgMemberView[] {
  verifyClientAdmin(actor);

  const members: OrgMemberView[] = [];

  store.users.forEach((user) => {
    const mem = user.memberships.find((m) => m.orgId === actor.activeTenantId);
    if (mem) {
      members.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: mem.role,
        status: (mem.status as 'active' | 'suspended') || 'active',
        avatar: user.avatar,
        joinedAt: user.createdAt,
      });
    }
  });

  return members;
}

/**
 * In-memory store for pending client invitations
 */
export let orgInvitations: ClientInvitation[] = [
  {
    id: 'inv-seeded-01',
    tokenHash: hashInvitationToken('demo-invite-token-123'),
    orgId: 'org-abcd',
    orgName: 'ABCD Technologies',
    email: 'new_analyst@abcd.in',
    role: 'client_member',
    invitedBy: 'usr-client-dhoni',
    invitedByName: 'MS Dhoni',
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

/**
 * Get active pending invitations for active organisation
 */
export function getOrgInvitations(actor: Actor): ClientInvitation[] {
  verifyClientAdmin(actor);
  return orgInvitations.filter(
    (i) => i.orgId === actor.activeTenantId && !i.usedAt && !i.revokedAt
  );
}

/**
 * Create a new member invitation with single-use token and honest notice
 */
export function createMemberInvitation(
  actor: Actor,
  input: {
    email: string;
    role: 'client_member' | 'client_admin';
  }
): {
  invitation: ClientInvitation;
  token: string;
  inviteLink: string;
  honestNotice: string;
} {
  verifyClientAdmin(actor);

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email.trim())) {
    throw new Error('Please enter a valid email address.');
  }

  // Block platform role escalation
  if (input.role !== 'client_member' && input.role !== 'client_admin') {
    throw new Error('Invalid role: Client admins can only grant client_member or client_admin.');
  }

  const rawToken = `inv-${crypto.randomBytes(16).toString('hex')}`;
  const tokenHash = hashInvitationToken(rawToken);

  const tenant = store.organisations.find((o) => o.id === actor.activeTenantId);

  const invitation: ClientInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tokenHash,
    orgId: actor.activeTenantId!,
    orgName: tenant ? tenant.name : actor.activeTenantId!,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    invitedBy: actor.userId,
    invitedByName: actor.name,
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days expiry
    createdAt: new Date().toISOString(),
  };

  orgInvitations.unshift(invitation);

  store.logAudit(
    actor,
    'create_invitation',
    'invitation',
    invitation.id,
    `Invited ${invitation.email} as ${invitation.role} to org ${invitation.orgId}`
  );

  return {
    invitation,
    token: rawToken,
    inviteLink: `/invite/${rawToken}`,
    honestNotice: 'Share this link with the invitee — not sent by system.',
  };
}

/**
 * Resend invitation: refreshes expiry and generates fresh token
 */
export function resendMemberInvitation(
  actor: Actor,
  invitationId: string
): { token: string; inviteLink: string; honestNotice: string } {
  verifyClientAdmin(actor);

  const inv = orgInvitations.find(
    (i) => i.id === invitationId && i.orgId === actor.activeTenantId
  );
  if (!inv) {
    throw new Error('Invitation not found.');
  }

  const rawToken = `inv-${crypto.randomBytes(16).toString('hex')}`;
  inv.tokenHash = hashInvitationToken(rawToken);
  inv.expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();

  store.logAudit(
    actor,
    'resend_invitation',
    'invitation',
    inv.id,
    `Resent invitation to ${inv.email}`
  );

  return {
    token: rawToken,
    inviteLink: `/invite/${rawToken}`,
    honestNotice: 'Share this link with the invitee — not sent by system.',
  };
}

/**
 * Cancel an unaccepted invitation
 */
export function cancelMemberInvitation(actor: Actor, invitationId: string): boolean {
  verifyClientAdmin(actor);

  const inv = orgInvitations.find(
    (i) => i.id === invitationId && i.orgId === actor.activeTenantId
  );
  if (!inv) {
    throw new Error('Invitation not found.');
  }

  inv.revokedAt = new Date().toISOString();

  store.logAudit(
    actor,
    'cancel_invitation',
    'invitation',
    inv.id,
    `Cancelled invitation to ${inv.email}`
  );

  return true;
}

/**
 * Change member role (client_member <-> client_admin)
 * Enforces rule: Cannot demote the last remaining admin!
 */
export function changeMemberRole(
  actor: Actor,
  targetUserId: string,
  newRole: 'client_member' | 'client_admin'
): boolean {
  verifyClientAdmin(actor);

  if (newRole !== 'client_member' && newRole !== 'client_admin') {
    throw new Error('Invalid role.');
  }

  const target = store.users.find((u) => u.id === targetUserId);
  if (!target) {
    throw new Error('Member not found.');
  }

  const membership = target.memberships.find((m) => m.orgId === actor.activeTenantId);
  if (!membership) {
    throw new Error('User is not a member of this organisation.');
  }

  // Last admin protection
  if (membership.role === 'client_admin' && newRole === 'client_member') {
    const adminCount = store.users.filter((u) =>
      u.memberships.some(
        (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin' && m.status === 'active'
      )
    ).length;

    if (adminCount <= 1) {
      throw new Error(
        'Cannot demote the last administrator. Promote another member to client_admin first.'
      );
    }
  }

  membership.role = newRole;

  store.logAudit(
    actor,
    'change_member_role',
    'membership',
    targetUserId,
    `Changed role of ${target.email} to ${newRole}`
  );

  return true;
}

/**
 * Revoke member access
 * Enforces rule: Cannot revoke the last administrator!
 */
export function revokeMember(actor: Actor, targetUserId: string): boolean {
  verifyClientAdmin(actor);

  const target = store.users.find((u) => u.id === targetUserId);
  if (!target) {
    throw new Error('Member not found.');
  }

  const membership = target.memberships.find((m) => m.orgId === actor.activeTenantId);
  if (!membership) {
    throw new Error('User is not a member of this organisation.');
  }

  if (membership.role === 'client_admin') {
    const activeAdminCount = store.users.filter((u) =>
      u.memberships.some(
        (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin' && m.status === 'active'
      )
    ).length;

    if (activeAdminCount <= 1) {
      throw new Error('Cannot revoke the last administrator of the organisation.');
    }
  }

  membership.status = 'suspended';

  store.logAudit(
    actor,
    'revoke_member',
    'membership',
    targetUserId,
    `Revoked membership for ${target.email}`
  );

  return true;
}

/**
 * Restore previously revoked member
 */
export function restoreMember(actor: Actor, targetUserId: string): boolean {
  verifyClientAdmin(actor);

  const target = store.users.find((u) => u.id === targetUserId);
  if (!target) {
    throw new Error('Member not found.');
  }

  const membership = target.memberships.find((m) => m.orgId === actor.activeTenantId);
  if (!membership) {
    throw new Error('User is not a member of this organisation.');
  }

  membership.status = 'active';

  store.logAudit(
    actor,
    'restore_member',
    'membership',
    targetUserId,
    `Restored membership for ${target.email}`
  );

  return true;
}
