import { describe, it, expect, beforeEach } from 'vitest';
import { authorize } from '../authorize';
import { SEED_PERSONAS } from '../../dal/seed';
import {
  getPublishedObservations,
  getThemes,
  getClientObservations,
  createContribution,
  transitionContribution,
  MIN_DISTINCT_ORGS,
} from '../../dal/store';

describe('Authoritative Policy Engine (§7 & §17 Acceptance Gates)', () => {
  const publicVisitor = SEED_PERSONAS.public;
  const employee = SEED_PERSONAS.employee;
  const clientDavid = SEED_PERSONAS.client_member;
  const clientSarah = SEED_PERSONAS.client_admin;
  const moderatorLiam = SEED_PERSONAS.learning_moderator;
  const portalAdmin = SEED_PERSONAS.portal_admin;

  it('Gate 1: Public visitor denied from employee-only and tenant-only resources', () => {
    const employeeRes = authorize(publicVisitor, 'read', {
      kind: 'page',
      audience: 'employee',
    });
    expect(employeeRes.allow).toBe(false);

    const clientRes = authorize(publicVisitor, 'read', {
      kind: 'contribution',
      audience: 'tenant',
      orgId: 'org-alder',
    });
    expect(clientRes.allow).toBe(false);
  });

  it('Gate 2: Public visitor allowed to read public pages and submit demo enquiries', () => {
    const publicRead = authorize(publicVisitor, 'read', {
      kind: 'page',
      audience: 'public',
    });
    expect(publicRead.allow).toBe(true);

    const demoSubmit = authorize(publicVisitor, 'create', {
      kind: 'demo_enquiry',
      audience: 'public',
    });
    expect(demoSubmit.allow).toBe(true);
  });

  it('Gate 3: Tenant Isolation — Org A user cannot read Org B private workspace', () => {
    // David is in Alder Finance ('org-alder')
    const birchwayResource = {
      kind: 'contribution' as const,
      audience: 'tenant' as const,
      orgId: 'org-birchway',
    };
    const access = authorize(clientDavid, 'read', birchwayResource);
    expect(access.allow).toBe(false);
    expect(access.reason).toMatch(/Tenant isolation violation/);
  });

  it('Gate 4: Moderator boundary — Moderator CANNOT inspect unsubmitted private drafts', () => {
    const draftResource = {
      kind: 'contribution' as const,
      audience: 'shared_learning' as const,
      isDraft: true,
      orgId: 'org-alder',
      authorId: 'usr-client-david',
    };
    const res = authorize(moderatorLiam, 'read', draftResource);
    expect(res.allow).toBe(false);
    expect(res.reason).toMatch(/Moderators cannot inspect unsubmitted client drafts/);
  });

  it('Gate 5: Employee boundary — Ordinary employee without grants cannot moderate', () => {
    const modAction = authorize(employee, 'publish', {
      kind: 'contribution',
      audience: 'shared_learning',
      isDraft: false,
    });
    expect(modAction.allow).toBe(false);
    expect(modAction.reason).toMatch(/Requires learning_moderator grant/);
  });

  it('Gate 6: Client Admin cannot grant platform roles or access other tenants', () => {
    const platformGrantAction = authorize(clientSarah, 'grant_platform_role', {
      kind: 'org',
      audience: 'public',
    });
    expect(platformGrantAction.allow).toBe(false);
  });

  it('Gate 7: Synchronous withdrawal removes observation from shared feed & themes', () => {
    // Verify currently 3 live observations
    const beforeLive = getPublishedObservations(clientDavid);
    expect(beforeLive.length).toBe(3);

    // Verify themes have distinctOrgCount = 3
    const themesBefore = getThemes(clientDavid);
    expect(themesBefore[0].distinctOrgCount).toBe(3);
    expect(themesBefore[0].isSuppressed).toBe(false);

    // David withdraws his Alder Finance contribution
    transitionContribution(clientDavid, 'contrib-alder-01', { type: 'withdraw' });

    // Verify immediately removed from shared feed
    const afterLive = getPublishedObservations(clientDavid);
    expect(afterLive.length).toBe(2);

    // With 2 orgs remaining (Birchway + Cedar), aggregation safeguard triggers! (< 3 distinct orgs)
    const themesAfter = getThemes(clientDavid);
    expect(themesAfter[0].isSuppressed).toBe(true);
    expect(themesAfter[0].suppressionReason).toMatch(/Insufficient evidence/);
  });

  it('Gate 8: Privacy Payload — Shared read model structurally lacks authorId and tenantId', () => {
    const sharedObservations = getPublishedObservations(clientDavid);
    for (const obs of sharedObservations) {
      expect((obs as any).authorId).toBeUndefined();
      expect((obs as any).tenant_id).toBeUndefined();
      expect((obs as any).orgId).toBeUndefined();
      expect((obs as any).reviewer_notes).toBeUndefined();
      expect((obs as any).attachments).toBeUndefined();
      expect(obs.sourceContributionRef).toBe('[INTERNAL_DE-IDENTIFIED]');
    }
  });
});
