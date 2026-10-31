import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminUsers,
  getAdminUserById,
  inviteAdminUser,
  validateBulkInviteCSV,
  executeBulkInvite,
  suspendAdminUser,
  reactivateAdminUser,
  revokeAdminUserMembership,
  forceSignOutUser,
  requestAnonymiseUser,
  executeAnonymiseUser,
} from '../users';
import { Actor } from '@/types';
import { store } from '@/server/dal/store';
import { requestStepup, verifyStepup, clearStepup } from '@/server/services/stepup';

describe('Admin Users & Bulk Invitations DAL', () => {
  const adminActor: Actor = {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  const clientActor: Actor = {
    userId: 'usr-client-virat',
    name: 'Virat Kohli',
    email: 'virat_kohli@abcd.in',
    platformGrants: [],
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    activeTenantId: 'org-abcd',
    isVerifiedEmployee: false,
  };

  beforeEach(() => {
    store.reset();
    clearStepup(adminActor.userId);
  });

  it('Denies non-admin actors from inspecting or managing users across organisations', () => {
    expect(() => getAdminUsers(clientActor)).toThrow(/verified employee|portal_admin/i);
    expect(() =>
      inviteAdminUser(clientActor, {
        name: 'Test',
        email: 'test@abcd.in',
        orgId: 'org-abcd',
        role: 'client_member',
      })
    ).toThrow(/verified employee|portal_admin/i);
  });

  it('Enforces domain matching on single invitations', () => {
    // abcd.in domain match
    const validInv = inviteAdminUser(adminActor, {
      name: 'Ravi Ashwin',
      email: 'ravi_ashwin@abcd.in',
      orgId: 'org-abcd',
      role: 'client_member',
    });
    expect(validInv.token).toBeDefined();
    expect(validInv.inviteLink).toContain('token=');

    // Mismatched domain MUST THROW
    expect(() =>
      inviteAdminUser(adminActor, {
        name: 'Ravi Ashwin',
        email: 'ravi_ashwin@gmail.com',
        orgId: 'org-abcd',
        role: 'client_member',
      })
    ).toThrow(/Domain mismatch/);
  });

  it('Dry-run CSV validation correctly detects invalid domains, bad syntax and duplicates', () => {
    const csv = `name,email,orgId,role
Jasprit Bumrah,jasprit@abcd.in,org-abcd,client_member
Bad Domain,baddomain@yahoo.com,org-abcd,client_member
Duplicate One,jasprit@abcd.in,org-abcd,client_member
Invalid Email,invalid-email,org-abcd,client_member
Missing Org,someone@nowhere.com,org-nonexistent,client_member`;

    const dryRun = validateBulkInviteCSV(adminActor, csv);
    expect(dryRun.totalRows).toBe(5);
    expect(dryRun.validRows.length).toBe(1);
    expect(dryRun.validRows[0].email).toBe('jasprit@abcd.in');
    expect(dryRun.errors.length).toBe(4);

    // Errors explanations
    expect(dryRun.errors.some((e) => e.reason.includes('Domain mismatch'))).toBe(true);
    expect(dryRun.errors.some((e) => e.reason.includes('Duplicate email'))).toBe(true);
    expect(dryRun.errors.some((e) => e.reason.includes('syntax'))).toBe(true);
    expect(dryRun.errors.some((e) => e.reason.includes('does not exist'))).toBe(true);
  });

  it('Executes valid bulk invitations cleanly', () => {
    const validRows = [
      { name: 'Player 1', email: 'p1@abcd.in', orgId: 'org-abcd', role: 'client_member' as const },
      { name: 'Player 2', email: 'p2@abcd.in', orgId: 'org-abcd', role: 'client_member' as const },
    ];

    const result = executeBulkInvite(adminActor, validRows);
    expect(result.invitedCount).toBe(2);
    expect(result.results.length).toBe(2);
    expect(result.results[0].inviteLink).toContain('https://azentio.ai/invite?token=');
  });

  it('Anti-lockout invariant: Prevents revoking the last client administrator of an organisation', () => {
    // In org-xyz, MS Dhoni is the only client_admin
    expect(() =>
      revokeAdminUserMembership(adminActor, 'usr-client-dhoni', 'org-xyz')
    ).toThrow(/Anti-lockout violation: Cannot revoke the last client administrator/);
  });

  it('User lifecycle: Suspend, reactivate, force sign-out, and anonymisation with dual control', () => {
    const suspended = suspendAdminUser(adminActor, 'usr-client-virat', 'Test hold');
    expect(suspended.status).toBe('suspended');

    const reactivated = reactivateAdminUser(adminActor, 'usr-client-virat');
    expect(reactivated.status).toBe('active');

    const signOut = forceSignOutUser(adminActor, 'usr-client-virat');
    expect(signOut.success).toBe(true);

    // Anonymisation requires step-up
    expect(() =>
      requestAnonymiseUser(adminActor, 'usr-client-virat', 'GDPR Request')
    ).toThrow(/Step-up verification required/);

    // Perform stepup
    requestStepup(adminActor.userId, 'Anonymise');
    verifyStepup(adminActor.userId, '123456');

    const approvalReq = requestAnonymiseUser(adminActor, 'usr-client-virat', 'GDPR Request');
    expect(approvalReq.actionType).toBe('anonymise_user');
    expect(approvalReq.status).toBe('pending');

    // Execution anonymises while keeping record
    const anonymised = executeAnonymiseUser(adminActor, 'usr-client-virat');
    expect(anonymised.name).toBe('Anonymised User');
    expect(anonymised.email).toMatch(/anonymised-.*@privacy\.azentio\.ai/);
    expect(anonymised.status).toBe('anonymised');
  });
});
