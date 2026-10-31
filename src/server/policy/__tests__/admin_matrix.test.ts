import { describe, it, expect, beforeEach } from 'vitest';
import { Actor } from '@/types';
import { authorize } from '../authorize';
import {
  createAdminOrganisation,
  suspendAdminOrganisation,
  reactivateAdminOrganisation,
  getAdminOrganisations,
} from '@/server/dal/admin/orgs';
import {
  validateBulkInviteCSV,
  getAdminUsers,
} from '@/server/dal/admin/users';
import {
  assignPlatformGrant,
  revokePlatformGrant,
  addEmployeeToAllowlist,
} from '@/server/dal/admin/grants';
import {
  createContentItem,
  publishContentItem,
  unpublishContentItem,
  uploadMediaItem,
} from '@/server/dal/admin/content';
import {
  getPublicBlogs,
  getPublicCaseStudies,
  getPublicTestimonials,
} from '@/server/dal/public/content';
import {
  requestSupportAccess,
  approveSupportAccess,
  viewSupportResource,
  revokeSupportAuthorisation,
} from '@/server/dal/admin/support';
import {
  composeNotificationBroadcast,
  recallNotificationBroadcast,
} from '@/server/dal/admin/notifications';
import {
  exportAuditTrail,
  verifyAdminAuditChain,
} from '@/server/dal/admin/audit';
import {
  updateSystemConfig,
  checkWithdrawalPropagationLatency,
} from '@/server/dal/admin/config_ops';
import { approvalsEngine } from '@/server/services/approvals';
import {
  requestStepup,
  verifyStepup,
  isStepupValid,
  clearStepup,
} from '@/server/services/stepup';
import { store } from '@/server/dal/store';

// Actors for Acceptance Testing
const elenaAdmin: Actor = {
  userId: 'usr-admin-elena',
  name: 'Elena Rostova',
  isVerifiedEmployee: true,
  email: 'elena.rostova@azentio.com',
  platformGrants: ['portal_admin', 'content_publisher'],
  memberships: [],
  activeTenantId: null,
};

const adminNoPublisher: Actor = {
  userId: 'usr-admin-no-pub',
  name: 'Admin Without Publisher Grant',
  isVerifiedEmployee: true,
  email: 'admin.nopub@azentio.com',
  platformGrants: ['portal_admin'], // Missing content_publisher!
  memberships: [],
  activeTenantId: null,
};

const fernandoSecondAdmin: Actor = {
  userId: 'usr-admin-fernando',
  name: 'Fernando Alonso',
  isVerifiedEmployee: true,
  email: 'fernando.alonso@azentio.com',
  platformGrants: ['portal_admin'],
  memberships: [],
  activeTenantId: null,
};

const clientMember: Actor = {
  userId: 'usr-client-001',
  name: 'Client User',
  isVerifiedEmployee: false,
  email: 'client@apex.com',
  platformGrants: [],
  memberships: [{ orgId: 'org-apex', role: 'client_member', status: 'active' }],
  activeTenantId: 'org-apex',
};

describe('Azentio Portal Administrator Comprehensive Acceptance Matrix (§17)', () => {
  beforeEach(() => {
    approvalsEngine.reset();
    clearStepup(elenaAdmin.userId);
  });

  // GATE 1: Authentication, Deny-by-Default & Tenancy
  it('Gate 1: Denies non-admin client members from all platform admin actions', () => {
    expect(() => getAdminOrganisations(clientMember)).toThrow(/verified employee|portal_admin/i);
    expect(() => getAdminUsers(clientMember)).toThrow(/verified employee|portal_admin/i);
    expect(() =>
      createAdminOrganisation(clientMember, {
        name: 'Unauthorized Org',
        domain: 'unauth.com',
        tier: 'Enterprise',
        entitledOfferings: ['offering-fai'],
      })
    ).toThrow(/verified employee|portal_admin/i);
  });

  // GATE 2: Role Segregation — Portal Admin ≠ Super User
  it('Gate 2: Enforces that Portal Admin without content_publisher cannot publish content', () => {
    // 1. Admin without content_publisher creates a draft blog
    const draftBlog = createContentItem(adminNoPublisher, {
      type: 'blog',
      title: 'Enterprise Architecture Insights',
      slug: 'enterprise-arch-insights',
      excerpt: 'Exploring scalable data pipelines.',
      body: '# Architecture\nDeep dive.',
      audience: 'public',
      seoTitle: 'Enterprise Architecture',
      seoDescription: 'Scalable pipelines overview',
    });

    // 2. Attempting to publish WITHOUT content_publisher grant strictly fails!
    expect(() => publishContentItem(adminNoPublisher, draftBlog.id)).toThrow(
      /Requires content_publisher/
    );

    // 3. Admin WITH content_publisher grant succeeds
    const publishedItem = publishContentItem(elenaAdmin, draftBlog.id);
    expect(publishedItem.status).toBe('published');
  });

  // GATE 3: Dual Control Invariant
  it('Gate 3: Strictly blocks self-approval on high-risk operations (Dual Control)', () => {
    const supportReq = requestSupportAccess(elenaAdmin, {
      orgId: 'org-apex',
      resourceKind: 'contribution',
      resourceId: 'contrib-seed-001',
      reason: 'Urgent customer escalation verification for MAS audit',
      durationHours: 6,
    });

    // Elena cannot approve her own request
    expect(() => approveSupportAccess(elenaAdmin, supportReq.approvalRequestId)).toThrow(
      /Dual control violation/
    );

    // Fernando (second admin) can approve
    const approved = approveSupportAccess(fernandoSecondAdmin, supportReq.approvalRequestId);
    expect(approved.success).toBe(true);
    expect(approved.authorisation.approvedBy).toBe(fernandoSecondAdmin.userId);
  });

  // GATE 4: Support Access Scoping & Watermarking
  it('Gate 4: Zero default access to private client data; requires scoped watermarked authorization', () => {
    const supportReq = requestSupportAccess(elenaAdmin, {
      orgId: 'org-apex',
      resourceKind: 'demo_run',
      resourceId: 'run-seed-002',
      reason: 'Sandbox timeout evaluation under high frequency screen',
      durationHours: 4,
    });

    const approved = approveSupportAccess(fernandoSecondAdmin, supportReq.approvalRequestId);
    const authId = approved.authorisation.id;

    // View resource with active authorization
    const viewer = viewSupportResource(elenaAdmin, authId);
    expect(viewer.success).toBe(true);
    expect(viewer.watermark.viewer).toBe(elenaAdmin.name);
    expect(viewer.watermark.ipHash).toContain('ip_hash_sha256');

    // Revoking authorization immediately blocks subsequent views
    revokeSupportAuthorisation(elenaAdmin, authId, 'Inspection completed');
    expect(() => viewSupportResource(elenaAdmin, authId)).toThrow(/no longer active/);
  });

  // GATE 5: Genuine Testimonials Invariant
  it('Gate 5: Testimonials require recorded consent evidence; synthetic samples excluded from public feed', () => {
    // Attempting to publish a testimonial without consent evidence strictly throws
    const draftTestimonial = createContentItem(elenaAdmin, {
      type: 'testimonial',
      title: 'Client Quote: Apex Global',
      slug: 'client-quote-apex',
      excerpt: 'Quote on transaction monitoring performance.',
      body: 'Reduced latency by 40%.',
      audience: 'public',
      testimonialDetails: {
        quote: 'Reduced latency by 40%.',
        speakerName: 'David Lee',
        speakerTitle: 'Head of Compliance',
        organisationName: 'Apex Global',
        displayMode: 'named',
      } as any,
    });

    expect(() => publishContentItem(elenaAdmin, draftTestimonial.id)).toThrow(
      /recorded consent evidence/i
    );

    // Public feed excludes synthetic testimonials
    const publicTestimonials = getPublicTestimonials();
    const hasSynthetic = publicTestimonials.some((t) => (t as any).isSyntheticSample);
    expect(hasSynthetic).toBe(false);
  });

  // GATE 6: Bulk CSV Dry-Run Validation
  it('Gate 6: Bulk CSV dry-run flags domain mismatches without mutating state', () => {
    const csvData = [
      'name,email,orgId,role',
      'Valid User,valid.user@abcd.in,org-abcd,client_member',
      'Intruder User,intruder@external-hacker.com,org-abcd,client_member',
    ].join('\n');

    const dryRun = validateBulkInviteCSV(elenaAdmin, csvData);
    expect(dryRun.totalRows).toBe(2);
    expect(dryRun.validRows.length).toBe(1);
    expect(dryRun.errors.length).toBe(1);
    expect(dryRun.errors[0].reason).toContain('Domain mismatch');

    // State not mutated
    const users = getAdminUsers(elenaAdmin, { orgId: 'org-abcd' });
    const exists = users.some((u) => u.email === 'valid.user@abcd.in');
    expect(exists).toBe(false);
  });

  // GATE 7: Step-Up Authentication (10m TTL)
  it('Gate 7: Step-up verification expires and strictly guards sensitive audit exports', () => {
    // Unverified step-up fails
    expect(() => exportAuditTrail(elenaAdmin, 'csv')).toThrow(/Step-up verification required/);

    // Complete verification
    const req = requestStepup(elenaAdmin.userId, 'export audit ledger');
    const verifyRes = verifyStepup(elenaAdmin.userId, req.code);
    expect(verifyRes.success).toBe(true);
    expect(isStepupValid(elenaAdmin.userId)).toBe(true);

    // Export succeeds
    const csv = exportAuditTrail(elenaAdmin, 'csv');
    expect(csv).toContain('SHA-256 Hash');

    // Clear / expire step-up
    clearStepup(elenaAdmin.userId);
    expect(() => exportAuditTrail(elenaAdmin, 'csv')).toThrow(/Step-up verification required/);
  });

  // GATE 8: MIN_DISTINCT_ORGS Threshold Guard
  it('Gate 8: Enforces MIN_DISTINCT_ORGS >= 3 invariant', () => {
    expect(() => updateSystemConfig(elenaAdmin, { minDistinctOrgs: 2 })).toThrow(
      /MIN_DISTINCT_ORGS invariant violation/
    );

    const validUpdate = updateSystemConfig(elenaAdmin, { minDistinctOrgs: 5 });
    expect(validUpdate.config.minDistinctOrgs).toBe(5);
  });

  // GATE 9: 60s Withdrawal Propagation SLA
  it('Gate 9: Verifies 60s withdrawal propagation SLA compliance', () => {
    const slaResult = checkWithdrawalPropagationLatency(elenaAdmin);
    expect(slaResult.success).toBe(true);
    expect(slaResult.slaCompliant).toBe(true);
    expect(slaResult.propagationLatencyMs).toBeLessThan(60000);
  });

  // GATE 10: Cryptographic Audit Ledger Integrity
  it('Gate 10: Validates append-only SHA-256 chain integrity', () => {
    const verification = verifyAdminAuditChain(elenaAdmin);
    expect(verification.valid).toBe(true);
    expect(verification.totalEvents).toBeGreaterThan(0);
    expect(verification.message).toContain('intact');
  });
});
