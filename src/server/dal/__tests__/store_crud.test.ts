import { describe, it, expect } from 'vitest';
import {
  authenticateUser,
  getAllUsers,
  getUsersByOrg,
  createUser,
  updateUser,
  deleteUser,
  createOrganisation,
  deleteOrganisation,
  getOrganisations,
} from '../store';
import { Actor } from '@/types';

const portalAdminActor: Actor = {
  userId: 'usr-admin-1',
  name: 'Max Verstappen',
  email: 'max_verstappen@azentio.com',
  platformGrants: ['portal_admin', 'learning_moderator', 'content_publisher', 'product_owner'],
  memberships: [],
  isVerifiedEmployee: true,
};

describe('Dynamic Auth and Admin Store Operations', () => {
  it('authenticates seeded users from the database', () => {
    const auth = authenticateUser('max_verstappen@azentio.com');
    expect(auth.user.email).toBe('max_verstappen@azentio.com');
    expect(auth.user.role).toBe('portal_admin');
    expect(auth.redirectPath).toBe('/admin/orgs');
    expect(auth.actor.platformGrants).toContain('portal_admin');
  });

  it('rejects unknown emails not present in database', () => {
    expect(() => authenticateUser('hacker@unknown.com')).toThrowError(
      /is not registered in the system database/
    );
  });

  it('prevents assigning client roles to Azentio organization', () => {
    expect(() =>
      createUser(portalAdminActor, {
        email: 'invalid_role@azentio.com',
        name: 'Invalid Test',
        role: 'client_admin',
        orgId: 'org-azentio',
      })
    ).toThrowError(/Azentio organization only accepts platform roles/);
  });

  it('prevents assigning platform roles to client organizations', () => {
    expect(() =>
      createUser(portalAdminActor, {
        email: 'invalid_role@abcd.in',
        name: 'Invalid Test',
        role: 'portal_admin',
        orgId: 'org-abcd',
      })
    ).toThrowError(/Client organizations only accept client roles/);
  });

  it('creates, updates, and deletes a client user dynamically in DB', () => {
    const newUser = createUser(portalAdminActor, {
      email: 'kl_rahul@abcd.in',
      name: 'KL Rahul',
      role: 'client_member',
      orgId: 'org-abcd',
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.email).toBe('kl_rahul@abcd.in');

    // Dynamic auth now works for the newly created user
    const auth = authenticateUser('kl_rahul@abcd.in');
    expect(auth.user.name).toBe('KL Rahul');
    expect(auth.redirectPath).toBe('/client');

    // Update user
    const updated = updateUser(portalAdminActor, newUser.id, { name: 'K. L. Rahul' });
    expect(updated.name).toBe('K. L. Rahul');

    // Delete user
    deleteUser(portalAdminActor, newUser.id);
    expect(() => authenticateUser('kl_rahul@abcd.in')).toThrowError(
      /is not registered in the system database/
    );
  });

  it('creates and deletes client organisations while protecting Azentio root org', () => {
    // Attempting to delete org-azentio must throw
    expect(() => deleteOrganisation(portalAdminActor, 'org-azentio')).toThrowError(
      'Protected organisation: Cannot delete Azentio Platform.'
    );

    // Create a new client org
    const newOrg = createOrganisation(portalAdminActor, {
      name: 'Test Bank Ltd',
      domain: 'testbank.com',
    });
    expect(newOrg.id).toBeDefined();
    expect(getOrganisations().some((o) => o.id === newOrg.id)).toBe(true);

    // Clean up
    deleteOrganisation(portalAdminActor, newOrg.id);
    expect(getOrganisations().some((o) => o.id === newOrg.id)).toBe(false);
  });
});
