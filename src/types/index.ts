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
  | 'knowledge'
  | 'live_session'
  | 'release_note'
  | 'team'
  | 'team_note'
  | 'notification'
  | 'audit_event'
  | 'demo'
  | 'saved_scenario'
  | 'client_resource'
  | 'bookmark'
  | 'saved_search'
  | 'terms_acceptance';
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
  | 'manage_content'
  | 'join'
  | 'invite'
  | 'comment'
  | 'review'
  | 'search';

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
  type?: 'platform' | 'client';
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  /** bcrypt hash of the user's password — NEVER store or log plain text passwords */
  passwordHash?: string;
  orgId: string;
  role: string;
  platformGrants: string[];
  memberships: Membership[];
  isVerifiedEmployee: boolean;
  avatar?: string;
  createdAt: string;
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

// ── Public Enterprise Models based on azentio_website_research.md ──

export interface ProductDomain {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  stats: { label: string; value: string }[];
  highlights: string[];
}

export interface ProductItem {
  id: string;
  domainId: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  features: string[];
  capabilities: { title: string; description: string }[];
  targetAudience: string[];
  deploymentModels: string[];
  complianceOrCertifications?: string[];
  metrics?: { label: string; value: string }[];
}

export interface LeaderPerson {
  id: string;
  name: string;
  role: string;
  category: 'executive' | 'board';
  bio: string;
  previousRoles?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

export interface PresenceOffice {
  id: string;
  city: string;
  country: string;
  region: 'Asia Pacific' | 'Middle East' | 'Africa' | 'South Asia' | 'Americas';
  isHeadquarters?: boolean;
  type: string;
  address?: string;
  phone?: string;
  established?: string;
}

export interface CustomerStory {
  id: string;
  clientName: string;
  domain: string;
  country: string;
  title: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
}

export interface IndustryAward {
  id: string;
  year: number;
  title: string;
  organization: string;
  category: string;
  productRef: string;
  badgeText: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  domain: string;
  author: string;
  publishedDate: string;
  readTime: string;
  tags: string[];
}

export interface CareerPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Contract' | 'Hybrid' | 'Remote';
  experienceLevel: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export interface ContactEnquiry {
  id: string;
  fullName: string;
  workEmail: string;
  companyName: string;
  country: string;
  interestDomain: string;
  message: string;
  phone?: string;
  submittedAt: string;
}

// =========================================================================
// EMPLOYEE PORTAL SPECIFIC MODELS
// =========================================================================

export interface PlaygroundScenario {
  id: string;
  offeringId: string;
  offeringName: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  synthetic: true;
  inputData: Record<string, any>;
  parameters: {
    key: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    default: any;
    options?: string[];
  }[];
}

export interface PlaygroundRun {
  id: string;
  userId: string;
  userName: string;
  scenarioId: string;
  scenarioTitle: string;
  offeringId: string;
  offeringName: string;
  mode: 'deterministic' | 'ai_assisted';
  params: Record<string, any>;
  outputSummary: string;
  metrics: { label: string; value: string; delta?: string }[];
  trace: { step: number; title: string; detail: string; status: 'ok' | 'flagged' }[];
  evidence: { rule: string; matchedField: string; confidence: number; note: string }[];
  limitations: string[];
  status: 'completed' | 'failed';
  createdAt: string;
  sharedWithTeamId?: string;
}

export interface PlaygroundFeedback {
  id: string;
  runId: string;
  userId: string;
  rating: number; // 1 - 5
  correctness: 'yes' | 'partly' | 'no';
  workedWell: string;
  issuesFound: string;
  tags: string[];
  submittedAt: string;
  editableUntil: string;
}

export interface LiveSession {
  id: string;
  title: string;
  hostName: string;
  hostRole: string;
  startTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended';
  description: string;
  agenda: string[];
  tags: string[];
  audience: 'employee';
  recordingMediaId?: string;
  thumbnailUrl?: string;
}

export interface LiveComment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  avatar?: string;
  body: string;
  createdAt: string;
  parentId?: string;
  reported?: boolean;
}

export interface Experiment {
  id: string;
  ownerId: string;
  ownerName: string;
  offeringId: string;
  offeringName: string;
  title: string;
  hypothesis: string;
  description: string;
  approach: string;
  expectedOutcome: string;
  successMetric: string;
  status: 'Draft' | 'Submitted' | 'In_Progress' | 'Completed' | 'Archived';
  tags: string[];
  collaboratorIds: string[];
  links: { title: string; url: string }[];
  visibility: 'employee';
  results?: { outcome: string; metrics: string; learnings: string };
  linkedPlaygroundRunIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentJoinRequest {
  id: string;
  experimentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface ExperimentComment {
  id: string;
  experimentId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

export interface InternalReleaseNote {
  id: string;
  version: string;
  title: string;
  date: string;
  offeringId: string;
  offeringName: string;
  type: 'Feature' | 'Improvement' | 'Fix' | 'Known_Issue';
  summary: string;
  fullNotes: string;
  knownIssues?: string[];
  relatedKnowledgeIds?: string[];
  relatedExperimentIds?: string[];
  audience: 'employee' | 'client';
  published: boolean;
  scheduledAt?: string;
  authorId: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  body: string;
  ownerId: string;
  ownerName: string;
  lastReviewedAt: string;
  nextReviewDate: string;
  reviewIntervalDays: 30 | 60 | 90 | 180;
  reviewStatus: 'current' | 'due_soon' | 'overdue';
  usefulnessScore: number;
  tags: string[];
  relatedOfferingIds: string[];
  version: number;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface KnowledgeVersion {
  id: string;
  knowledgeId: string;
  version: number;
  title: string;
  body: string;
  changedBy: string;
  changedAt: string;
  changeSummary: string;
}

export interface KnowledgeFeedback {
  id: string;
  knowledgeId: string;
  userId: string;
  feedbackType: 'useful' | 'outdated' | 'wrong';
  comment?: string;
  submittedAt: string;
}

export interface EmployeeTeam {
  id: string;
  name: string;
  leadId: string;
  leadName: string;
  goal: string;
  description: string;
  maxMembers: number;
  tags: string[];
  memberIds: string[];
  status: 'active' | 'archived';
  createdAt: string;
}

export interface TeamNote {
  id: string;
  teamId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
}

export interface TeamSubmission {
  id: string;
  teamId: string;
  title: string;
  summary: string;
  demoUrl?: string;
  repoUrl?: string;
  submittedAt: string;
}



// ============================================================================
// CLIENT PORTAL (MEMBER & ADMIN) TYPES
// ============================================================================

export interface TermsAcceptance {
  userId: string;
  orgId: string;
  version: string;
  acceptedAt: string;
}

export interface ClientInvitation {
  id: string;
  tokenHash: string;
  orgId: string;
  orgName: string;
  email: string;
  role: 'client_member' | 'client_admin';
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  usedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface EntitlementRequest {
  id: string;
  orgId: string;
  orgName: string;
  offeringId: string;
  offeringName: string;
  requestedBy: string;
  requestedByName: string;
  businessJustification: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ClientDemo {
  id: string;
  offeringId: string;
  offeringName: string;
  name: string;
  description: string;
  synthetic: true;
  category: 'Banking' | 'Lending' | 'Intelligence' | 'Compliance';
  scenarios: DemoScenario[];
}

export interface DemoScenario {
  id: string;
  demoId: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  inputData: Record<string, any>;
  parameters: {
    key: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    default: any;
    options?: string[];
  }[];
}

export interface DemoRun {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  demoId: string;
  scenarioId: string;
  scenarioTitle: string;
  mode: 'deterministic' | 'ai_assisted';
  params: Record<string, any>;
  outputSummary: string;
  metrics: { label: string; value: string; delta?: string }[];
  trace: { step: number; title: string; detail: string; status: 'ok' | 'flagged' }[];
  evidence: { rule: string; matchedField: string; confidence: number; note: string }[];
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface SavedScenario {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  name: string;
  scenarioId: string;
  scenarioTitle: string;
  params: Record<string, any>;
  shareScope: 'private' | 'org';
  createdAt: string;
  updatedAt: string;
}

export interface DemoFeedback {
  id: string;
  runId: string;
  userId: string;
  rating: number; // 1 - 5
  isCorrect: 'yes' | 'partly' | 'no';
  comments: string;
  submittedAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  orgId: string;
  title: string;
  query: string;
  filters: Record<string, string>;
  notifyNewMatches: boolean;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  orgId: string;
  targetType: 'observation' | 'theme' | 'demo' | 'scenario';
  targetId: string;
  title: string;
  snippet?: string;
  url: string;
  createdAt: string;
}

export interface ClientResource {
  id: string;
  title: string;
  type: 'briefing' | 'release_note' | 'webinar';
  summary: string;
  body: string;
  date: string;
  audience: 'entitled';
  offeringId?: string;
  offeringName?: string;
  webinarDetails?: {
    startTime: string;
    durationMinutes: number;
    speakerName: string;
    speakerRole: string;
  };
}

export interface WebinarRegistration {
  id: string;
  webinarId: string;
  userId: string;
  userEmail: string;
  orgId: string;
  registeredAt: string;
}

export interface ClientComment {
  id: string;
  parentKind: 'observation' | 'theme' | 'idea';
  parentId: string;
  orgId: string;
  userId: string;
  userName: string;
  avatar?: string;
  body: string;
  audience: 'tenant' | 'shared_learning';
  createdAt: string;
  updatedAt?: string;
  reported?: boolean;
}
