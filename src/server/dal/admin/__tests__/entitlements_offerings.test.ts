import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminEntitlementRequests,
  approveEntitlementRequest,
  declineEntitlementRequest,
  getAdminOfferings,
  createAdminOffering,
  updateAdminOffering,
  retireAdminOffering,
  entitlementsOfferingsStore,
} from '../entitlements_offerings';
import { Actor } from '@/types';
import { store } from '@/server/dal/store';

describe('Admin Entitlements & Offerings Catalogue DAL', () => {
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
    entitlementsOfferingsStore.reset();
  });

  describe('Entitlement Requests', () => {
    it('Allows portal admin to list and filter entitlement requests', () => {
      const all = getAdminEntitlementRequests(adminActor);
      expect(all.length).toBeGreaterThan(0);

      const open = getAdminEntitlementRequests(adminActor, { status: 'open' });
      expect(open.every((r) => r.status === 'open')).toBe(true);
    });

    it('Approving a request grants offering to target org and notifies client', () => {
      // req-ent-01 is for org-cedar requesting offering-aml
      const cedarBefore = store.organisations.find((o) => o.id === 'org-cedar');
      expect(cedarBefore?.entitledOfferings).not.toContain('offering-aml');

      const result = approveEntitlementRequest(adminActor, 'req-ent-01');
      expect(result.success).toBe(true);
      expect(result.request.status).toBe('approved');

      // Check organization got the entitlement
      const cedarAfter = store.organisations.find((o) => o.id === 'org-cedar');
      expect(cedarAfter?.entitledOfferings).toContain('offering-aml');

      // Check in-app notification sent
      const notif = store.notifications.find((n) => n.userId === 'usr-client-virat');
      expect(notif).toBeDefined();
      expect(notif?.title).toContain('Entitlement Approved');
    });

    it('Declining a request sets explanation message and notifies client', () => {
      const result = declineEntitlementRequest(
        adminActor,
        'req-ent-01',
        'Tier upgrade required for AML module deployment.'
      );
      expect(result.success).toBe(true);
      expect(result.request.status).toBe('declined');
      expect(result.request.reviewMessage).toContain('Tier upgrade required');

      const notif = store.notifications.find((n) => n.userId === 'usr-client-virat');
      expect(notif?.title).toContain('Entitlement Request Declined');
    });
  });

  describe('Offerings Catalogue', () => {
    it('Lists offerings with computed active subscribed tenants and demo links', () => {
      const offerings = getAdminOfferings(adminActor);
      expect(offerings.length).toBeGreaterThan(0);

      const fai = offerings.find((o) => o.id === 'offering-fai');
      expect(fai).toBeDefined();
      expect(fai?.subscribedTenantsCount).toBeGreaterThan(0);
      expect(fai?.linkedDemoScenarios?.length).toBeGreaterThan(0);
    });

    it('Creates and updates offerings in the catalogue', () => {
      const created = createAdminOffering(adminActor, {
        name: 'Autonomous Credit Underwriting',
        category: 'Lending',
        tagline: 'Instant algorithmic credit scoring',
        description: 'Deep neural networks for risk analysis',
        features: ['Automated Bureau Ingestion', 'Cash-Flow Covariance'],
        sandboxAvailable: true,
        badge: 'New AI',
      });

      expect(created.id).toBeDefined();
      expect(created.status).toBe('active');

      const updated = updateAdminOffering(adminActor, created.id, {
        tagline: 'Next-gen credit scoring engine',
      });
      expect(updated.tagline).toBe('Next-gen credit scoring engine');
    });

    it('Retires an offering and reports subscribed tenant count warning', () => {
      const result = retireAdminOffering(
        adminActor,
        'offering-dls',
        'Sunset legacy scoring model'
      );
      expect(result.success).toBe(true);
      expect(result.subscribedTenantsCount).toBeGreaterThan(0);

      const list = getAdminOfferings(adminActor);
      const dls = list.find((o) => o.id === 'offering-dls');
      expect(dls?.status).toBe('retired');
    });
  });
});

