import { Actor, PlatformGrant, GrantRecord, ApprovalRequest, UserRecord } from '@/types';
import { store } from '@/server/dal/store';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';
import { approvalsEngine } from '@/server/services/approvals';
import { isStepupValid } from '@/server/services/stepup';

export interface EmployeeAllowlistEntry {
  id: string;
  email: string;
  name: string;
  department: string;
  title: string;
  addedBy: string;
  addedAt: string;
}

const initialAllowlist: EmployeeAllowlistEntry[] = [
  {
    id: 'emp-01',
    email: 'nithesh_m@azentio.com',
    name: 'Nithesh M',
    department: 'Engineering',
    title: 'Principal Systems Architect',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'emp-02',
    email: 'pranika_k@azentio.com',
    name: 'Pranika K',
    department: 'Knowledge Operations',
    title: 'Lead Learning Moderator',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'emp-03',
    email: 'nishanth_e@azentio.com',
    name: 'Nishanth E',
    department: 'Marketing & Content',
    title: 'Senior Content Strategy Manager',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'emp-04',
    email: 'lewis_hamilton@azentio.com',
    name: 'Lewis Hamilton',
    department: 'Product Strategy',
    title: 'VP of Product Intelligence',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'emp-05',
    email: 'max_verstappen@azentio.com',
    name: 'Max Verstappen',
    department: 'Platform Operations',
    title: 'Lead Platform Administrator',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'emp-06',
    email: 'fernando_alonso@azentio.com',
    name: 'Fernando Alonso',
    department: 'Platform Operations',
    title: 'Principal Security Officer',
    addedBy: 'usr-admin-max',
    addedAt: '2026-01-05T00:00:00Z',
  },
];

const initialGrants: GrantRecord[] = [
  {
    id: 'grant-01',
    userId: 'usr-admin-max',
    userEmail: 'max_verstappen@azentio.com',
    grant: 'portal_admin',
    grantedBy: 'system',
    grantedByName: 'System Provisioning',
    grantedAt: '2026-01-01T00:00:00Z',
    reason: 'Initial platform administrator setup',
    status: 'active',
  },
  {
    id: 'grant-02',
    userId: 'usr-admin-fernando',
    userEmail: 'fernando_alonso@azentio.com',
    grant: 'portal_admin',
    grantedBy: 'system',
    grantedByName: 'System Provisioning',
    grantedAt: '2026-01-05T00:00:00Z',
    reason: 'Secondary platform administrator for dual control',
    status: 'active',
  },
  {
    id: 'grant-03',
    userId: 'usr-admin-max',
    userEmail: 'max_verstappen@azentio.com',
    grant: 'content_publisher',
    grantedBy: 'system',
    grantedByName: 'System Provisioning',
    grantedAt: '2026-01-01T00:00:00Z',
    reason: 'Demo admin publisher grant',
    status: 'active',
  },
  {
    id: 'grant-04',
    userId: 'usr-pub-nishanth',
    userEmail: 'nishanth_e@azentio.com',
    grant: 'content_publisher',
    grantedBy: 'usr-admin-max',
    grantedByName: 'Max Verstappen',
    grantedAt: '2026-02-01T00:00:00Z',
    reason: 'Content publishing authority',
    status: 'active',
  },
  {
    id: 'grant-05',
    userId: 'usr-mod-pranika',
    userEmail: 'pranika_k@azentio.com',
    grant: 'learning_moderator',
    grantedBy: 'usr-admin-max',
    grantedByName: 'Max Verstappen',
    grantedAt: '2026-01-15T00:00:00Z',
    reason: 'Contribution collective learning moderation',
    status: 'active',
  },
  {
    id: 'grant-06',
    userId: 'usr-po-lewis',
    userEmail: 'lewis_hamilton@azentio.com',
    grant: 'product_owner',
    grantedBy: 'usr-admin-max',
    grantedByName: 'Max Verstappen',
    grantedAt: '2026-02-10T00:00:00Z',
    reason: 'Product improvement loop owner',
    status: 'active',
  },
];

class GrantsStore {
  allowlist: EmployeeAllowlistEntry[] = JSON.parse(JSON.stringify(initialAllowlist));
  grants: GrantRecord[] = JSON.parse(JSON.stringify(initialGrants));

  reset() {
    this.allowlist = JSON.parse(JSON.stringify(initialAllowlist));
    this.grants = JSON.parse(JSON.stringify(initialGrants));
  }
}

export const grantsStore = new GrantsStore();

// Allowlist Functions
export function getEmployeeAllowlist(actor: Actor): EmployeeAllowlistEntry[] {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }
  return grantsStore.allowlist;
}

export function addEmployeeToAllowlist(
  actor: Actor,
  data: { email: string; name: string; department: string; title: string }
): EmployeeAllowlistEntry {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const emailLower = data.email.toLowerCase().trim();
  if (!emailLower.endsWith('@azentio.com')) {
    throw new Error("Employee email domain must strictly be '@azentio.com'.");
  }

  const existing = grantsStore.allowlist.find((e) => e.email.toLowerCase() === emailLower);
  if (existing) {
    throw new Error(`Email '${data.email}' is already present in the employee allowlist.`);
  }

  const entry: EmployeeAllowlistEntry = {
    id: `emp-${Date.now().toString(36)}`,
    email: emailLower,
    name: data.name.trim(),
    department: data.department.trim(),
    title: data.title.trim(),
    addedBy: actor.userId,
    addedAt: new Date().toISOString(),
  };

  grantsStore.allowlist.unshift(entry);

  appendAuditEvent(
    actor,
    'admin.employee.allowlist_add',
    'employee_allowlist',
    entry.id,
    `Added ${data.name} (${emailLower}) to employee allowlist (${data.department})`
  );

  return entry;
}

export function validateBulkEmployeeAllowlist(
  actor: Actor,
  csvText: string
): {
  total: number;
  valid: { name: string; email: string; department: string; title: string }[];
  errors: { row: number; email: string; reason: string }[];
} {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { total: 0, valid: [], errors: [{ row: 0, email: '', reason: 'CSV is completely empty.' }] };
  }

  const firstLine = lines[0].toLowerCase();
  const dataLines = firstLine.includes('email') ? lines.slice(1) : lines;

  const valid: { name: string; email: string; department: string; title: string }[] = [];
  const errors: { row: number; email: string; reason: string }[] = [];
  const seenEmails = new Set<string>();

  dataLines.forEach((line, index) => {
    const rowNumber = index + 1;
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length < 4) {
      errors.push({
        row: rowNumber,
        email: parts[1] || 'unknown',
        reason: 'Expected 4 columns: name,email,department,title',
      });
      return;
    }

    const [name, email, department, title] = parts;
    const emailLower = email.toLowerCase();

    if (!emailLower.endsWith('@azentio.com')) {
      errors.push({
        row: rowNumber,
        email,
        reason: "Domain mismatch: Employee email domain must be '@azentio.com'.",
      });
      return;
    }

    if (seenEmails.has(emailLower)) {
      errors.push({ row: rowNumber, email, reason: 'Duplicate email in this CSV batch.' });
      return;
    }
    seenEmails.add(emailLower);

    if (grantsStore.allowlist.some((e) => e.email.toLowerCase() === emailLower)) {
      errors.push({ row: rowNumber, email, reason: 'Already present on employee allowlist.' });
      return;
    }

    valid.push({ name, email: emailLower, department, title });
  });

  return { total: dataLines.length, valid, errors };
}

export function executeBulkEmployeeAllowlist(
  actor: Actor,
  validRows: { name: string; email: string; department: string; title: string }[]
): { count: number } {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  for (const row of validRows) {
    grantsStore.allowlist.unshift({
      id: `emp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      email: row.email,
      name: row.name,
      department: row.department,
      title: row.title,
      addedBy: actor.userId,
      addedAt: new Date().toISOString(),
    });
  }

  appendAuditEvent(
    actor,
    'admin.employee.bulk_allowlist',
    'employee_allowlist',
    `batch-${Date.now()}`,
    `Bulk added ${validRows.length} employees to the verified employee allowlist.`
  );

  return { count: validRows.length };
}

// Platform Grants Functions
export function getPlatformGrants(
  actor: Actor,
  filter?: { grant?: PlatformGrant; status?: GrantRecord['status'] }
): GrantRecord[] {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  let list = grantsStore.grants;
  if (filter?.grant && filter.grant !== ('all' as any)) {
    list = list.filter((g) => g.grant === filter.grant);
  }
  if (filter?.status && filter.status !== ('all' as any)) {
    list = list.filter((g) => g.status === filter.status);
  }

  return list;
}

export function assignPlatformGrant(
  actor: Actor,
  targetUserId: string,
  grant: PlatformGrant,
  reason: string,
  skipStepup = false
): {
  status: 'active' | 'pending_approval';
  grantRecord?: GrantRecord;
  approvalRequest?: ApprovalRequest;
} {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const targetUser = store.users.find((u) => u.id === targetUserId);
  if (!targetUser) {
    throw new Error(`Target user not found: ${targetUserId}`);
  }

  // Only verified employees can hold platform grants
  if (!targetUser.isVerifiedEmployee) {
    throw new Error('Platform grants can only be granted to verified Azentio employees (@azentio.com).');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed operational reason (minimum 5 characters) is required to assign platform grants.');
  }

  const isSelfGrant = targetUserId === actor.userId;
  const isPortalAdminGrant = grant === 'portal_admin';

  // DUAL CONTROL REQUIREMENT:
  // 1. Assigning portal_admin ALWAYS requires dual control.
  // 2. Self-granting ANY platform grant ALWAYS requires dual control.
  if (isSelfGrant || isPortalAdminGrant) {
    if (!skipStepup && !isStepupValid(actor.userId)) {
      throw new Error('Step-up authentication required for privileged grant assignment.');
    }

    const actionType = isPortalAdminGrant ? 'grant_portal_admin' : 'self_grant';
    const title = isPortalAdminGrant
      ? `Grant Portal Admin to ${targetUser.name}`
      : `Self-Grant ${grant} by ${actor.name}`;

    const approvalReq = approvalsEngine.createApprovalRequest(
      actor,
      actionType,
      title,
      `Request to assign '${grant}' grant to ${targetUser.name} (${targetUser.email}). Reason: ${reason}`,
      { targetUserId, targetUserName: targetUser.name, targetUserEmail: targetUser.email, grant, reason },
      [
        { field: 'Grant', before: 'None', after: grant },
        { field: 'Dual Control', before: 'Single Requester', after: 'Awaiting Second Admin Approval' },
      ]
    );

    appendAuditEvent(
      actor,
      'dual_control.create_request',
      'approval_request',
      approvalReq.id,
      `Requested dual-control approval to assign '${grant}' grant to ${targetUser.email}`
    );

    return { status: 'pending_approval', approvalRequest: approvalReq };
  }

  // Direct Grant Assignment for learning_moderator, content_publisher, product_owner to third party
  if (targetUser.platformGrants.includes(grant)) {
    throw new Error(`User ${targetUser.name} already holds the active '${grant}' grant.`);
  }

  const grantRecord: GrantRecord = {
    id: `grant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    userId: targetUser.id,
    userEmail: targetUser.email,
    grant,
    grantedBy: actor.userId,
    grantedByName: actor.name,
    grantedAt: new Date().toISOString(),
    reason,
    status: 'active',
  };

  grantsStore.grants.unshift(grantRecord);
  targetUser.platformGrants.push(grant);

  appendAuditEvent(
    actor,
    'admin.grant.assign',
    'platform_grant',
    grantRecord.id,
    `Assigned platform grant '${grant}' to ${targetUser.name} (${targetUser.email})`
  );

  return { status: 'active', grantRecord };
}

export function revokePlatformGrant(
  actor: Actor,
  grantRecordId: string,
  reason: string
): { success: boolean } {
  const auth = authorize(actor, 'admin.grant.assign', { kind: 'membership', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const record = grantsStore.grants.find((g) => g.id === grantRecordId);
  if (!record) {
    throw new Error(`Grant record not found: ${grantRecordId}`);
  }

  // ANTI-LOCKOUT INVARIANT: Cannot revoke the last active portal_admin!
  if (record.grant === 'portal_admin') {
    const activePortalAdmins = grantsStore.grants.filter(
      (g) => g.grant === 'portal_admin' && g.status === 'active'
    );
    if (activePortalAdmins.length <= 1) {
      throw new Error(
        'Anti-lockout violation: Cannot revoke the last active portal administrator of the platform.'
      );
    }
  }

  record.status = 'revoked';

  // Remove grant from user object
  const user = store.users.find((u) => u.id === record.userId);
  if (user) {
    user.platformGrants = user.platformGrants.filter((g) => g !== record.grant);
  }

  appendAuditEvent(
    actor,
    'admin.grant.revoke',
    'platform_grant',
    record.id,
    `Revoked '${record.grant}' grant from ${record.userEmail}. Reason: ${reason}`
  );

  return { success: true };
}
