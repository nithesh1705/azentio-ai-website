import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminOrganisations,
  getAdminOrganisationById,
  createAdminOrganisation,
  updateAdminOrganisation,
  suspendAdminOrganisation,
  reactivateAdminOrganisation,
  requestArchiveOrganisation,
  exportOrganisationsCSV,
} from '../orgs';
import { Actor } from '@/types';
import { store } from '@/server/dal/store';
import { requestStepup, verifyStepup, clearStepup } from '@/server/services/stepup';

describe('Admin Organisations DAL', () => {
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

  it('Denies non-admin actors by default', () => {
    expect(() => getAdminOrganisations(clientActor)).toThrow(/verified employee|portal_admin/i);
    expect(() =>
      createAdminOrganisation(clientActor, {
        name: 'Malicious Org',
        domain: 'malicious.com',
        tier: 'Standard',
        entitledOfferings: [],
      })
    ).toThrow(/verified employee|portal_admin/i);
  });

  it('Allows portal admin to list, filter and fetch organisations', () => {
    const all = getAdminOrganisations(adminActor);
    expect(all.length).toBeGreaterThan(0);

    const filtered = getAdminOrganisations(adminActor, { search: 'abcd' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].domain).toBe('abcd.in');

    const details = getAdminOrganisationById(adminActor, 'org-abcd');
    expect(details).toBeDefined();
    expect(details?.org.name).toMatch(/ABCD Technologies/);
    expect(details?.users.length).toBeGreaterThan(0);
  });

  it('Creates a new organisation with unique domain enforcement', () => {
    const newOrg = createAdminOrganisation(adminActor, {
      name: 'Starlight Bank',
      domain: 'starlight.sg',
      tier: 'Enterprise',
      entitledOfferings: ['offering-fai'],
    });

    expect(newOrg.id).toBeDefined();
    expect(newOrg.slug).toBe('starlight-bank');

    // Duplicate domain must fail
    expect(() =>
      createAdminOrganisation(adminActor, {
        name: 'Starlight Clone',
        domain: 'starlight.sg',
        tier: 'Standard',
        entitledOfferings: [],
      })
    ).toThrow(/already registered/);
  });

  it('Suspends and reactivates organisations with step-up verification', () => {
    // Stepup verification
    requestStepup(adminActor.userId, 'Suspend Org');
    verifyStepup(adminActor.userId, '123456');

    const suspended = suspendAdminOrganisation(
      adminActor,
      'org-abcd',
      'Contract renewal overdue by 60 days'
    );
    expect(suspended.status).toBe('suspended');
    expect(suspended.suspendedReason).toBe('Contract renewal overdue by 60 days');

    const reactivated = reactivateAdminOrganisation(adminActor, 'org-abcd');
    expect(reactivated.status).toBe('active');
    expect(reactivated.suspendedReason).toBeUndefined();
  });

  it('Prevents suspending or archiving platform root organisation', () => {
    expect(() =>
      suspendAdminOrganisation(adminActor, 'org-azentio', 'Test reason for platform', true)
    ).toThrow(/Platform organisation cannot be suspended/);

    expect(() =>
      requestArchiveOrganisation(adminActor, 'org-azentio', 'Test archive')
    ).toThrow(/Platform organisation cannot be archived/);
  });

  it('Creates dual-control approval request when archiving an organisation', () => {
    const approvalReq = requestArchiveOrganisation(
      adminActor,
      'org-cedar',
      'Completed asset wind-down'
    );

    expect(approvalReq.actionType).toBe('archive_organisation');
    expect(approvalReq.status).toBe('pending');
    expect(approvalReq.payload.orgId).toBe('org-cedar');
  });

  it('Exports organisations as CSV and records audit event', () => {
    const csv = exportOrganisationsCSV(adminActor);
    expect(csv).toContain('ID,Name,Slug,Domain,Tier,Status,Members,Offerings');
    expect(csv).toContain('abcd.in');

    const latestAudit = store.auditEvents[0];
    expect(latestAudit.action).toBe('admin.orgs.export_csv');
  });
});
