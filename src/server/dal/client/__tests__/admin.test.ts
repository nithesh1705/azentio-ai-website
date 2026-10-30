import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOrgMembers,
  createMemberInvitation,
  changeMemberRole,
  revokeMember,
  restoreMember,
  getOrgInvitations,
} from '../admin';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Admin Members DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const adminActor: Actor = {
    userId: 'usr-client-dhoni',
    email: 'dhoni.ms@xyz.com',
    name: 'MS Dhoni',
    isVerifiedEmployee: false,
    activeTenantId: 'org-xyz',
    memberships: [{ orgId: 'org-xyz', role: 'client_admin', status: 'active' }],
    platformGrants: [],
  };

  const memberActor: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  it('rejects non-admin users from accessing member management', () => {
    expect(() => getOrgMembers(memberActor)).toThrow('Only client administrators');
  });

  it('lists members belonging to active tenant', () => {
    const members = getOrgMembers(adminActor);
    expect(members.length).toBeGreaterThan(0);
    expect(members.some((m) => m.userId === 'usr-client-dhoni')).toBe(true);
  });

  it('creates single-use invitation with honest manual delivery notice', () => {
    const res = createMemberInvitation(adminActor, {
      email: 'new_analyst@xyz.com',
      role: 'client_member',
    });

    expect(res.invitation.id).toBeDefined();
    expect(res.token).toBeDefined();
    expect(res.inviteLink).toContain('/invite/');
    expect(res.honestNotice).toContain('Share this link with the invitee — not sent by system');

    const invites = getOrgInvitations(adminActor);
    expect(invites.some((i) => i.email === 'new_analyst@xyz.com')).toBe(true);
  });

  it('blocks demoting or revoking the last administrator of the organisation', () => {
    // Dhoni is the only client_admin seeded for org-xyz
    expect(() =>
      changeMemberRole(adminActor, 'usr-client-dhoni', 'client_member')
    ).toThrow('Cannot demote the last administrator');

    expect(() => revokeMember(adminActor, 'usr-client-dhoni')).toThrow(
      'Cannot revoke the last administrator'
    );
  });

  it('allows revoking and restoring non-admin members', () => {
    // Add another member to org-xyz
    const hardik = store.users.find((u) => u.id === 'usr-client-hardik')!;
    expect(hardik).toBeDefined();

    const revoked = revokeMember(adminActor, 'usr-client-hardik');
    expect(revoked).toBe(true);

    const memAfterRevoke = hardik.memberships.find((m) => m.orgId === 'org-xyz');
    expect(memAfterRevoke?.status).toBe('suspended');

    const restored = restoreMember(adminActor, 'usr-client-hardik');
    expect(restored).toBe(true);

    const memAfterRestore = hardik.memberships.find((m) => m.orgId === 'org-xyz');
    expect(memAfterRestore?.status).toBe('active');
  });
});
