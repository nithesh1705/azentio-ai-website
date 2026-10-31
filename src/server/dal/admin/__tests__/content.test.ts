import { describe, it, expect, beforeEach } from 'vitest';
import {
  getContentItems,
  getContentItemById,
  createContentItem,
  updateContentItem,
  publishContentItem,
  unpublishContentItem,
  archiveContentItem,
  contentStore,
} from '../content';
import { Actor } from '@/types';

describe('Admin Content Hub, Blogs & Case Studies DAL', () => {
  const publisherMax: Actor = {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  const adminWithoutPublisher: Actor = {
    userId: 'usr-admin-fernando',
    name: 'Fernando Alonso',
    email: 'fernando_alonso@azentio.com',
    platformGrants: ['portal_admin'], // Notice: has portal_admin but NOT content_publisher!
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
    contentStore.reset();
  });

  it('Denies access to non-publishers and non-admins', () => {
    expect(() => getContentItems(clientActor)).toThrow(/Access denied/);
  });

  it('Lists content items and filters by type and status', () => {
    const all = getContentItems(publisherMax);
    expect(all.length).toBeGreaterThan(0);

    const blogs = getContentItems(publisherMax, { type: 'blog' });
    expect(blogs.every((b) => b.type === 'blog')).toBe(true);

    const cases = getContentItems(publisherMax, { type: 'case_study' });
    expect(cases.every((c) => c.type === 'case_study')).toBe(true);
  });

  it('Creates and updates a blog post', () => {
    const created = createContentItem(publisherMax, {
      type: 'blog',
      title: 'Agentic Liquidity Modelling',
      excerpt: 'Autonomous cash flow stress testing.',
      body: '## Architectural Overview\n\nTesting liquidity covariance.',
      category: 'Banking',
    });

    expect(created.id).toBeDefined();
    expect(created.slug).toBe('agentic-liquidity-modelling');
    expect(created.status).toBe('draft');

    const updated = updateContentItem(publisherMax, created.id, {
      excerpt: 'Updated teaser summary.',
    });
    expect(updated.excerpt).toBe('Updated teaser summary.');
    expect(updated.version).toBe(2);
  });

  it('ROLE SEGREGATION INVARIANT: Portal admin without content_publisher CANNOT publish content', () => {
    // Fernando Alonso has portal_admin, but lacks content_publisher
    expect(() =>
      publishContentItem(adminWithoutPublisher, 'content-blog-01')
    ).toThrow(/Requires content_publisher grant/);
  });

  it('COMPLIANCE INVARIANT: Case study cannot be published without verified consent evidence', () => {
    const unconsented = createContentItem(publisherMax, {
      type: 'case_study',
      title: 'Unconsented Story',
      body: 'Story details...',
      testimonialDetails: {
        quote: 'Great product',
        speakerName: 'Anonymous Executive',
        speakerTitle: 'VP',
        organisationName: 'Confidential Bank',
        displayMode: 'named',
        consent: {
          id: 'test-con',
          sourceType: 'written_approval',
          evidenceRef: '', // Missing reference
          consentDate: '',
          approvedByPerson: '',
          verifiedGenuine: false, // Not verified
        },
      },
    });

    // Attempting to publish MUST THROW
    expect(() =>
      publishContentItem(publisherMax, unconsented.id)
    ).toThrow(/Compliance Invariant Violation/);
  });

  it('Allows publishing and immediate unpublishing by authorized publisher', () => {
    const blog = createContentItem(publisherMax, {
      type: 'blog',
      title: 'Sample Article for Publishing',
      body: 'Content...',
    });

    const published = publishContentItem(publisherMax, blog.id);
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeDefined();

    const unpublished = unpublishContentItem(publisherMax, blog.id);
    expect(unpublished.status).toBe('unpublished');
  });
});

