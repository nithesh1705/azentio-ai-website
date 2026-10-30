export type RoleKey =
  | 'public'
  | 'employee'
  | 'client_member'
  | 'client_admin'
  | 'learning_moderator'
  | 'content_publisher'
  | 'product_owner'
  | 'portal_admin';

export type ResourceAudience =
  | 'public'
  | 'employee'
  | 'tenant'
  | 'tenant_team'
  | 'entitled'
  | 'shared_learning'
  | 'author_only';

export interface Membership {
  orgId: string;
  role: 'client_member' | 'client_admin';
  status: 'active' | 'invited' | 'suspended';
}

export interface Actor {
  userId: string;
  name: string;
  email: string;
  platformGrants: string[]; // e.g. 'learning_moderator', 'content_publisher', 'product_owner', 'portal_admin'
  memberships: Membership[];
  activeTenantId: string | null;
  isVerifiedEmployee: boolean;
  avatar?: string;
}

export interface ResourceRef {
  kind:
  | 'page'
  | 'offering'
  | 'media'
  | 'contribution'
  | 'published_observation'
  | 'theme'
  | 'idea'
  | 'org'
  | 'membership'
  | 'invitation'
  | 'support_session'
  | 'experiment'
  | 'playground'
  | 'demo_enquiry'
  | 'hackathon_registration'
  | 'knowledge';
  id?: string;
  audience: ResourceAudience;
  orgId?: string | null;
  authorId?: string;
  offeringId?: string;
  assignedTo?: string;
  isDraft?: boolean;
}

export type Action =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'submit'
  | 'claim'
  | 'request_clarification'
  | 'publish'
  | 'reject'
  | 'withdraw'
  | 'report'
  | 'unpublish'
  | 'reinstate'
  | 'invite_member'
  | 'manage_roles'
  | 'grant_platform_role'
  | 'manage_org'
  | 'access_support'
  | 'run_sandbox'
  | 'manage_content';

export interface Decision {
  allow: boolean;
  reason: string;
}

export type ContributionState =
  | 'Draft'
  | 'Submitted'
  | 'In_Review'
  | 'Returned'
  | 'Rejected'
  | 'Published'
  | 'Unpublished_Under_Review'
  | 'Withdrawn';

export type VisibilityChoice =
  | 'private_to_author'
  | 'within_organisation'
  | 'propose_to_learning_community';

export interface Consents {
  consent_process: boolean;
  consent_publish: boolean;
  consent_attribution: boolean;
  consent_training: boolean;
  policyVersion: string;
  timestamp: string;
}

export interface ContributionRevision {
  version: number;
  title: string;
  body: string;
  offeringId: string;
  industry: string;
  region: string;
  observationPeriod: string;
  evidenceType: string;
  confidence: 'High' | 'Medium' | 'Preliminary';
  links: string[];
  createdAt: string;
  notes?: string;
}

export interface Contribution {
  id: string;
  orgId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  currentState: ContributionState;
  visibilityChoice: VisibilityChoice;
  revisions: ContributionRevision[];
  currentRevision: ContributionRevision;
  consents: Consents;
  sensitivityFlags: string[];
  assignedModeratorId?: string;
  moderatorNotes?: string;
  rejectionReason?: string;
  clarificationRequest?: string;
  publishedObservationId?: string;
  createdAt: string;
  updatedAt: string;
}

// Dedicated shared read model - structurally stripped of private tenant and author details
export interface PublishedObservation {
  id: string;
  sourceContributionRef: string; // for internal tracking only, not exposed in public cards
  version: number;
  title: string; // De-identified
  body: string; // De-identified
  offeringId: string;
  offeringName: string;
  industryBand: string;
  regionBand: string;
  periodBand: string;
  evidenceType: string;
  confidence: 'High' | 'Medium' | 'Preliminary';
  attributionOptIn: boolean;
  attributionLabel: string; // e.g. "Anonymous Financial Institution" or explicit opt-in label
  status: 'live' | 'unpublished' | 'withdrawn';
  publishedAt: string;
  themesCount?: number;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  offeringIds: string[];
  offeringNames: string[];
  observationPeriod: string;
  supportingObservationIds: string[];
  distinctOrgCount: number; // Safeguard MIN_DISTINCT_ORGS applied in DAL
  confidence: string;
  limitations: string;
  lastUpdated: string;
  synthetic: boolean;
}

export type IdeaStatus =
  | 'Proposed'
  | 'Under review'
  | 'Planned'
  | 'In progress'
  | 'Released'
  | 'Not proceeding';

export interface ImprovementIdea {
  id: string;
  title: string;
  problemStatement: string;
  offeringId: string;
  offeringName: string;
  supportingContributionRefs: string[];
  proposedOutcome: string;
  ownerTeam: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: IdeaStatus;
  lastUpdate: string;
  clientVisibleSummary: string;
  statusHistory: {
    status: IdeaStatus;
    changedAt: string;
    changedBy: string;
    note: string;
  }[];
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  tier: 'Enterprise' | 'Core' | 'Standard';
  entitledOfferings: string[];
  domain: string;
  memberCount: number;
  synthetic: boolean;
}

export interface Offering {
  id: string;
  slug: string;
  name: string;
  category: 'Banking' | 'Lending' | 'Intelligence' | 'Compliance';
  tagline: string;
  description: string;
  features: string[];
  capabilities: { title: string; description: string; badge?: string }[];
  sandboxAvailable: boolean;
  badge?: string;
  synthetic: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  kind: 'contribution_status' | 'idea_update' | 'system' | 'mention';
  title: string;
  message: string;
  link?: string;
  state: 'stored' | 'read';
  createdAt: string;
  deliveredChannelState: 'stored' | 'queued' | 'sent' | 'delivered';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceKind: string;
  resourceId: string;
  details: string;
  ip?: string;
}

export interface DemoEnquiry {
  id: string;
  fullName: string;
  workEmail: string;
  companyName: string;
  offeringSlug: string;
  message: string;
  submittedAt: string;
}

export interface HackathonRegistration {
  id: string;
  fullName: string;
  workEmail: string;
  track: string;
  teamSize: number;
  notes: string;
  submittedAt: string;
}
