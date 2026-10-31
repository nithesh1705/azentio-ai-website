import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEmployeeAllowlist,
  addEmployeeToAllowlist,
  validateBulkEmployeeAllowlist,
  executeBulkEmployeeAllowlist,
  getPlatformGrants,
  assignPlatformGrant,
  revokePlatformGrant,
  grantsStore,
} from '../grants';
import { Actor } from '@/types';
import { store } from '@/server/dal/store';
import { requestStepup, verifyStepup, clearStepup } from '@/server/services/stepup';

describe('Admin Platform Grants & Employee Allowlist DAL', () => {
  const adminMax: Actor = {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
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
    grantsStore.reset();
    clearStepup(adminMax.userId);
  });

  it('Enforces verified employee @azentio.com domain on allowlist', () => {
    const entry = addEmployeeToAllowlist(adminMax, {
      name: 'Rishabh Pant',
      email: 'rishabh_p@azentio.com',
      department: 'Platform Engineering',
      title: 'Senior Site Reliability Engineer',
    });
    expect(entry.id).toBeDefined();

    // External domain MUST FAIL
    expect(() =>
      addEmployeeToAllowlist(adminMax, {
        name: 'External Person',
        email: 'external@gmail.com',
        department: 'External',
        title: 'Consultant',
      })
    ).toThrow(/Employee email domain must strictly be '@azentio.com'/);
  });

  it('Dry-run validates bulk employee allowlist', () => {
    const csv = `name,email,department,title
Worker 1,w1@azentio.com,Eng,Dev
Worker 2,w2@gmail.com,Eng,Dev
Worker 3,w1@azentio.com,Eng,Dev`;

    const dryRun = validateBulkEmployeeAllowlist(adminMax, csv);
    expect(dryRun.total).toBe(3);
    expect(dryRun.valid.length).toBe(1);
    expect(dryRun.errors.length).toBe(2);
    expect(dryRun.errors[0].reason).toContain('Domain mismatch');
    expect(dryRun.errors[1].reason).toContain('Duplicate email');
  });

  it('Allows portal admin to assign non-privileged grant directly to another employee', () => {
    // usr-mod-pranika already has learning_moderator, let's assign product_owner
    const result = assignPlatformGrant(
      adminMax,
      'usr-mod-pranika',
      'product_owner',
      'Assigned for seasonal roadmapping'
    );
    expect(result.status).toBe('active');
    expect(result.grantRecord).toBeDefined();
    expect(result.grantRecord?.grant).toBe('product_owner');
  });

  it('DUAL CONTROL INVARIANT: Assigning portal_admin requires step-up and creates approval request', () => {
    // Attempting without step-up MUST THROW
    expect(() =>
      assignPlatformGrant(
        adminMax,
        'usr-pub-nishanth',
        'portal_admin',
        'Promotion to admin'
      )
    ).toThrow(/Step-up authentication required/);

    // Verify stepup
    requestStepup(adminMax.userId, 'Assign portal_admin');
    verifyStepup(adminMax.userId, '123456');

    const result = assignPlatformGrant(
      adminMax,
      'usr-pub-nishanth',
      'portal_admin',
      'Promotion to admin'
    );
    expect(result.status).toBe('pending_approval');
    expect(result.approvalRequest?.actionType).toBe('grant_portal_admin');
    expect(result.approvalRequest?.status).toBe('pending');
  });

  it('DUAL CONTROL INVARIANT: Self-granting any role requires dual-control approval', () => {
    requestStepup(adminMax.userId, 'Self-grant');
    verifyStepup(adminMax.userId, '123456');

    const result = assignPlatformGrant(
      adminMax,
      adminMax.userId,
      'learning_moderator',
      'Self-assigned moderator grant'
    );
    expect(result.status).toBe('pending_approval');
    expect(result.approvalRequest?.actionType).toBe('self_grant');
  });

  it('Denies assigning platform grants to non-employee client users', () => {
    expect(() =>
      assignPlatformGrant(
        adminMax,
        'usr-client-virat',
        'learning_moderator',
        'Attempt to grant client a platform role'
      )
    ).toThrow(/Platform grants can only be granted to verified Azentio employees/);
  });

  it('ANTI-LOCKOUT INVARIANT: Cannot revoke the last active portal administrator', () => {
    // Seed has 2 admins: max (grant-01) and fernando (grant-02)
    // Revoking fernando leaves only max
    revokePlatformGrant(adminMax, 'grant-02', 'Leaving platform operations team');

    // Attempting to revoke max MUST THROW
    expect(() =>
      revokePlatformGrant(adminMax, 'grant-01', 'Revoking last admin')
    ).toThrow(/Anti-lockout violation: Cannot revoke the last active portal administrator/);
  });
});
