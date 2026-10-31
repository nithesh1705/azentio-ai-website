import { describe, it, expect, beforeEach } from 'vitest';
import {
  getContentItems,
  createContentItem,
  publishContentItem,
  unpublishContentItem,
  getMediaItems,
  uploadMediaItem,
  deleteMediaItem,
  reorderFaqs,
  contentStore,
  mediaStore,
} from '../content';
import {
  getPublicBlogs,
  getPublicCaseStudies,
  getPublicTestimonials,
  getPublicBanners,
  getPublicFAQs,
} from '../../public/content';
import { Actor } from '@/types';

describe('Admin Testimonials, Banners, FAQs, Media & Public DAL', () => {
  const publisherMax: Actor = {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };

  beforeEach(() => {
    contentStore.reset();
    mediaStore.reset();
  });

  describe('1. Testimonials & Genuine Consent Invariant', () => {
    it('Requires verified consent evidence to publish a testimonial', () => {
      const invalid = createContentItem(publisherMax, {
        type: 'testimonial',
        title: 'Unverified Testimonial',
        body: 'Fabulous platform',
        testimonialDetails: {
          quote: 'Fabulous platform',
          speakerName: 'John Doe',
          speakerTitle: 'Manager',
          organisationName: 'Generic Org',
          displayMode: 'named',
          consent: {
            id: 'c-invalid',
            sourceType: 'written_approval',
            evidenceRef: '', // Missing
            consentDate: '2026-10-01',
            approvedByPerson: 'John Doe',
            verifiedGenuine: false, // Not verified
          },
        },
      });

      expect(() => publishContentItem(publisherMax, invalid.id)).toThrow(
        /Compliance Invariant Violation/
      );
    });

    it('Excludes synthetic/sample testimonials from public website feed', () => {
      const publicReviews = getPublicTestimonials();
      expect(publicReviews.every((r) => !r.testimonialDetails?.isSyntheticSample)).toBe(true);
    });
  });

  describe('2. Banners & Placement Filtering', () => {
    it('Filters banners by placement and orders by priority', () => {
      const homeBanners = getPublicBanners('home_top_bar');
      expect(homeBanners.length).toBeGreaterThan(0);
      expect(homeBanners[0].bannerDetails?.placement).toBe('home_top_bar');
    });
  });

  describe('3. FAQs & Accessible Reordering', () => {
    it('Reorders FAQs and reflects in public query', () => {
      const faqsBefore = getPublicFAQs();
      expect(faqsBefore.length).toBeGreaterThan(1);
      const firstId = faqsBefore[0].id;
      const secondId = faqsBefore[1].id;

      // Invert order
      reorderFaqs(publisherMax, [secondId, firstId]);

      const faqsAfter = getPublicFAQs();
      expect(faqsAfter[0].id).toBe(secondId);
      expect(faqsAfter[1].id).toBe(firstId);
    });
  });

  describe('4. Media Library', () => {
    it('Uploads and deletes media items, enforcing size limits', () => {
      const uploaded = uploadMediaItem(publisherMax, {
        filename: 'test-chart.png',
        mimeType: 'image/png',
        sizeBytes: 50000,
        altText: 'Chart',
        audience: 'public',
      });
      expect(uploaded.id).toBeDefined();

      const items = getMediaItems(publisherMax);
      expect(items.some((m) => m.id === uploaded.id)).toBe(true);

      const deleted = deleteMediaItem(publisherMax, uploaded.id);
      expect(deleted.success).toBe(true);

      // Oversize > 25MB fails
      expect(() =>
        uploadMediaItem(publisherMax, {
          filename: 'huge-file.iso',
          mimeType: 'application/octet-stream',
          sizeBytes: 30 * 1024 * 1024,
          altText: 'Huge',
          audience: 'private',
        })
      ).toThrow(/exceeds maximum limit of 25MB/);
    });
  });

  describe('5. Zero Cache Staleness on Unpublish', () => {
    it('Immediately purges an unpublished item from public query', () => {
      const blogsBefore = getPublicBlogs();
      const firstBlog = blogsBefore[0];
      expect(firstBlog).toBeDefined();

      // Unpublish
      unpublishContentItem(publisherMax, firstBlog.id);

      const blogsAfter = getPublicBlogs();
      expect(blogsAfter.some((b) => b.id === firstBlog.id)).toBe(false);
    });
  });
});

