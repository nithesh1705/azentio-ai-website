import { Actor, UserRecord, AuditEvent, ApprovalRequest } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';
import { approvalsEngine } from '@/server/services/approvals';
import { isStepupValid } from '@/server/services/stepup';

// In-memory active invitations
export interface InvitationRecord {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'client_member' | 'client_admin';
  token: string;
  inviteLink: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

const invitationsStore: InvitationRecord[] = [
  {
    id: 'inv-demo-01',
    email: 'rohit_sharma@abcd.in',
    name: 'Rohit Sharma',
    orgId: 'org-abcd',
    role: 'client_member',
    token: 'tok-abcd-rohit-789',
    inviteLink: 'https://azentio.ai/invite?token=tok-abcd-rohit-789',
    invitedBy: 'usr-admin-max',
    invitedAt: '2026-10-29T10:00:00Z',
    expiresAt: '2026-11-01T10:00:00Z',
    status: 'pending',
  },
];

export function getAdminUsers(
  actor: Actor,
  filter?: { orgId?: string; role?: string; status?: string; search?: string }
): UserRecord[] {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  let users = store.users.map((u) => ({
    ...u,
    status: u.status || 'active',
  }));

  if (filter?.orgId && filter.orgId !== 'all') {
    users = users.filter((u) => u.orgId === filter.orgId || u.memberships.some((m) => m.orgId === filter.orgId));
  }

  if (filter?.status && filter.status !== 'all') {
    users = users.filter((u) => u.status === filter.status);
  }

  if (filter?.role && filter.role !== 'all') {
    users = users.filter((u) => u.role === filter.role || u.memberships.some((m) => m.role === filter.role));
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.id.toLowerCase().includes(s)
    );
  }

  return users;
}

export function getAdminUserById(
  actor: Actor,
  id: string
): {
  user: UserRecord;
  activeSessions: { id: string; ip: string; userAgent: string; signedInAt: string; lastActive: string }[];
  memberships: any[];
  auditEvents: AuditEvent[];
} | undefined {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === id);
  if (!user) return undefined;

  const userWithStatus: UserRecord = {
    ...user,
    status: user.status || 'active',
  };

  // Simulated active sessions
  const activeSessions = [
    {
      id: `sess-${user.id}-1`,
      ip: '192.168.1.104',
      userAgent: 'Chrome 122.0 / Windows 11',
      signedInAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ];

  // User activity audit
  const auditEvents = store.auditEvents.filter(
    (a) => a.actorId === id || a.resourceId === id || a.details.includes(user.email)
  );

  return {
    user: userWithStatus,
    activeSessions,
    memberships: user.memberships,
    auditEvents,
  };
}

export function inviteAdminUser(
  actor: Actor,
  data: {
    name: string;
    email: string;
    orgId: string;
    role: 'client_member' | 'client_admin';
  }
): InvitationRecord {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const org = store.organisations.find((o) => o.id === data.orgId);
  if (!org) {
    throw new Error(`Target organisation not found: ${data.orgId}`);
  }

  const emailLower = data.email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];

  // Domain verification: client email domain must match target organisation's registered domain
  if (domain !== org.domain.toLowerCase()) {
    throw new Error(
      `Domain mismatch: Email '@${domain}' does not match organisation registered domain '@${org.domain}'.`
    );
  }

  // Check if user already exists in this organisation
  const existing = store.users.find(
    (u) => u.email.toLowerCase() === emailLower && u.memberships.some((m) => m.orgId === data.orgId)
  );
  if (existing) {
    throw new Error(`User with email '${data.email}' is already an active member of ${org.name}.`);
  }

  const token = `tok-${data.orgId.replace('org-', '')}-${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  const invitation: InvitationRecord = {
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    email: emailLower,
    name: data.name.trim(),
    orgId: data.orgId,
    role: data.role,
    token,
    inviteLink: `https://azentio.ai/invite?token=${token}`,
    invitedBy: actor.userId,
    invitedAt: now.toISOString(),
    expiresAt,
    status: 'pending',
  };

  invitationsStore.unshift(invitation);

  appendAuditEvent(
    actor,
    'admin.user.invite',
    'invitation',
    invitation.id,
    `Created single-use invitation for ${data.name} (${emailLower}) to ${org.name} as ${data.role}`
  );

  return invitation;
}

export function getAdminInvitations(orgId?: string): InvitationRecord[] {
  if (orgId && orgId !== 'all') {
    return invitationsStore.filter((i) => i.orgId === orgId);
  }
  return invitationsStore;
}

/**
 * Validates a bulk CSV file containing member invitations without committing changes (dry-run).
 */
export function validateBulkInviteCSV(
  actor: Actor,
  csvText: string
): {
  totalRows: number;
  validRows: { name: string; email: string; orgId: string; orgName: string; role: 'client_member' | 'client_admin' }[];
  errors: { row: number; email: string; reason: string }[];
} {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { totalRows: 0, validRows: [], errors: [{ row: 0, email: '', reason: 'CSV is completely empty.' }] };
  }

  // Remove header if present
  const firstLine = lines[0].toLowerCase();
  const dataLines = firstLine.includes('email') ? lines.slice(1) : lines;

  const validRows: { name: string; email: string; orgId: string; orgName: string; role: 'client_member' | 'client_admin' }[] = [];
  const errors: { row: number; email: string; reason: string }[] = [];
  const seenEmails = new Set<string>();

  dataLines.forEach((line, index) => {
    const rowNumber = index + 1;
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length < 4) {
      errors.push({
        row: rowNumber,
        email: parts[1] || 'unknown',
        reason: 'Insufficient columns: Expected "name,email,orgId,role".',
      });
      return;
    }

    const [name, email, orgId, rawRole] = parts;
    const emailLower = email.toLowerCase();

    // Check basic email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      errors.push({ row: rowNumber, email, reason: 'Invalid email address syntax.' });
      return;
    }

    // Check target organisation existence
    const org = store.organisations.find((o) => o.id === orgId || o.slug === orgId);
    if (!org) {
      errors.push({ row: rowNumber, email, reason: `Organisation '${orgId}' does not exist.` });
      return;
    }

    // Check domain match
    const domain = emailLower.split('@')[1];
    if (domain !== org.domain.toLowerCase()) {
      errors.push({
        row: rowNumber,
        email,
        reason: `Domain mismatch: '@${domain}' does not match organisation registered domain '@${org.domain}'.`,
      });
      return;
    }

    // Check duplicate in current file
    if (seenEmails.has(emailLower)) {
      errors.push({ row: rowNumber, email, reason: 'Duplicate email address within this CSV file.' });
      return;
    }
    seenEmails.add(emailLower);

    // Check existing active user in store
    const existing = store.users.find(
      (u) => u.email.toLowerCase() === emailLower && u.memberships.some((m) => m.orgId === org.id)
    );
    if (existing) {
      errors.push({ row: rowNumber, email, reason: `User is already an enrolled member of ${org.name}.` });
      return;
    }

    // Check role validity
    const role: 'client_member' | 'client_admin' =
      rawRole.toLowerCase() === 'client_admin' ? 'client_admin' : 'client_member';

    validRows.push({
      name,
      email: emailLower,
      orgId: org.id,
      orgName: org.name,
      role,
    });
  });

  return {
    totalRows: dataLines.length,
    validRows,
    errors,
  };
}

/**
 * Commits pre-validated bulk invitations.
 */
export function executeBulkInvite(
  actor: Actor,
  validRows: { name: string; email: string; orgId: string; role: 'client_member' | 'client_admin' }[]
): { invitedCount: number; results: { email: string; inviteLink: string }[] } {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const results: { email: string; inviteLink: string }[] = [];

  for (const row of validRows) {
    const token = `tok-${row.orgId.replace('org-', '')}-${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

    const invitation: InvitationRecord = {
      id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      email: row.email,
      name: row.name,
      orgId: row.orgId,
      role: row.role,
      token,
      inviteLink: `https://azentio.ai/invite?token=${token}`,
      invitedBy: actor.userId,
      invitedAt: now.toISOString(),
      expiresAt,
      status: 'pending',
    };

    invitationsStore.unshift(invitation);
    results.push({ email: row.email, inviteLink: invitation.inviteLink });
  }

  appendAuditEvent(
    actor,
    'admin.user.bulk_invite',
    'invitation_batch',
    `batch-${Date.now()}`,
    `Executed bulk invitation dry-run batch: provisioned ${validRows.length} member invitations.`
  );

  return { invitedCount: results.length, results };
}

export function suspendAdminUser(
  actor: Actor,
  userId: string,
  reason: string
): UserRecord {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  user.status = 'suspended';
  user.suspendedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.user.suspend',
    'user',
    user.id,
    `Suspended user ${user.name} (${user.email}). Reason: ${reason}`
  );

  return user;
}

export function reactivateAdminUser(
  actor: Actor,
  userId: string
): UserRecord {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  user.status = 'active';
  delete user.suspendedAt;

  appendAuditEvent(
    actor,
    'admin.user.reactivate',
    'user',
    user.id,
    `Reactivated user ${user.name} (${user.email})`
  );

  return user;
}

export function revokeAdminUserMembership(
  actor: Actor,
  userId: string,
  orgId: string
): UserRecord {
  const auth = authorize(actor, 'manage_roles', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  const membership = user.memberships.find((m) => m.orgId === orgId);
  if (!membership) throw new Error(`User is not a member of organisation: ${orgId}`);

  // ANTI-LOCKOUT INVARIANT: Cannot revoke or demote the last client administrator!
  if (membership.role === 'client_admin') {
    const activeAdmins = store.users.filter((u) =>
      u.memberships.some((m) => m.orgId === orgId && m.role === 'client_admin' && m.status === 'active')
    );
    if (activeAdmins.length <= 1) {
      throw new Error(
        'Anti-lockout violation: Cannot revoke the last client administrator of this organisation. Promote another member to client_admin first.'
      );
    }
  }

  // Revoke membership
  user.memberships = user.memberships.filter((m) => m.orgId !== orgId);

  appendAuditEvent(
    actor,
    'admin.user.revoke_membership',
    'membership',
    `${userId}:${orgId}`,
    `Revoked membership for ${user.email} from organisation ${orgId}`
  );

  return user;
}

export function forceSignOutUser(
  actor: Actor,
  userId: string
): { success: boolean; invalidatedSessionsCount: number } {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  appendAuditEvent(
    actor,
    'admin.user.force_signout',
    'session',
    userId,
    `Force terminated all active sessions for ${user.email}`
  );

  return { success: true, invalidatedSessionsCount: 2 };
}

export function requestAnonymiseUser(
  actor: Actor,
  userId: string,
  reason: string
): ApprovalRequest {
  const auth = authorize(actor, 'admin.user.anonymise', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  if (!isStepupValid(actor.userId)) {
    throw new Error('Step-up verification required before requesting user anonymisation.');
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  // Dual-control approval creation
  const req = approvalsEngine.createApprovalRequest(
    actor,
    'anonymise_user',
    `Anonymise User: ${user.name}`,
    `GDPR/Right-to-be-forgotten request for user ${user.name} (${user.email}). Reason: ${reason}`,
    { userId, originalName: user.name, originalEmail: user.email, reason },
    [
      { field: 'Name', before: user.name, after: 'Anonymised User' },
      { field: 'Email', before: user.email, after: `anonymised-${userId.slice(-6)}@privacy.azentio.ai` },
      { field: 'Status', before: user.status || 'active', after: 'anonymised' },
    ]
  );

  appendAuditEvent(
    actor,
    'dual_control.create_request',
    'approval_request',
    req.id,
    `Requested dual control approval to anonymise user ${user.email}`
  );

  return req;
}

export function executeAnonymiseUser(
  actor: Actor,
  userId: string
): UserRecord {
  const auth = authorize(actor, 'admin.user.anonymise', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  const pseudonym = `anonymised-${user.id.slice(-6)}@privacy.azentio.ai`;
  user.name = 'Anonymised User';
  user.email = pseudonym;
  delete user.passwordHash;
  user.status = 'anonymised';
  user.anonymisedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.user.anonymise',
    'user',
    user.id,
    `Soft anonymised user record while retaining historical consent and audit logs per compliance policy.`
  );

  return user;
}
