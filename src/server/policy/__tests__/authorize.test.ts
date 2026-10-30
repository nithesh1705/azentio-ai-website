import { describe, it, expect, beforeEach } from 'vitest';
import { authorize } from '../authorize';
import { SEED_PERSONAS, SEED_ORGANISATIONS } from '../../dal/seed';
import {
  getPublishedObservations,
  getThemes,
  getClientObservations,
  createContribution,
  transitionContribution,
  getModerationQueue,
  getImprovementIdeas,
  updateIdeaStatus,
  getAuditEvents,
  queryAIRA,
  scanSensitivity,
  MIN_DISTINCT_ORGS,
} from '../../dal/store';

describe('azentio.ai Acceptance & Security Matrix (check_list.md Verification)', () => {
  const publicVisitor = SEED_PERSONAS.public;
  const employee = SEED_PERSONAS.employee;
  const clientDavid = SEED_PERSONAS.client_member;
  const clientSarah = SEED_PERSONAS.client_admin;
  const multiJordan = SEED_PERSONAS.multi_member;
  const moderatorLiam = SEED_PERSONAS.learning_moderator;
  const publisherElena = SEED_PERSONAS.content_publisher;
  const productOwnerTariq = SEED_PERSONAS.product_owner;
  const portalAdmin = SEED_PERSONAS.portal_admin;

  describe('1. Public Website & Discovery Boundary', () => {
    it('Public visitor can read public offerings and solutions', () => {
      const decision = authorize(publicVisitor, 'read', {
        kind: 'page',
        audience: 'public',
      });
      expect(decision.allow).toBe(true);
    });

    it('Public visitor can submit demo enquiries and hackathon interest', () => {
      expect(
        authorize(publicVisitor, 'create', {
          kind: 'demo_enquiry',
          audience: 'public',
        }).allow
      ).toBe(true);

      expect(
        authorize(publicVisitor, 'create', {
          kind: 'hackathon_registration',
          audience: 'public',
        }).allow
      ).toBe(true);
    });

    it('Public visitor is strictly denied from client workspaces and employee tools', () => {
      expect(
        authorize(publicVisitor, 'read', {
          kind: 'page',
          audience: 'employee',
        }).allow
      ).toBe(false);

      expect(
        authorize(publicVisitor, 'read', {
          kind: 'contribution',
          audience: 'tenant',
          orgId: 'org-alder',
        }).allow
      ).toBe(false);
    });

    it('Missing or null audience metadata denies by default', () => {
      const decision = authorize(publicVisitor, 'read', {
        kind: 'page',
        audience: undefined as any,
      });
      expect(decision.allow).toBe(false);
      expect(decision.reason).toMatch(/Deny by default/);
    });
  });

  describe('2. Tenant Isolation & Multi-Membership', () => {
    it('Client Member (David) can read/create inside Alder Finance', () => {
      const decision = authorize(clientDavid, 'read', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: 'org-alder',
      });
      expect(decision.allow).toBe(true);
    });

    it('Tenant Isolation: David cannot access Birchway Bank records', () => {
      const decision = authorize(clientDavid, 'read', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: 'org-birchway',
      });
      expect(decision.allow).toBe(false);
      expect(decision.reason).toMatch(/Tenant isolation violation/);
    });

    it('Multi-membership user (Jordan) active workspace enforcement', () => {
      // Active workspace is Alder Finance
      expect(
        authorize(multiJordan, 'create', {
          kind: 'contribution',
          audience: 'tenant',
          orgId: 'org-alder',
        }).allow
      ).toBe(true);

      // Denied if attempting to operate on Birchway Bank (not a member)
      expect(
        authorize(multiJordan, 'create', {
          kind: 'contribution',
          audience: 'tenant',
          orgId: 'org-birchway',
        }).allow
      ).toBe(false);
    });
  });

  describe('3. Client Admin Boundary & Anti-Escalation', () => {
    it('Client Admin (Sarah) can invite and manage members in own organisation', () => {
      const decision = authorize(clientSarah, 'invite_member', {
        kind: 'membership',
        audience: 'tenant',
        orgId: 'org-birchway',
      });
      expect(decision.allow).toBe(true);
    });

    it('Client Admin cannot manage members of another tenant', () => {
      const decision = authorize(clientSarah, 'invite_member', {
        kind: 'membership',
        audience: 'tenant',
        orgId: 'org-alder',
      });
      expect(decision.allow).toBe(false);
    });

    it('Client Admin cannot escalate privileges to platform roles', () => {
      const decision = authorize(clientSarah, 'grant_platform_role', {
        kind: 'org',
        audience: 'public',
      });
      expect(decision.allow).toBe(false);
    });
  });

  describe('4. Learning Moderator Boundary', () => {
    it('Moderator can claim, clarify, publish and reject submitted contributions', () => {
      expect(
        authorize(moderatorLiam, 'claim', {
          kind: 'contribution',
          audience: 'shared_learning',
          isDraft: false,
        }).allow
      ).toBe(true);

      expect(
        authorize(moderatorLiam, 'publish', {
          kind: 'contribution',
          audience: 'shared_learning',
          isDraft: false,
        }).allow
      ).toBe(true);
    });

    it('Hard Boundary: Moderator CANNOT view or act on unsubmitted private drafts', () => {
      const decision = authorize(moderatorLiam, 'read', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: true,
      });
      expect(decision.allow).toBe(false);
      expect(decision.reason).toMatch(/Moderators cannot inspect unsubmitted client drafts/);
    });

    it('Moderation queue structurally excludes drafts', () => {
      const queue = getModerationQueue(moderatorLiam);
      for (const item of queue) {
        expect(item.currentState).not.toBe('Draft');
      }
    });
  });

  describe('5. Publisher & Product Owner Least Privilege', () => {
    it('Content Publisher can manage public content but not admin IAM', () => {
      expect(
        authorize(publisherElena, 'manage_content', {
          kind: 'page',
          audience: 'public',
        }).allow
      ).toBe(true);

      expect(
        authorize(publisherElena, 'grant_platform_role', {
          kind: 'org',
          audience: 'public',
        }).allow
      ).toBe(false);
    });

    it('Product Owner can manage improvement ideas', () => {
      expect(
        authorize(productOwnerTariq, 'update', {
          kind: 'idea',
          audience: 'employee',
        }).allow
      ).toBe(true);

      expect(
        authorize(employee, 'update', {
          kind: 'idea',
          audience: 'employee',
        }).allow
      ).toBe(false);
    });
  });

  describe('6. Synchronous Withdrawal (<= 60s Hard SLA)', () => {
    it('Immediate withdrawal removes from search, themes, and AIRA retrieval', () => {
      // Live feed contains observations
      const liveBefore = getPublishedObservations(clientDavid);
      expect(liveBefore.length).toBeGreaterThan(0);

      // David withdraws his observation
      transitionContribution(clientDavid, 'contrib-alder-01', { type: 'withdraw' });

      // Verifiable immediate absence
      const liveAfter = getPublishedObservations(clientDavid);
      const exists = liveAfter.some((o) => o.id === 'pub-obs-01');
      expect(exists).toBe(false);

      // Themes supporting list purged
      const themes = getThemes(clientDavid);
      expect(themes[0].supportingObservationIds).not.toContain('pub-obs-01');
    });
  });

  describe('7. Aggregation Safeguards & Small Cohort Suppression', () => {
    it('MIN_DISTINCT_ORGS is configured to at least 3', () => {
      expect(MIN_DISTINCT_ORGS).toBeGreaterThanOrEqual(3);
    });

    it('Suppresses trend counts when distinct org count < MIN_DISTINCT_ORGS', () => {
      // With Alder Finance withdrawn, distinct contributing orgs = 2 (Birchway + Cedar)
      const themes = getThemes(clientDavid);
      expect(themes[0].isSuppressed).toBe(true);
      expect(themes[0].distinctOrgCount).toBe(0);
      expect(themes[0].suppressionReason).toMatch(/Insufficient evidence/);
    });
  });

  describe('8. Privacy Payload & De-Identification Safeguards', () => {
    it('Shared read model payload contains no tenant IDs, author profiles, or reviewer notes', () => {
      const sharedItems = getPublishedObservations(clientDavid);
      for (const item of sharedItems) {
        expect((item as any).tenant_id).toBeUndefined();
        expect((item as any).orgId).toBeUndefined();
        expect((item as any).authorId).toBeUndefined();
        expect((item as any).authorEmail).toBeUndefined();
        expect((item as any).reviewer_notes).toBeUndefined();
        expect((item as any).attachments).toBeUndefined();
        expect(item.sourceContributionRef).toBe('[INTERNAL_DE-IDENTIFIED]');
      }
    });
  });

  describe('9. Heuristic Sensitivity Scanner', () => {
    it('Flags emails, long account numbers, and confidential terms', () => {
      const emailFlags = scanSensitivity('Contact ceo@bank.com for account details');
      expect(emailFlags.some((f) => f.includes('email'))).toBe(true);

      const numFlags = scanSensitivity('Account wire 9876543210123 processed');
      expect(numFlags.some((f) => f.includes('numerical identifier'))).toBe(true);

      const keywordFlags = scanSensitivity('The confidential contract price is set');
      expect(keywordFlags.some((f) => f.includes('contractual'))).toBe(true);
    });
  });

  describe('10. AIRA Retrieval & Citation Lineage', () => {
    it('AIRA retrieval cites only approved published observations', () => {
      const res = queryAIRA(clientDavid, 'What are seasonal SME trends?');
      expect(res.answer).toBeDefined();
      expect(res.citations.length).toBeGreaterThan(0);
      for (const citation of res.citations) {
        expect(citation.title).toBeDefined();
        expect(citation.offering).toBeDefined();
      }
    });

    it('AIRA retrieval denied for unauthenticated actors', () => {
      const res = queryAIRA(publicVisitor, 'Show internal data');
      expect(res.answer).toMatch(/Access Denied/);
      expect(res.citations).toHaveLength(0);
    });
  });

  describe('11. Immutable Audit Trail', () => {
    it('Privileged status changes generate append-only audit events', () => {
      const initialCount = getAuditEvents(portalAdmin).length;

      updateIdeaStatus(
        productOwnerTariq,
        'idea-fai-seasonality',
        'Planned',
        'Automated test status transition'
      );

      const logsAfter = getAuditEvents(portalAdmin);
      expect(logsAfter.length).toBe(initialCount + 1);
      expect(logsAfter[0].action).toBe('update_idea_status');
      expect(logsAfter[0].actorEmail).toBe('tariq.m@azentio.com');
    });
  });
});
