import {
  Actor,
  ContentItem,
  ContentType,
  ContentStatus,
  ContentAudience,
} from '@/types';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';

const initialContentItems: ContentItem[] = [
  {
    id: 'content-blog-01',
    type: 'blog',
    title: 'The Next Horizon: Autonomous Agentic Workflows in Commercial Lending',
    slug: 'autonomous-agentic-workflows-commercial-lending',
    status: 'published',
    audience: 'public',
    excerpt: 'How multi-agent architectures extract hidden credit risks and covenant violations from unstructured audited financial statements.',
    body: `## The Evolution of Credit Risk Analysis\n\nTraditional commercial underwriting relies heavily on retrospective ratio calculations and manual spreadsheet inputs. By introducing autonomous agentic pipelines that cross-verify balance sheet entries against seasonal vendor payables, lenders can achieve real-time risk sensitivity simulations.\n\n### Key Architectural Pillars\n1. **Deterministic Covenant Validation:** Zero tolerance for generative hallucination in statutory compliance.\n2. **De-Identified Collective Learning:** Aggregated benchmark variance across three or more peer institutions.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    coverImageAlt: 'Autonomous financial intelligence pipeline dashboard',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-fai', 'offering-dls'],
    tags: ['Lending', 'AI Agents', 'Risk Modelling'],
    category: 'Intelligence',
    seoTitle: 'Autonomous Agentic Workflows in Commercial Lending | Azentio',
    seoDescription: 'Discover how multi-agent architectures identify covenant breaches and seasonal anomalies in commercial loan portfolios.',
    publishedAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z',
    createdAt: '2026-10-10T14:20:00Z',
    version: 1,
  },
  {
    id: 'content-blog-02',
    type: 'blog',
    title: 'Model Drift & Statistical Invariance in Islamic Banking Contracts',
    slug: 'model-drift-islamic-banking-contracts',
    status: 'published',
    audience: 'public',
    excerpt: 'Ensuring Shariah-compliant profit-sharing ratios withstand macroeconomic shocks without breaking covenant covenants.',
    body: `## Preserving Shariah Compliance Under Macro Shocks\n\nIslamic finance requires strict adherence to risk-sharing principles (Mudarabah & Murabaha). This article discusses how automated continuous audit checks detect covariance shifts in profit-rate benchmarks before covenant breach events occur.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-cbe'],
    tags: ['Islamic Banking', 'Compliance', 'Auditing'],
    category: 'Banking',
    publishedAt: '2026-10-22T11:00:00Z',
    updatedAt: '2026-10-22T11:00:00Z',
    createdAt: '2026-10-18T10:00:00Z',
    version: 1,
  },
  {
    id: 'content-case-01',
    type: 'case_study',
    title: 'Tier-1 Southeast Asian Retail Bank Modernizes Core Deposit Microservices',
    slug: 'tier-1-southeast-asian-bank-core-modernization',
    status: 'published',
    audience: 'public',
    excerpt: 'Zero-downtime migration of 14 million active deposit accounts onto Azentio Core Modernization Engine.',
    body: `### Executive Summary\nA leading retail banking institution across ASEAN countries modernized its legacy ledger systems with zero downtime.\n\n### Measured Outcomes\n- 99.999% transaction uptime across peak festive clearing windows.\n- 65% reduction in overnight batch reconciliation latency.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-cbe'],
    tags: ['Core Banking', 'ASEAN', 'High Throughput'],
    category: 'Banking',
    testimonialDetails: {
      quote: 'The automated shadow run capabilities gave our audit and risk committees complete certainty before cutover.',
      speakerName: 'Chief Technology Officer',
      speakerTitle: 'Group Head of Core Technology',
      organisationName: 'Tier-1 Southeast Asian Financial Institution',
      displayMode: 'anonymised',
      consent: {
        id: 'con-01',
        sourceType: 'signed_form',
        evidenceRef: 'azentio-legal-cs-asean-2026',
        consentDate: '2026-09-15',
        approvedByPerson: 'Legal Director (APAC)',
        verifiedGenuine: true,
      },
    },
    publishedAt: '2026-10-18T12:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z',
    createdAt: '2026-10-12T16:00:00Z',
    version: 1,
  },
  {
    id: 'content-case-02',
    type: 'case_study',
    title: 'ABCD Technologies Accelerates SME Underwriting Pipeline by 380%',
    slug: 'abcd-technologies-sme-underwriting-transformation',
    status: 'published',
    audience: 'public',
    excerpt: 'Consented customer case study demonstrating 3.8x throughput acceleration in seasonal balance sheet ingestion.',
    body: `### Customer Overview\nABCD Technologies implemented Azentio Financial Analysis Intelligence to automate cash-flow covenant evaluations for SME working capital borrowers.\n\n### Key Metrics\n- Covenant check turnaround reduced from 4 days to 45 minutes.\n- False-positive fraud flags dropped by 82%.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-fai'],
    tags: ['SME Lending', 'Underwriting', 'Productivity'],
    category: 'Intelligence',
    testimonialDetails: {
      quote: 'Azentio transformed our risk review operations without exposing proprietary borrower financials.',
      speakerName: 'Virat Kohli',
      speakerTitle: 'Head of Enterprise Credit Risk',
      organisationName: 'ABCD Technologies',
      displayMode: 'named',
      consent: {
        id: 'con-02',
        sourceType: 'written_approval',
        evidenceRef: 'abcd-saas-consent-signed-2026',
        consentDate: '2026-10-01',
        approvedByPerson: 'Virat Kohli (Authorized Client Admin)',
        verifiedGenuine: true,
      },
    },
    publishedAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-10-25T14:00:00Z',
    createdAt: '2026-10-20T10:00:00Z',
    version: 1,
  },
  {
    id: 'content-test-01',
    type: 'testimonial',
    title: 'ABCD Technologies Credit Risk Testimonial',
    slug: 'abcd-technologies-credit-risk-testimonial',
    status: 'published',
    audience: 'public',
    body: 'Azentio Financial Analysis Intelligence transformed our SME credit review turnaround from 4 days to 45 minutes with zero false-positives.',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-fai'],
    tags: ['Customer Quote', 'Lending'],
    testimonialDetails: {
      quote: 'Azentio Financial Analysis Intelligence transformed our SME credit review turnaround from 4 days to 45 minutes with zero false-positives.',
      speakerName: 'Virat Kohli',
      speakerTitle: 'Head of Enterprise Credit Risk',
      organisationName: 'ABCD Technologies',
      displayMode: 'named',
      rating: 5,
      consent: {
        id: 'con-t1',
        sourceType: 'signed_form',
        evidenceRef: 'legal-test-c2026-001',
        consentDate: '2026-10-01',
        approvedByPerson: 'Virat Kohli',
        verifiedGenuine: true,
      },
    },
    publishedAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
    createdAt: '2026-10-26T10:00:00Z',
    version: 1,
  },
  {
    id: 'content-test-02',
    type: 'testimonial',
    title: 'Sample / Synthetic Testimonial (Demo)',
    slug: 'synthetic-demo-testimonial',
    status: 'draft',
    audience: 'public',
    body: 'Sample test review for demonstration and layout testing purposes only.',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-fai'],
    tags: ['Synthetic', 'Sample'],
    testimonialDetails: {
      quote: 'Sample test review for demonstration and layout testing purposes only.',
      speakerName: 'Synthetic Reviewer',
      speakerTitle: 'QA Lead',
      organisationName: 'Cedar Capital',
      displayMode: 'named',
      rating: 4,
      isSyntheticSample: true,
      consent: {
        id: 'con-t2',
        sourceType: 'signed_form',
        evidenceRef: 'sample-doc-synthetic',
        consentDate: '2026-10-20',
        approvedByPerson: 'QA Lead',
        verifiedGenuine: false,
      },
    },
    updatedAt: '2026-10-20T10:00:00Z',
    createdAt: '2026-10-20T10:00:00Z',
    version: 1,
  },
  {
    id: 'content-banner-01',
    type: 'banner',
    title: 'Scheduled Platform Maintenance Notice',
    slug: 'scheduled-platform-maintenance-notice',
    status: 'published',
    audience: 'public',
    body: 'Scheduled quarterly maintenance window: Nov 2, 2026, 02:00-02:15 UTC.',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: [],
    tags: ['Maintenance', 'Advisory'],
    bannerDetails: {
      message: 'Scheduled quarterly maintenance window: Nov 2, 2026, 02:00-02:15 UTC. Zero disruption to client sandboxes expected.',
      linkUrl: '/about',
      style: 'info',
      placement: 'home_top_bar',
      dismissible: true,
      priority: 1,
    },
    publishedAt: '2026-10-28T08:00:00Z',
    updatedAt: '2026-10-28T08:00:00Z',
    createdAt: '2026-10-28T08:00:00Z',
    version: 1,
  },
  {
    id: 'content-faq-01',
    type: 'faq',
    title: 'How does Azentio enforce tenant data isolation across client workspaces?',
    slug: 'how-azentio-enforces-tenant-data-isolation',
    status: 'published',
    audience: 'public',
    body: 'All tenant queries are bounded by cryptographically verified server-side session contexts. Cross-tenant identifiers fail by default, and shared market benchmarks require de-identified aggregation.',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: [],
    tags: ['Security', 'Isolation'],
    category: 'Security & Privacy',
    faqDetails: {
      order: 1,
      category: 'Security & Privacy',
    },
    publishedAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z',
    createdAt: '2026-10-15T09:00:00Z',
    version: 1,
  },
  {
    id: 'content-faq-02',
    type: 'faq',
    title: 'What is the MIN_DISTINCT_ORGS threshold and why is it enforced?',
    slug: 'what-is-min-distinct-orgs-threshold',
    status: 'published',
    audience: 'public',
    body: 'Under Section 9 of the system specification, market intelligence statistics and covariance signals are displayed only when at least 3 distinct client organisations have contributed validated observations. This prevents reverse-engineering of single-organisation trading or lending positions.',
    authorId: 'usr-pub-nishanth',
    authorName: 'Nishanth E',
    offeringIds: ['offering-fai'],
    tags: ['Compliance', 'Federation'],
    category: 'Collective Learning',
    faqDetails: {
      order: 2,
      category: 'Collective Learning',
    },
    publishedAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
    createdAt: '2026-10-16T10:00:00Z',
    version: 1,
  },
];

class ContentStore {
  items: ContentItem[] = JSON.parse(JSON.stringify(initialContentItems));

  reset() {
    this.items = JSON.parse(JSON.stringify(initialContentItems));
  }
}

export const contentStore = new ContentStore();

export function getContentItems(
  actor: Actor,
  filter?: {
    type?: ContentType;
    status?: ContentStatus;
    audience?: ContentAudience;
    search?: string;
  }
): ContentItem[] {
  // Access check: content_publisher or portal_admin
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Access denied: Content management requires content_publisher or portal_admin platform grant.');
  }

  let list = contentStore.items;

  if (filter?.type && filter.type !== ('all' as any)) {
    list = list.filter((item) => item.type === filter.type);
  }

  if (filter?.status && filter.status !== ('all' as any)) {
    list = list.filter((item) => item.status === filter.status);
  }

  if (filter?.audience && filter.audience !== ('all' as any)) {
    list = list.filter((item) => item.audience === filter.audience);
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(s) ||
        item.slug.toLowerCase().includes(s) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(s))
    );
  }

  return list;
}

export function getContentItemById(actor: Actor, id: string): ContentItem | undefined {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Access denied: Content inspection requires content_publisher or portal_admin platform grant.');
  }

  return contentStore.items.find((item) => item.id === id);
}

export function createContentItem(
  actor: Actor,
  data: Partial<ContentItem>
): ContentItem {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to create content items.');
  }

  if (!data.title || !data.type) {
    throw new Error('Title and content type are required.');
  }

  const slug = (data.slug || data.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const now = new Date().toISOString();

  const item: ContentItem = {
    id: `content-${data.type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: data.type,
    title: data.title,
    slug,
    status: (data.status as ContentStatus) || 'draft',
    audience: data.audience || 'public',
    excerpt: data.excerpt || '',
    body: data.body || '',
    coverImageUrl: data.coverImageUrl,
    coverImageAlt: data.coverImageAlt,
    authorId: actor.userId,
    authorName: actor.name,
    offeringIds: data.offeringIds || [],
    tags: data.tags || [],
    category: data.category || 'General',
    seoTitle: data.seoTitle || `${data.title} | Azentio`,
    seoDescription: data.seoDescription || data.excerpt || '',
    ogImageUrl: data.ogImageUrl || data.coverImageUrl,
    createdAt: now,
    updatedAt: now,
    version: 1,
    testimonialDetails: data.testimonialDetails,
    bannerDetails: data.bannerDetails,
    faqDetails: data.faqDetails,
  };

  contentStore.items.unshift(item);

  appendAuditEvent(
    actor,
    'admin.content.create',
    item.type,
    item.id,
    `Created draft ${item.type}: "${item.title}" (${item.slug})`
  );

  return item;
}

export function updateContentItem(
  actor: Actor,
  id: string,
  data: Partial<ContentItem>
): ContentItem {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to edit content.');
  }

  const item = contentStore.items.find((i) => i.id === id);
  if (!item) throw new Error(`Content item not found: ${id}`);

  if (data.title) item.title = data.title;
  if (data.slug) item.slug = data.slug;
  if (data.excerpt !== undefined) item.excerpt = data.excerpt;
  if (data.body !== undefined) item.body = data.body;
  if (data.coverImageUrl !== undefined) item.coverImageUrl = data.coverImageUrl;
  if (data.coverImageAlt !== undefined) item.coverImageAlt = data.coverImageAlt;
  if (data.offeringIds) item.offeringIds = data.offeringIds;
  if (data.tags) item.tags = data.tags;
  if (data.category) item.category = data.category;
  if (data.seoTitle !== undefined) item.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) item.seoDescription = data.seoDescription;
  if (data.ogImageUrl !== undefined) item.ogImageUrl = data.ogImageUrl;
  if (data.testimonialDetails) item.testimonialDetails = data.testimonialDetails;
  if (data.bannerDetails) item.bannerDetails = data.bannerDetails;
  if (data.faqDetails) item.faqDetails = data.faqDetails;

  item.updatedAt = new Date().toISOString();
  item.version += 1;

  appendAuditEvent(
    actor,
    'admin.content.update',
    item.type,
    item.id,
    `Updated version ${item.version} of ${item.type} "${item.title}"`
  );

  return item;
}

export function publishContentItem(
  actor: Actor,
  id: string
): ContentItem {
  // Strictly requires content_publisher grant (portal admin without content_publisher CANNOT publish!)
  const auth = authorize(actor, 'content.publish', { kind: 'page', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }

  const item = contentStore.items.find((i) => i.id === id);
  if (!item) throw new Error(`Content item not found: ${id}`);

  // Invariant 1: Genuine Testimonials / Consented Case Studies
  if (item.type === 'testimonial' || (item.type === 'case_study' && item.testimonialDetails)) {
    const consent = item.testimonialDetails?.consent;
    if (!consent) {
      throw new Error('Compliance Invariant Violation: Cannot publish testimonial/case study without recorded consent evidence.');
    }
    if (!consent.evidenceRef || !consent.consentDate || !consent.verifiedGenuine) {
      throw new Error(
        'Compliance Invariant Violation: Consent evidence must include document reference, consent date, and verified genuine confirmation checkbox.'
      );
    }
  }

  item.status = 'published';
  item.publishedAt = new Date().toISOString();
  item.updatedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.content.publish',
    item.type,
    item.id,
    `Published ${item.type}: "${item.title}" to public audience.`
  );

  return item;
}

export function unpublishContentItem(
  actor: Actor,
  id: string
): ContentItem {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to unpublish content.');
  }

  const item = contentStore.items.find((i) => i.id === id);
  if (!item) throw new Error(`Content item not found: ${id}`);

  item.status = 'unpublished';
  item.updatedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.content.unpublish',
    item.type,
    item.id,
    `Unpublished ${item.type}: "${item.title}" immediately from public index.`
  );

  return item;
}

export function archiveContentItem(
  actor: Actor,
  id: string
): ContentItem {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to archive content.');
  }

  const item = contentStore.items.find((i) => i.id === id);
  if (!item) throw new Error(`Content item not found: ${id}`);

  item.status = 'archived';
  item.updatedAt = new Date().toISOString();

  appendAuditEvent(
    actor,
    'admin.content.archive',
    item.type,
    item.id,
    `Archived ${item.type}: "${item.title}"`
  );

  return item;
}

// ── Media Library Management ──

import { MediaItem } from '@/types';

const initialMedia: MediaItem[] = [
  {
    id: 'media-01',
    filename: 'azentio-architecture-diagram.png',
    mimeType: 'image/png',
    sizeBytes: 245760,
    altText: 'Enterprise Architecture & Federated Learning Diagram',
    audience: 'public',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    uploadedBy: 'usr-pub-nishanth',
    uploadedAt: '2026-10-10T12:00:00Z',
    usagesCount: 3,
  },
  {
    id: 'media-02',
    filename: 'confidential-audit-whitepaper-sample.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1572864,
    altText: 'Confidential Islamic Banking Covenant Whitepaper',
    audience: 'private',
    url: '/api/media/confidential-audit-whitepaper-sample.pdf',
    uploadedBy: 'usr-admin-max',
    uploadedAt: '2026-10-18T15:30:00Z',
    usagesCount: 1,
  },
];

class MediaStore {
  items: MediaItem[] = JSON.parse(JSON.stringify(initialMedia));
  reset() {
    this.items = JSON.parse(JSON.stringify(initialMedia));
  }
}

export const mediaStore = new MediaStore();

export function getMediaItems(
  actor: Actor,
  filter?: { audience?: 'public' | 'private'; search?: string }
): MediaItem[] {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Access denied: Media management requires content_publisher or portal_admin platform grant.');
  }

  let list = mediaStore.items;
  if (filter?.audience && filter.audience !== ('all' as any)) {
    list = list.filter((m) => m.audience === filter.audience);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter((m) => m.filename.toLowerCase().includes(s) || m.altText.toLowerCase().includes(s));
  }
  return list;
}

export function uploadMediaItem(
  actor: Actor,
  data: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    altText: string;
    audience: 'public' | 'private';
    url?: string;
  }
): MediaItem {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to upload media.');
  }

  // Max size: 25MB
  if (data.sizeBytes > 25 * 1024 * 1024) {
    throw new Error('Media upload exceeds maximum limit of 25MB.');
  }

  const item: MediaItem = {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    filename: data.filename,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    altText: data.altText,
    audience: data.audience,
    url: data.url || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
    uploadedBy: actor.userId,
    uploadedAt: new Date().toISOString(),
    usagesCount: 0,
  };

  mediaStore.items.unshift(item);

  appendAuditEvent(
    actor,
    'admin.media.upload',
    'media_item',
    item.id,
    `Uploaded ${item.audience} media item: ${item.filename} (${(item.sizeBytes / 1024).toFixed(1)} KB)`
  );

  return item;
}

export function deleteMediaItem(actor: Actor, id: string): { success: boolean } {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to delete media.');
  }

  const item = mediaStore.items.find((m) => m.id === id);
  if (!item) throw new Error(`Media item not found: ${id}`);

  mediaStore.items = mediaStore.items.filter((m) => m.id !== id);

  appendAuditEvent(
    actor,
    'admin.media.delete',
    'media_item',
    id,
    `Deleted media item: ${item.filename}`
  );

  return { success: true };
}

export function reorderFaqs(actor: Actor, orderedIds: string[]): { success: boolean } {
  const hasGrant =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  if (!hasGrant) {
    throw new Error('Requires content_publisher or portal_admin platform grant to reorder FAQs.');
  }

  orderedIds.forEach((id, index) => {
    const item = contentStore.items.find((i) => i.id === id);
    if (item && item.faqDetails) {
      item.faqDetails.order = index + 1;
    }
  });

  appendAuditEvent(
    actor,
    'admin.content.reorder_faqs',
    'faq_list',
    'all',
    'Reordered FAQs for public layout.'
  );

  return { success: true };
}
