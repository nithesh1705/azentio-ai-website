import { ContentItem } from '@/types';
import { contentStore } from '@/server/dal/admin/content';

/**
 * Public Data Access Layer for Azentio Content.
 * Strictly reads items with status === 'published' AND audience === 'public'.
 * Immediate cache consistency: unpublishing in admin immediately excludes the item from all public responses.
 */

export function getPublicBlogs(): ContentItem[] {
  return contentStore.items
    .filter((item) => item.type === 'blog' && item.status === 'published' && item.audience === 'public')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export function getPublicBlogBySlug(slug: string): ContentItem | undefined {
  return contentStore.items.find(
    (item) => item.type === 'blog' && item.slug === slug && item.status === 'published' && item.audience === 'public'
  );
}

export function getPublicCaseStudies(): ContentItem[] {
  return contentStore.items
    .filter((item) => item.type === 'case_study' && item.status === 'published' && item.audience === 'public')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export function getPublicCaseStudyBySlug(slug: string): ContentItem | undefined {
  return contentStore.items.find(
    (item) => item.type === 'case_study' && item.slug === slug && item.status === 'published' && item.audience === 'public'
  );
}

export function getPublicTestimonials(): ContentItem[] {
  return contentStore.items
    .filter((item) => {
      if (item.type !== 'testimonial' || item.status !== 'published' || item.audience !== 'public') {
        return false;
      }
      // Strictly exclude synthetic/sample testimonials on public site
      if (item.testimonialDetails?.isSyntheticSample) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export function getPublicBanners(placement?: string): ContentItem[] {
  const now = new Date().toISOString();
  return contentStore.items
    .filter((item) => {
      if (item.type !== 'banner' || item.status !== 'published' || item.audience !== 'public') {
        return false;
      }
      if (placement && item.bannerDetails?.placement !== placement) {
        return false;
      }
      // Check scheduled expiration
      if (item.scheduledUnpublishAt && item.scheduledUnpublishAt < now) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (b.bannerDetails?.priority || 0) - (a.bannerDetails?.priority || 0));
}

export function getPublicFAQs(category?: string): ContentItem[] {
  return contentStore.items
    .filter((item) => {
      if (item.type !== 'faq' || item.status !== 'published' || item.audience !== 'public') {
        return false;
      }
      if (category && item.category !== category) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.faqDetails?.order || 99) - (b.faqDetails?.order || 99));
}
