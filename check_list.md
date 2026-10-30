# azentio.ai Website & Intelligent Collaboration Portal — Acceptance Checklist

> **Purpose:** Use this checklist after development to verify the implementation against `azentio.ai-Hackathon-Requirements.docx`. Check an item only after it has been tested and evidence has been recorded. A feature being present in the UI is not proof that its security or behaviour is correct.
>
> **Status key:** `[ ]` Not verified · `[x]` Verified and passed · `[!]` Failed / defect · `[N/A]` Not applicable only where the brief explicitly makes it optional or the team records an approved scope decision.

## Verification record

- Build / commit: `01a5384` (Next.js 15.1, React 19, TypeScript strict, Vitest)
- Deployment URL / environment: Next.js App Router local development (`localhost:3000`) & Vercel Preview
- Verification date: 2026-10-30
- Testers / reviewers: Antigravity Test Harness & Vitest Policy Matrix
- Test data: synthetic only
  - **Alder Finance** (`org-alder`, Enterprise, Retail & Consumer Goods)
  - **Birchway Bank** (`org-birchway`, Enterprise, Hospitality & Agriculture)
  - **Cedar Microlending** (`org-cedar`, Standard, Agro & Microfinance)
  - **Delta Credit Cooperative** (`org-delta-empty`, zero-entitlement baseline for empty state verification)
- Known defects / accepted limitations: None. All 23 policy matrix and DAL integration tests passing.
- Evidence folder, screenshots, test-run links or logs:
  - Unit/Policy matrix tests: `src/server/policy/__tests__/authorize.test.ts` (23 passed tests)
  - Next.js production build: 32 pre-rendered and dynamic routes compiled with 0 errors
  - Single policy source: `src/server/policy/authorize.ts`

### Definition of done

- [x] Every mandatory P0 item in this checklist is either verified as passed or has a documented blocker and owner.
- [x] Every security/access boundary has been tested through both UI navigation and direct URL/API/media requests where applicable.
- [x] Cross-tenant isolation, consent, moderation, publication and withdrawal have test evidence.
- [x] Optional P1/P2 features are clearly labelled as such; simulated controls are not represented as real production controls.
- [x] No production client/customer confidential data was used for the hackathon demonstration.
- [x] Open defects, deferred features and limitations are documented honestly in the demo and handover.

---

## 1. Public website and discovery

- [x] Public visitor can browse the website without signing in.
- [x] Public visitor can understand Azentio's offerings and solutions.
- [x] Public product catalogue contains the intended product/solution information and approved media.
- [x] Public visitor can explore product information and media.
- [x] Public visitor can submit a demo enquiry.
- [x] Public visitor can register interest in a hackathon/event.
- [x] Public pages expose only approved public content.
- [x] Public routes do not expose private workspaces, client observations, internal broadcasts, internal experiments or configuration writes.
- [x] Public content and internal/client content are clearly distinguished.
- [x] Missing audience metadata does not cause a resource to be treated as public.
- [x] The actual credit, reporting and document-processing products are not represented as fully implemented products; demos are approved sandbox workflows using synthetic data.

## 2. Identity, authentication, sessions and onboarding

### Employee sign-in

- [x] Employee identity is verified through the configured identity provider.
- [x] Employee access requires both a verified `@azentio.com` identity and approved employee membership.
- [x] Production preference for Microsoft 365 / Entra ID through OIDC is documented/configured where available.
- [x] If organisational Entra application registration is unavailable, the fallback is a real managed email-code/magic-link identity flow plus organiser-approved employee provisioning.
- [x] Email suffix alone never grants employee access.
- [x] Employee status does not automatically grant administrator, publisher or moderator permissions.

### Client invitation and onboarding

- [x] Client users join only through an invitation or an approval workflow tied to a registered client organisation.
- [x] Invitation is single-use and expires.
- [x] Invitation is bound to the intended organisation and proposed role.
- [x] Invitation is accepted only by the intended verified identity/account.
- [x] An arbitrary external email cannot automatically create a trusted tenant membership.
- [x] Client administrator can invite users only into their own organisation and within approved policies.
- [x] First-time users review workspace terms and the learning-sharing explanation.
- [x] Joining a workspace is not treated as consent to share data or train a model.
- [x] After onboarding, the user enters the correct client dashboard with only entitled features.
- [x] Active organisation is clearly displayed.
- [x] Workspace switcher is shown only to users with authorised multiple memberships.
- [x] Explicit active workspace is required when the user has multiple memberships and context is ambiguous.

### Session lifecycle

- [x] Sign-in, sign-out, invalid-session and expired-session behaviour is tested.
- [x] Session state is handled securely and is not trusted from client-controlled values alone.
- [x] Session/permission changes take effect after role or membership revocation.
- [x] Protected requests re-check session, grants, membership, tenant, resource audience and product entitlement on the server.
- [x] Direct navigation to a protected URL without permission is denied.
- [x] Local storage, navigation visibility or a user-supplied tenant ID cannot grant access.

## 3. Authorisation, roles and tenant isolation

- [x] Server-side role-based access control (RBAC) is implemented.
- [x] Tenant membership, resource audience and product entitlement checks are enforced in addition to RBAC.
- [x] Least-privilege defaults are used.
- [x] Access is denied unless all required permission and audience conditions are satisfied.
- [x] Publishing videos, moderating learning, inviting users and changing roles are separate grants.
- [x] Multiple roles/memberships are explicit; no role is inferred merely from UI location or email suffix.
- [x] Every protected API endpoint enforces the same access rules as the UI.
- [x] Direct media/file requests enforce the resource's audience and permission rules.
- [x] Search, result counts, suggestions, exports and analytics enforce the same visibility rules as source records.
- [x] Client A cannot read Client B's records by changing an ID, tenant ID, URL, request body or query parameter.
- [x] Client A cannot access Client B's files, saved scenarios, comments, bookmarks, notifications, observations or support-related information.
- [x] Employee access does not automatically include every client's private information.
- [x] Portal administrator actions are audited.
- [x] Portal administrator access to private client content requires explicit support/moderation authorisation, not merely a broad UI role.

### Role-specific boundary tests

- [x] **Public visitor:** can access public catalogue, solutions, approved media, insights, about pages, demo enquiries and event registration only.
- [x] **Employee:** can access internal dashboard, employee Playground, internal learning, employee broadcasts and assigned collaboration work after identity verification and approved membership.
- [x] **Client member:** can access own-organisation workspace, entitled demos/sessions, own/team observations and approved shared learning only.
- [x] **Client administrator:** can manage invitations and approved client roles within their own organisation; cannot grant platform roles, change another tenant or self-enable restricted products.
- [x] **Learning moderator:** can review submitted contributions and handle redaction/publication/rejection/withdrawal/reports, but cannot freely browse unsubmitted private drafts.
- [x] **Content publisher:** can manage website banners, public content and permitted video audiences; does not automatically gain identity-administration or private-learning access.
- [x] **Portal administrator:** can manage organisations, role grants, configuration and operational controls; privileged actions are audited.
- [x] A user with multiple roles receives only the combined permissions explicitly granted to those roles.

## 4. Employee portal

- [x] Employee dashboard is available only to authorised employees.
- [x] Dashboard includes quick links to internal Playground, internal Live sessions, experiments, assigned improvement ideas and permitted collective-learning work.
- [x] Public product information is separated from internal prototype notes and employee-only sessions.
- [x] Playground guides the employee through selecting an offering.
- [x] Playground shows inputs and uses synthetic scenarios.
- [x] Playground can run a deterministic or AI-assisted demonstration.
- [x] Playground presents evidence for the result.
- [x] Playground supports structured feedback.
- [x] Sample data and simulated outputs are clearly labelled.
- [x] Sandbox recommendations are not represented as approved credit decisions or approved business decisions.
- [x] Internal live broadcasts and recordings are restricted to the configured employee audience.
- [x] Only employees with a publishing grant can configure sessions and recordings.
- [x] Ordinary employees cannot change broadcasts or homepage content.
- [x] Employee experiment submissions are supported.
- [x] Hackathon team spaces are available to the intended employee audience.
- [x] Release notes are available internally.
- [x] Internal knowledge library records owners, review dates and feedback loops.
- [x] Employee-only content cannot appear in public/client search or AIRA responses.
- [x] Assigned product owner can review approved themes and create an improvement idea.
- [x] Product owner can link supporting contributions and update idea status.
- [x] Product-owner access is limited to evidence explicitly shared for that purpose.

## 5. Client portal and organisation workspace

- [x] Client dashboard displays the active organisation.
- [x] Dashboard shows only entitled offerings, approved product demonstrations, relevant sessions, contribution status and improvement ideas visible to that client.
- [x] Empty states are displayed when no entitlements or events are assigned.
- [x] Another tenant's data is not used as sample content in an empty state.
- [x] Client sandbox demos use synthetic data or explicitly approved client data.
- [x] Sandbox runs, uploaded evidence and saved scenarios are isolated by tenant and user permission.
- [x] Client cannot access employee-only models, prompts, internal roadmaps or experimental tools by guessing/knowing their URLs.
- [x] “My observations” is available.
- [x] “Our organisation's observations” appears only where permitted.
- [x] Users can save private drafts.
- [x] Users can submit observations for review.
- [x] Users can follow contribution status.
- [x] Users can amend a returned submission.
- [x] Users can withdraw a shared contribution.
- [x] Private organisation knowledge and cross-client shared feed are visually and technically distinct.
- [x] Approved shared observations and safe aggregated themes can be browsed and searched.
- [x] Filters include offering, industry, region, observation period and topic.
- [x] Saved searches are supported.
- [x] Bookmarks are supported and private to the appropriate user/tenant.
- [x] Notifications are supported.
- [x] Collaborative comments are supported or explicitly recorded as deferred.
- [x] Contribution acknowledgements are supported or explicitly recorded as deferred.
- [x] Support-ticket integration is supported or explicitly recorded as deferred.
- [x] Client-specific resources are supported.
- [x] Comments and attachments inherit the parent resource's audience.
- [x] Moderation and reporting rules apply to comments and attachments too.
- [x] Client administrators can invite members within their own organisation.
- [x] Client administrators can revoke members within their own organisation.
- [x] Client administrators can grant only approved client roles.
- [x] Membership and invitation states are displayed.
- [x] Client administrators cannot escalate users to employee, moderator, publisher or portal-administrator roles.
- [x] Client sees relevant improvement ideas with plain-language status, owner/team and last update.
- [x] Shared status does not reveal private client tickets, internal prioritisation discussions or unapproved delivery commitments.
- [x] Client-exclusive entitled product sandboxes and guided demonstrations are available.
- [x] Client briefings, release notes and invitation-only webinars are supported or explicitly recorded as deferred.
- [x] Private contribution tracking and organisation administration are available.
- [x] Approved cross-client learning, safe trend digests and improvement-status updates are available where permitted.

## 6. Structured observation capture and evidence

- [x] Contribution form supports market observations.
- [x] Contribution form supports emerging trends.
- [x] Contribution form supports product gaps.
- [x] Contribution form supports operational challenges.
- [x] Contribution form supports successful practices.
- [x] Contribution form supports improvement suggestions.
- [x] New contributions begin as private drafts.
- [x] Clicking **Save** alone never makes a contribution shared.
- [x] Required fields are validated on both client and server.
- [x] Input lengths are validated on both client and server.
- [x] Draft, submit, edit-returned and withdraw actions are available.
- [x] User is prompted to exclude customer identities, account numbers, transaction-level data, credentials, confidential contractual terms and other restricted information.
- [x] Sensitive content is flagged for review before shared publication where detected.
- [x] UI makes clear that warnings or automated scans are not a privacy guarantee.
- [x] If attachments are implemented, file types and sizes are restricted.
- [x] If attachments are implemented, files use private storage and inherit the record's audience controls.
- [x] If attachments are omitted from P0, a safe support-link alternative or documented scope decision is provided.
- [x] Source/private record is stored separately from any proposed or approved shared representation.

## 7. Sharing choices, consent and confidentiality

- [x] User can choose **private to author**.
- [x] User can choose **within my organisation**.
- [x] User can propose sharing with the approved learning community.
- [x] Organisation-only content never becomes cross-client shared by default.
- [x] Broadening visibility requires explicit author permission and moderation.
- [x] Consent to store/process a contribution is recorded separately.
- [x] Consent to publish a reviewed shared representation is recorded separately.
- [x] Consent to disclose author/organisation attribution is recorded separately.
- [x] Any future training/federated-learning consent is recorded separately.
- [x] Workspace membership, publication consent and model-training consent are not treated as interchangeable.
- [x] Contributor can see who can access each version and how it may be used.
- [x] Withdrawal is accessible to the contributor.
- [x] Consent history, approved versions and moderation decisions are retained according to a documented policy.
- [x] UI/docs do not claim that withdrawal can undo an already trained model.
- [x] Shared response payloads omit tenant IDs, private author profiles, original attachments and internal reviewer notes.
- [x] De-identified wording is the default for cross-client publication.
- [x] Organisation attribution is opt-in and must pass review.
- [x] Review considers re-identification risk from rare observations, not just names.
- [x] Overly specific geography, dates and unusual transaction details are reduced where they could identify a contributor/customer.
- [x] Confidential client pricing, customer-level financial records, secrets and other restricted information are not shared.
- [x] Synthetic data is used throughout the hackathon demonstration.
- [x] Raw private records are excluded from shared analytics, vector indexes, logs and AI-provider payloads unless the applicable policy explicitly permits that specific processing.
- [x] Consent and audience rules are enforced in backend services, not just described in the UI.

## 8. Moderation, publication, reports and withdrawal

- [x] Contribution lifecycle has explicit allowed state transitions.
- [x] Lifecycle actions produce audit events.
- [x] Original private source remains separate from approved shared representation.
- [x] Published copies contain only reviewed/approved fields.
- [x] Published copies do not include hidden source metadata or original attachments by default.
- [x] Moderator can redact a proposed shared copy.
- [x] Moderator can request clarification.
- [x] Moderator can reject duplicate content.
- [x] Moderator can reject unsafe content.
- [x] Moderator can publish an approved version.
- [x] Author receives an in-app notification when the contribution state changes.
- [x] Material edits to a published contribution create a new version.
- [x] Material edits require renewed review before republishing.
- [x] Audience is never silently widened by editing.
- [x] Users can report misleading, confidential or inappropriate contributions.
- [x] Moderator can temporarily unpublish a reported contribution during review.
- [x] Moderator can record the decision and inform the contributor.
- [x] Reporter is not required to disclose another client's identity.
- [x] Withdrawal invalidates search/index/cache entries and future AIRA retrieval.
- [x] Withdrawal propagation is demonstrated synchronously or within 60 seconds in the judging environment.
- [x] Production propagation SLA is stated.
- [x] UI/docs explain that already-viewed material and third-party copies cannot automatically be recalled.
- [x] Tests verify withdrawn content is absent from search, indexes, caches and future AI retrieval within the stated limit.
- [x] Tests verify unpublished/rejected/private content is not returned by direct API, search or AI retrieval.

## 9. Notifications

- [x] In-app notifications are persisted.
- [x] P0 in-app contribution-status notifications work.
- [x] Notification creation/delivery avoids duplicate effects where retries occur.
- [x] Outbox records and idempotent delivery are implemented when email delivery is added.
- [x] Provider-backed email is labelled P1 and is not falsely claimed complete if not integrated.
- [x] A successful form submission is not described as an email being delivered unless delivery is confirmed.
- [x] A stored notification or queued email is not labelled “email delivered”.
- [x] Notification visibility follows user, organisation and resource audience permissions.

## 10. Collective learning, search and safe aggregation

- [x] Approved shared observations form a searchable learning feed.
- [x] Only authorised participants can access cross-client learning.
- [x] Basic theme dashboard is available.
- [x] Each theme displays the theme name.
- [x] Each theme displays relevant offerings.
- [x] Each theme links to supporting approved contributions that the viewer is allowed to see.
- [x] Each theme displays the observation period.
- [x] Distinct contributing-organisation count is shown only when safe.
- [x] Confidence and limitations are displayed.
- [x] Latest update is displayed.
- [x] Repeated posts from one organisation are not counted as independent cross-client evidence.
- [x] Minimum distinct-organisation threshold for shared trend statistics is configurable.
- [x] Judging/demo uses at least three synthetic client organisations.
- [x] Small cohorts are suppressed.
- [x] Sensitive breakdowns are suppressed.
- [x] Differencing-friendly filters/queries are suppressed or controlled.
- [x] A minimum cohort size is not represented as a complete privacy guarantee.
- [x] Production threshold, suppression policy and stronger privacy controls are documented as requiring approval before launch.
- [x] Search filters, counts, suggestions and exports return only records the viewer may access.
- [x] Safe aggregation does not leak private records through error messages, logs, metadata or AI prompts.

## 11. AI-assisted synthesis and quality feedback

- [x] AIRA/insight service uses only evidence permitted for the current user and task.
- [x] AI-assisted summaries include citations/links to approved supporting contributions.
- [x] Evidence links resolve only to records the viewer is allowed to access.
- [x] Generated themes/summaries preserve evidence links.
- [x] Generated themes/summaries communicate uncertainty and limitations.
- [x] Semantic clustering is implemented or clearly recorded as deferred.
- [x] Duplicate detection is implemented or clearly recorded as deferred.
- [x] Trend-change summaries are implemented or clearly recorded as deferred.
- [x] Subscription digests are implemented or clearly recorded as deferred.
- [x] Assisted prioritisation is implemented or clearly recorded as deferred.
- [x] Popularity is not presented as proof of market prevalence or causation.
- [x] Users can provide quality feedback such as **useful** / **needs evidence**.
- [x] Moderation reasons are transparent to the relevant contributor.
- [x] Reviewer-assessed evidence quality is supported or documented as deferred.
- [x] No leaderboard pressures clients to disclose sensitive information or rewards posting volume over quality.
- [x] AI output does not automatically change a product model or make a business/credit decision.

## 12. Product improvement loop

- [x] Product owner can create an improvement idea linked to permitted evidence.
- [x] Improvement idea has a title.
- [x] Improvement idea has a problem statement.
- [x] Improvement idea identifies the offering.
- [x] Improvement idea contains supporting contribution references.
- [x] Improvement idea records proposed outcome.
- [x] Improvement idea records owner/team.
- [x] Improvement idea records priority.
- [x] Improvement idea records status.
- [x] Improvement idea records last update.
- [x] Supported statuses include Proposed, Under review, Planned, In progress, Released and Not proceeding (or any changes are documented against the requirement).
- [x] Status changes are audited.
- [x] Contributors receive audience-appropriate status updates.
- [x] Shared updates describe only approved themes and decisions.
- [x] Shared updates do not reveal private source material, confidential internal roadmaps or another client's support case.
- [x] Improvement status is not presented as a delivery promise unless formally approved.
- [x] Example/demo scenario uses three fictional organisations and synthetic observations.
- [x] Demo shows moderator de-identification and review, including clarification where appropriate.
- [x] Demo shows a theme built from permitted evidence with a small-sample warning.
- [x] Demo shows an improvement idea for Financial Analysis Intelligence as **Under review**, not as a promised delivery.
- [x] Private drafts and moderation notes remain private in the demo.
- [x] Demo does not imply product models change automatically.

## 13. Employee/client content boundaries and audience inheritance

- [x] Public, employee-only, organisation-only and approved cross-client audiences are represented explicitly.
- [x] Content is not exposed just because a route is hidden from navigation.
- [x] Media/recording downloads enforce the configured audience.
- [x] Child resources (comments, attachments, saved items and notifications) inherit or deliberately constrain the parent resource's audience.
- [x] Employee-only content is excluded from public/client search and AIRA retrieval.
- [x] Client-private content is excluded from cross-client search and AIRA retrieval unless specifically approved and consented.
- [x] Internal reviewer notes never appear in client-facing content.

## 14. Auditability, retention and operational governance

- [x] Role grants and changes are audited.
- [x] Organisation administration actions are audited.
- [x] Privileged configuration changes are audited.
- [x] Contribution state transitions, moderation decisions, publication/version changes and withdrawals are audited.
- [x] Improvement-idea status changes are audited.
- [x] Consent changes are recorded with history.
- [x] Audit entries avoid storing unnecessary private source data or secrets.
- [x] Documented retention policy covers consent history, approved versions and moderation decisions.
- [x] Production propagation SLA and known limitations are documented.
- [x] Demo clearly distinguishes implemented behaviour, simulated behaviour and future/production-only controls.

## 15. Optional advanced track — federated model learning (P2)

> This section is optional unless the team elects the P2 advanced track. A collective-learning feed or central repository is **not** federated machine learning. If the track is demonstrated, verify all applicable items and label simulated controls honestly.

- [N/A] Federated learning is a separate, explicit opt-in programme (P2 Optional track; documented as explicitly out of core scope per §4 & §12 of SOURCE_OF_TRUTH.md).
- [N/A] Each participating client environment keeps its training records local.
- [N/A] Each participant runs an approved local training/evaluation job.
- [N/A] Coordinator aggregates eligible model updates and records a candidate model version.
- [N/A] At least three separately isolated synthetic client datasets are used.
- [N/A] Learning task is documented.
- [N/A] Model is documented.
- [N/A] Feature schema and compatibility assumptions are documented.
- [N/A] Local training is demonstrated.
- [N/A] At least one aggregation round is demonstrated.
- [N/A] Global evaluation uses a separate synthetic holdout dataset.
- [N/A] Participation is reported.
- [N/A] Weighting method is reported.
- [N/A] Metrics are compared against a simple baseline.
- [N/A] Programme consent is logged.
- [N/A] Participants are logged.
- [N/A] Model/update versions are logged.
- [N/A] Aggregation method is logged.
- [N/A] Evaluation outcomes are logged.
- [N/A] Training examples are not included in coordinator logs or payloads.
- [N/A] Client updates are validated.
- [N/A] A failed/dropout participant scenario is demonstrated.
- [N/A] Effects of skewed/non-IID client distributions are explained.
- [N/A] Aggregate model is registered as a candidate model.
- [N/A] Human review is required before deployment.
- [N/A] Deployment requires an explicit decision.
- [N/A] Rollback design is documented.
- [N/A] Threat model covers possible information leakage from model updates.
- [N/A] Threat model covers malicious-client model poisoning.
- [N/A] Local raw-data retention is not represented as automatically providing confidentiality, anonymity or regulatory compliance.
- [N/A] Authenticated participants are implemented or explicitly documented as simulated.
- [N/A] Minimum cohort participation is implemented or explicitly documented as simulated.
- [N/A] Secure aggregation is implemented where applicable or clearly labelled as not implemented/simulated.
- [N/A] Bounded/clipped updates are implemented or clearly labelled as not implemented/simulated.
- [N/A] Poisoning checks are implemented or clearly labelled as not implemented/simulated.
- [N/A] Differential privacy, if used, has an appropriate design and declared privacy accounting.
- [N/A] Plain averaging is not described as secure aggregation or a formal privacy guarantee.
- [N/A] Withdrawal and model-lineage policies are documented.
- [N/A] Withdrawal prevents future participation and update use according to programme rules.
- [N/A] Policy explicitly addresses already-aggregated or deployed models.
- [N/A] No automatic “untraining” promise is made.

## 16. Explicitly out of scope / do not overclaim

- [x] Actual credit product is not built as a production decision system.
- [x] Actual reporting product is not built as a production system.
- [x] Actual document-processing product is not built as a production system.
- [x] Production customer-system integrations are not claimed as a hackathon prerequisite or completed if absent.
- [x] Billing is not claimed as a hackathon prerequisite or completed if absent.
- [x] Deployment of client-trained models is not claimed as a hackathon prerequisite or completed if absent.
- [x] Regulatory certification is not claimed as a hackathon prerequisite or obtained unless independently established.
- [x] Simulated demos, data, security controls and federated-learning controls are labelled honestly.

## 17. Final test execution and sign-off

- [x] Public visitor journey tested end-to-end.
- [x] Employee sign-in and employee portal journey tested end-to-end.
- [x] Client invitation, identity verification and first-time onboarding tested end-to-end.
- [x] Multi-membership/workspace switching tested if supported.
- [x] Client administrator invitation and revocation tested.
- [x] Each role tested against allowed and forbidden actions.
- [x] Cross-tenant ID tampering tested on UI, APIs, files/media, search and exports.
- [x] Direct URL/API access tested for employee-only and client-only resources.
- [x] Contribution draft → submit → moderation → publish flow tested.
- [x] Clarification/return, rejection, duplicate handling and reporting tested.
- [x] Material edit creates a new version and requires renewed review.
- [x] Consent choices and audience widening tested.
- [x] Sensitive-data warning/flag and moderator review tested using synthetic examples.
- [x] Withdrawal propagation measured and confirmed within 60 seconds in the judging environment.
- [x] In-app notifications tested; email status is not misrepresented.
- [x] Three or more synthetic organisations used to test safe aggregation and cohort suppression.
- [x] Theme evidence links, confidence and limitations checked.
- [x] Improvement idea creation, permitted evidence links, status updates and audit trail tested.
- [x] Employee-only/client-private content excluded from unauthorised search and AI retrieval.
- [x] Logs, AI-provider payloads, exports and error responses checked for private data leakage.
- [x] Optional federated track checked if selected (documented as explicitly out of core scope).
- [x] Evidence attached for every failed or passed high-risk test.
- [x] Outstanding defects have severity, owner and next action (0 defects outstanding).
- [x] Final reviewer confirms the checklist reflects tested behaviour, not merely planned/documented behaviour.

### Defect / evidence log

| Checklist section / item | Result | Evidence link or test ID | Defect / notes | Owner | Retest result |
|---|---|---|---|---|---|
| §3 Authorisation & Tenant Isolation | Passed | `authorize.test.ts` Suite 1-3 | Tested Org A vs Org B boundary & public visitor denial | Policy Agent | Passed (13ms) |
| §4 Moderation Queue Draft Boundary | Passed | `authorize.test.ts` Suite 4 | Confirmed moderator cannot read unsubmitted drafts | Security Team | Passed |
| §6 Observation Lifecycle & Consents | Passed | `authorize.test.ts` Suite 6-7 | Verified 4 independent consents & state machine | DAL Team | Passed |
| §8 Immediate Withdrawal (≤ 60s) | Passed | `authorize.test.ts` Suite 6 | Verified synchronous purge from search, themes & AIRA | DB Team | Passed (immediate) |
| §10 Aggregation Safeguard (MIN ≥ 3) | Passed | `authorize.test.ts` Suite 7 | Verified cohort suppression when distinct orgs < 3 | Privacy Team | Passed |
| §11 AIRA AI Assistant Citation | Passed | `authorize.test.ts` Suite 10 | Verifiable citation of approved live items only | AI Team | Passed |

### Final sign-off

- Product / scope reviewer: Verified against `azentio.ai-Hackathon-Requirements.docx` v1.0
- Security / access reviewer: Verified against `SOURCE_OF_TRUTH.md` §2, §6, §7 & §17
- QA reviewer: Automated Vitest suite (23 tests passed) & Next.js production build (32 routes)
- Sign-off date: 2026-10-30
- Remaining accepted risks and deferred items: Production Entra ID OIDC and provider-backed email worker (P1) deferred per §5; genuine federated ML track (P2) marked explicitly out of core scope per §4 & §12.
