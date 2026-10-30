import { Actor, KnowledgeItem, KnowledgeVersion, KnowledgeFeedback } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { SEED_KNOWLEDGE_ITEMS } from './seed_employee';
import { store } from '@/server/dal/store';

let activeKnowledgeItems: KnowledgeItem[] = [...SEED_KNOWLEDGE_ITEMS];
let activeKnowledgeVersions: KnowledgeVersion[] = [
  {
    id: 'kv-01',
    knowledgeId: 'kb-2026-01',
    version: 1,
    title: 'Initial DAL Architecture Guidelines',
    body: 'Initial guidance on zero DB query inside UI components.',
    changedBy: 'Nithesh M',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    changeSummary: 'Initial publication',
  },
  {
    id: 'kv-02',
    knowledgeId: 'kb-2026-01',
    version: 2,
    title: 'Added Shared Read Model De-identification Rules',
    body: 'Specified stripping of author, tenant, and revision metadata.',
    changedBy: 'Nithesh M',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    changeSummary: 'Added shared read model rules',
  },
];

let activeKnowledgeFeedbacks: KnowledgeFeedback[] = [];

export function getKnowledgeItems(
  actor: Actor,
  filters?: { category?: string; reviewStatus?: string; search?: string }
): KnowledgeItem[] {
  const auth = authorize(actor, 'read', { kind: 'knowledge', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  let result = [...activeKnowledgeItems];

  if (filters?.category && filters.category !== 'all') {
    result = result.filter((k) => k.category === filters.category);
  }
  if (filters?.reviewStatus && filters.reviewStatus !== 'all') {
    result = result.filter((k) => k.reviewStatus === filters.reviewStatus);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.body.toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}

export function getKnowledgeItemById(actor: Actor, id: string): KnowledgeItem | undefined {
  const auth = authorize(actor, 'read', { kind: 'knowledge', audience: 'employee', id });
  if (!auth.allow) throw new Error(auth.reason);

  return activeKnowledgeItems.find((k) => k.id === id);
}

export function createKnowledgeItem(
  actor: Actor,
  data: {
    title: string;
    category: string;
    body: string;
    reviewIntervalDays: 30 | 60 | 90 | 180;
    tags: string[];
    relatedOfferingIds: string[];
  }
): KnowledgeItem {
  const auth = authorize(actor, 'create', { kind: 'knowledge', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const now = new Date();
  const nextDate = new Date(now.getTime() + data.reviewIntervalDays * 24 * 60 * 60 * 1000);

  const newItem: KnowledgeItem = {
    id: `kb-${Date.now().toString().slice(-4)}`,
    title: data.title,
    category: data.category,
    body: data.body,
    ownerId: actor.userId,
    ownerName: actor.name,
    lastReviewedAt: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    reviewIntervalDays: data.reviewIntervalDays,
    reviewStatus: 'current',
    usefulnessScore: 0,
    tags: data.tags,
    relatedOfferingIds: data.relatedOfferingIds,
    version: 1,
    status: 'Published',
  };

  activeKnowledgeItems.unshift(newItem);

  activeKnowledgeVersions.unshift({
    id: `kv-${Date.now().toString().slice(-4)}`,
    knowledgeId: newItem.id,
    version: 1,
    title: newItem.title,
    body: newItem.body,
    changedBy: actor.name,
    changedAt: now.toISOString(),
    changeSummary: 'Initial document draft published',
  });

  store.logAudit(
    actor,
    'create_knowledge',
    'knowledge',
    newItem.id,
    `Published knowledge item "${newItem.title}"`
  );

  return newItem;
}

export function markKnowledgeReviewed(actor: Actor, id: string): KnowledgeItem {
  const item = activeKnowledgeItems.find((k) => k.id === id);
  if (!item) throw new Error('Knowledge item not found');

  const auth = authorize(actor, 'update', {
    kind: 'knowledge',
    audience: 'employee',
    id,
    authorId: item.ownerId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  const now = new Date();
  const nextDate = new Date(now.getTime() + item.reviewIntervalDays * 24 * 60 * 60 * 1000);

  item.lastReviewedAt = now.toISOString();
  item.nextReviewDate = nextDate.toISOString();
  item.reviewStatus = 'current';

  store.logAudit(
    actor,
    'review_knowledge',
    'knowledge',
    id,
    `Marked document "${item.title}" as reviewed`
  );

  return item;
}

export function reassignKnowledgeOwner(
  actor: Actor,
  id: string,
  newOwnerId: string,
  newOwnerName: string
): KnowledgeItem {
  const item = activeKnowledgeItems.find((k) => k.id === id);
  if (!item) throw new Error('Knowledge item not found');

  const auth = authorize(actor, 'update', {
    kind: 'knowledge',
    audience: 'employee',
    id,
    authorId: item.ownerId,
  });
  if (!auth.allow) throw new Error(auth.reason);

  item.ownerId = newOwnerId;
  item.ownerName = newOwnerName;

  store.logAudit(
    actor,
    'transfer_ownership',
    'knowledge',
    id,
    `Transferred knowledge ownership to ${newOwnerName}`
  );

  return item;
}

export function submitKnowledgeFeedback(
  actor: Actor,
  feedback: {
    knowledgeId: string;
    feedbackType: 'useful' | 'outdated' | 'wrong';
    comment?: string;
  }
): KnowledgeFeedback {
  const auth = authorize(actor, 'create', { kind: 'knowledge', audience: 'employee' });
  if (!auth.allow) throw new Error(auth.reason);

  const item = activeKnowledgeItems.find((k) => k.id === feedback.knowledgeId);
  if (item && feedback.feedbackType === 'useful') {
    item.usefulnessScore += 1;
  }

  const fb: KnowledgeFeedback = {
    id: `kfb-${Date.now().toString().slice(-4)}`,
    knowledgeId: feedback.knowledgeId,
    userId: actor.userId,
    feedbackType: feedback.feedbackType,
    comment: feedback.comment,
    submittedAt: new Date().toISOString(),
  };

  activeKnowledgeFeedbacks.unshift(fb);
  return fb;
}

export function getKnowledgeVersions(actor: Actor, knowledgeId: string): KnowledgeVersion[] {
  const auth = authorize(actor, 'read', { kind: 'knowledge', audience: 'employee', id: knowledgeId });
  if (!auth.allow) throw new Error(auth.reason);

  return activeKnowledgeVersions.filter((v) => v.knowledgeId === knowledgeId);
}
