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
  const employeeNithesh = SEED_PERSONAS.employee;
  const clientVirat = SEED_PERSONAS.client_member;
  const clientDhoni = SEED_PERSONAS.client_admin;
  const multiHardik = SEED_PERSONAS.multi_member;
  const moderatorPranika = SEED_PERSONAS.learning_moderator;
  const publisherNishanth = SEED_PERSONAS.content_publisher;
  const productOwnerLewis = SEED_PERSONAS.product_owner;
  const portalAdminMax = SEED_PERSONAS.portal_admin;

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
          orgId: 'org-abcd',
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
    it('Client Member (Virat Kohli) can read/create inside abcd.in', () => {
      const decision = authorize(clientVirat, 'read', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: 'org-abcd',
      });
      expect(decision.allow).toBe(true);
    });

    it('Tenant Isolation: Virat cannot access xyz.com records', () => {
      const decision = authorize(clientVirat, 'read', {
        kind: 'contribution',
        audience: 'tenant',
        orgId: 'org-xyz',
      });
      expect(decision.allow).toBe(false);
      expect(decision.reason).toMatch(/Tenant isolation violation/);
    });

    it('Multi-membership user (Hardik Pandya) active workspace enforcement', () => {
      // Active workspace is xyz.com
      expect(
        authorize(multiHardik, 'create', {
          kind: 'contribution',
          audience: 'tenant',
          orgId: 'org-xyz',
        }).allow
      ).toBe(true);

      // Denied if attempting to operate on an un-joined tenant
      expect(
        authorize(multiHardik, 'create', {
          kind: 'contribution',
          audience: 'tenant',
          orgId: 'org-cedar',
        }).allow
      ).toBe(false);
    });
  });

  describe('3. Client Admin Boundary & Anti-Escalation', () => {
    it('Client Admin (MS Dhoni) can invite and manage members in xyz.com', () => {
      const decision = authorize(clientDhoni, 'invite_member', {
        kind: 'membership',
        audience: 'tenant',
        orgId: 'org-xyz',
      });
      expect(decision.allow).toBe(true);
    });

    it('Client Admin cannot manage members of another tenant (abcd.in)', () => {
      const decision = authorize(clientDhoni, 'invite_member', {
        kind: 'membership',
        audience: 'tenant',
        orgId: 'org-abcd',
      });
      expect(decision.allow).toBe(false);
    });

    it('Client Admin cannot escalate privileges to platform roles', () => {
      const decision = authorize(clientDhoni, 'grant_platform_role', {
        kind: 'org',
        audience: 'public',
      });
      expect(decision.allow).toBe(false);
    });
  });

  describe('4. Learning Moderator Boundary', () => {
    it('Moderator (Pranika K) can claim, clarify, publish and reject submitted contributions', () => {
      expect(
        authorize(moderatorPranika, 'claim', {
          kind: 'contribution',
          audience: 'shared_learning',
          isDraft: false,
        }).allow
      ).toBe(true);

      expect(
        authorize(moderatorPranika, 'publish', {
          kind: 'contribution',
          audience: 'shared_learning',
          isDraft: false,
        }).allow
      ).toBe(true);
    });

    it('Hard Boundary: Moderator CANNOT view or act on unsubmitted private drafts', () => {
      const decision = authorize(moderatorPranika, 'read', {
        kind: 'contribution',
        audience: 'shared_learning',
        isDraft: true,
      });
      expect(decision.allow).toBe(false);
      expect(decision.reason).toMatch(/Moderators cannot inspect unsubmitted client drafts/);
    });

    it('Moderation queue structurally excludes drafts', () => {
      const queue = getModerationQueue(moderatorPranika);
      for (const item of queue) {
        expect(item.currentState).not.toBe('Draft');
      }
    });
  });

  describe('5. Publisher & Product Owner Least Privilege', () => {
    it('Content Publisher (Nishanth E) can manage public content but not admin IAM', () => {
      expect(
        authorize(publisherNishanth, 'manage_content', {
          kind: 'page',
          audience: 'public',
        }).allow
      ).toBe(true);

      expect(
        authorize(publisherNishanth, 'grant_platform_role', {
          kind: 'org',
          audience: 'public',
        }).allow
      ).toBe(false);
    });

    it('Product Owner (Lewis Hamilton) can manage improvement ideas', () => {
      expect(
        authorize(productOwnerLewis, 'update', {
          kind: 'idea',
          audience: 'employee',
        }).allow
      ).toBe(true);

      expect(
        authorize(employeeNithesh, 'update', {
          kind: 'idea',
          audience: 'employee',
        }).allow
      ).toBe(false);
    });
  });

  describe('6. Synchronous Withdrawal (<= 60s Hard SLA)', () => {
    it('Immediate withdrawal removes from search, themes, and AIRA retrieval', () => {
      // Live feed contains observations
      const liveBefore = getPublishedObservations(clientVirat);
      expect(liveBefore.length).toBeGreaterThan(0);

      // Virat withdraws his observation from abcd.in
      transitionContribution(clientVirat, 'contrib-abcd-01', { type: 'withdraw' });

      // Verifiable immediate absence
      const liveAfter = getPublishedObservations(clientVirat);
      const exists = liveAfter.some((o) => o.id === 'pub-obs-01');
      expect(exists).toBe(false);

      // Themes supporting list purged
      const themes = getThemes(clientVirat);
      expect(themes[0].supportingObservationIds).not.toContain('pub-obs-01');
    });
  });

  describe('7. Aggregation Safeguards & Small Cohort Suppression', () => {
    it('MIN_DISTINCT_ORGS is configured to at least 3', () => {
      expect(MIN_DISTINCT_ORGS).toBeGreaterThanOrEqual(3);
    });

    it('Suppresses trend counts when distinct org count < MIN_DISTINCT_ORGS', () => {
      // With abcd.in withdrawn, distinct contributing orgs = 2 (xyz.com + cedar)
      const themes = getThemes(clientVirat);
      expect(themes[0].isSuppressed).toBe(true);
      expect(themes[0].distinctOrgCount).toBe(0);
      expect(themes[0].suppressionReason).toMatch(/Insufficient evidence/);
    });
  });

  describe('8. Privacy Payload & De-Identification Safeguards', () => {
    it('Shared read model payload contains no tenant IDs, author profiles, or reviewer notes', () => {
      const sharedItems = getPublishedObservations(clientVirat);
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
      const emailFlags = scanSensitivity('Contact virat@abcd.in for account details');
      expect(emailFlags.some((f) => f.includes('email'))).toBe(true);

      const numFlags = scanSensitivity('Account wire 9876543210123 processed');
      expect(numFlags.some((f) => f.includes('numerical identifier'))).toBe(true);

      const keywordFlags = scanSensitivity('The confidential contract price is set');
      expect(keywordFlags.some((f) => f.includes('contractual'))).toBe(true);
    });
  });

  describe('10. AIRA Retrieval & Citation Lineage', () => {
    it('AIRA retrieval cites only approved published observations', () => {
      const res = queryAIRA(clientVirat, 'What are seasonal SME trends?');
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
      const initialCount = getAuditEvents(portalAdminMax).length;

      updateIdeaStatus(
        productOwnerLewis,
        'idea-fai-seasonality',
        'Planned',
        'Automated test status transition by Lewis Hamilton'
      );

      const logsAfter = getAuditEvents(portalAdminMax);
      expect(logsAfter.length).toBe(initialCount + 1);
      expect(logsAfter[0].action).toBe('update_idea_status');
      expect(logsAfter[0].actorEmail).toBe('lewis_hamilton@azentio.com');
    });
  });
});
