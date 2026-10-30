# SOURCE_OF_TRUTH.md — azentio.ai Portal

> **Status:** Authoritative. Every Antigravity agent, human, and PR must conform to this file.
> **Conflict rule:** If code, a prompt, or `PHASES.md` disagrees with this file, this file wins. If this file disagrees with the hackathon brief (`azentio.ai-Hackathon-Requirements.docx` v1.0), the brief wins and this file must be fixed in the same PR.
> **Change rule:** Changes to this file go in their own commit with a line added to the Decision Log (§22).

---

## 1. Product in one paragraph

azentio.ai is an enterprise AI website plus a secure collaboration portal. The public site showcases Azentio offerings. Employees and clients each get a distinct, exclusive, server-enforced experience. Clients contribute market observations with explicit sharing choices; moderators review and de-identify them; approved contributions become searchable shared learning and themes; product owners turn themes into improvement ideas and close the loop with clients — without exposing any client's private information.

## 2. Non-negotiable principles

1. **Deny by default.** Access requires: valid identity + required permission + audience match + tenant membership (where applicable) + product entitlement (where applicable). Missing metadata = denied, never public.
2. **Server is the only authority.** Never derive authority from nav menus, `localStorage`, email suffix alone, hidden fields, or a user-supplied tenant ID. The active tenant comes from the server-side session only.
3. **Private source ≠ shared representation.** The original contribution is never exposed cross-tenant. A published copy is a separate row containing only reviewed fields.
4. **Consent is granular.** Four separate consents (§10). Membership, publishing, attribution, and training are never conflated. Save ≠ Share.
5. **Withdrawal is real and fast.** Withdrawal removes the item from search, counts, themes, caches, exports and AIRA retrieval synchronously (≤ 60 s hard ceiling, target immediate).
6. **Be honest in the UI.** Synthetic data is labelled. Simulated output is labelled. "Queued"/"stored" is never shown as "email delivered". Plain averaging is never called secure aggregation. We never claim withdrawal un-trains a model.
7. **Privacy is not a guarantee we claim.** Warnings/scans only *flag* for review. Min-cohort ≠ anonymity.
8. **Synthetic data only** throughout the hackathon.

## 3. Out of scope

Real credit/reporting/document-processing products; production customer-system integrations; billing; client-trained model deployment; regulatory certification; real PII. Sandbox demos use synthetic data only.

## 4. Requirement scope and learning terminology

The hackathon brief remains the source of truth. This file operationalises it; it must not silently drop a brief requirement. Use the following scope labels when planning and reporting progress:

- **Core / P0:** Required portal, public discovery, distinct employee and client experiences, secure server-side authorisation, client observation capture, consent, moderation, safe shared learning, insights/improvement loop, in-app notifications, and acceptance tests.
- **P1 enhancement:** Provider-backed email delivery and private attachment storage. P0 may use links instead of uploads and in-app notifications instead of email, as allowed by the brief.
- **P2 optional advanced track:** Genuine federated model learning. It is not a substitute for the required collective-learning hub. If selected, all requirements in §12 must be addressed; if not selected, document it as explicitly out of scope rather than implying it was implemented.

The three learning concepts must not be conflated:

1. **Collective-learning hub (required):** Clients submit observations; moderators review and de-identify approved copies; authorised participants search safe shared contributions and themes.
2. **AI-assisted synthesis:** AIRA/insight services summarise only permitted evidence and cite/link the approved contributions that support each answer or theme. Retrieval and summarisation do not retrain a model.
3. **Federated machine learning (optional P2):** Separate client environments train locally and send governed model updates to a coordinator. Raw client training records remain local. A discussion board or central repository is not federated learning.

## 5. Tech stack (fixed)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router), TypeScript strict** | Deploy on **Vercel** |
| UI | Tailwind CSS + shadcn/ui | Create an original visual identity, layout, navigation, and user experience from the team's own concept. Do not use or refer to the supplied reference prototype. |
| DB | **Postgres (Neon via Vercel Marketplace)** | Branch DBs for preview deploys |
| ORM/migrations | **Drizzle ORM + drizzle-kit** | SQL migrations committed |
| Auth | **Auth.js (NextAuth v5)** with Drizzle adapter | Email code / magic link via Resend (org Entra registration unavailable). Entra ID OIDC documented as the production path |
| Validation | **Zod** shared client + server | Same schema file used by form and route |
| Search | **Postgres FTS (`tsvector` + GIN) over `published_observations` only** | No external index → withdrawal invalidation is a single transaction |
| AI (AIRA) | Vercel AI SDK, provider-configurable; **deterministic fallback** when no key | Retrieval limited to approved public/shared/entitled content |
| Files | **P0: links only.** P1: Vercel Blob **private** + authorised proxy route | Never serve blob URLs directly |
| Email | P1: Resend via outbox worker | P0 is in-app notifications only |
| Rate limiting | Upstash Redis (or Postgres counter fallback) on auth + submit + report routes | |
| Testing | Vitest (unit/policy), Playwright (e2e + access matrix) | |
| CI | GitHub Actions: typecheck, lint, unit, policy-matrix, e2e on preview | |
| Dev tooling | **Google Antigravity** (agent-first IDE) — see §20 | |

Do not add libraries outside this table without a Decision Log entry.

## 6. Identity, roles, tenancy

### 6.1 Personas → roles

| Role key | Scope | Key capability | Hard boundary |
|---|---|---|---|
| `public` | none (unauthenticated) | Public catalogue, solutions, approved media, insights, about, demo enquiry, event registration | No private/internal anything; no config writes |
| `employee` | platform | Internal dashboard, Playground, internal learning, broadcasts (view), assigned work | Needs verified `@azentio.com` identity **and** approved employee membership. No implicit admin; no automatic access to client-private data |
| `client_member` | tenant | Own-org workspace, entitled demos/sessions, own/team observations, approved shared learning | Tenant + entitlement checks on every resource; no employee-only items |
| `client_admin` | tenant | Invite/revoke members, grant client roles within own org | Cannot grant platform roles, touch other tenants, or self-enable restricted products |
| `learning_moderator` | platform grant | Review, redact, request clarification, publish, reject, withdraw, handle reports | **No** access to unsubmitted client-private drafts |
| `content_publisher` | platform grant | Banners, public content, video audiences | No identity admin; no private learning access |
| `product_owner` | platform grant (assignment) | Create/update improvement ideas, link evidence | Sees **only** evidence explicitly shared for that purpose |
| `portal_admin` | platform grant | Orgs, role grants, config, ops | All privileged actions audited. Private client content needs explicit, time-boxed **support/moderation authorisation**, not just this role |

Permissions are **separate grants** (publish video, moderate, invite users, change roles are never bundled). Employee status ≠ any grant.

### 6.1.1 Mandatory role/action boundaries

Apply this matrix in the server-side policy module and in route/API/media acceptance tests. These are maximum permissions, not automatic grants; resource audience, active membership, product entitlement, assignment, consent and explicit grants can further restrict access.

| Persona / role | Public website | Employee-only content and tools | Own client organisation | Cross-client learning | Moderation | Public content/media publishing | Platform IAM/configuration |
|---|---|---|---|---|---|---|---|
| Public visitor (no login) | Read explicitly public pages/media; submit demo enquiry/event registration | Deny | Deny | Read only explicitly public approved insights, if any | Deny | Deny | Deny |
| Employee | Read public content | Read employee-audience resources; use permitted Playground/Live/experiments/teams/knowledge; submit permitted innovation work | No access by default; only explicitly assigned/shared evidence through a specific grant | Read approved shared learning allowed to employees | Deny unless separately granted moderator role | Deny unless separately granted publisher role | Deny unless separately granted admin role |
| Client member | Read public content | Deny | Read/write only permitted own-org resources according to role, record ownership/team policy and entitlements; submit and track observations; comment/report where allowed | Read approved shared feed/themes; propose contributions; never read another client's private source | Deny | Deny | Deny |
| Client administrator | Read public content | Deny | Manage invitations/members and approved client roles in own org only; may do ordinary client-member actions only if separately granted | Same approved client learning visibility as a client member | Deny | Deny | Deny; cannot grant platform roles or change other tenants |
| Learning moderator | Read public content | No implicit access to employee-private content | No unrestricted access to client workspaces or unsubmitted drafts | Review submitted proposed shared copies, redact, request clarification, reject/publish/withdraw and handle reports under moderation grant | Allow only within moderation scope; all decisions audited | Deny unless separately granted publisher role | Deny unless separately granted admin role |
| Content publisher | Read public content | No implicit access to employee-private content | Deny private client content | No implicit access to private/shared learning records beyond public content-management needs | Deny unless separately granted moderator role | Manage approved public banners/pages and permitted media audiences only | Deny |
| Product owner (assigned) | Read public content | Access only assigned work and evidence explicitly shared for that idea | No general client-workspace access | Read only approved evidence explicitly linked/shared for assigned idea | Deny unless separately granted moderator role | Deny unless separately granted publisher role | Deny |
| Portal administrator | Read public content | No implicit access solely from admin status | Manage organisations and grants, but no blanket right to inspect private client content | No blanket access to private contributions | Deny unless separately granted moderator role | Deny unless separately granted publisher role | Manage organisations, platform grants, configuration and operational controls; privileged actions audited. Private-content support access requires separate approved, scoped, time-boxed authorisation with reason and audit trail |

**Combination of roles:** A user may hold multiple approved grants/memberships, but permissions are combined only from those explicit grants and still pass all audience, tenant, entitlement and resource-level checks. Never infer one role from another. A portal administrator is not automatically a moderator or publisher; a moderator is not automatically an administrator; a client administrator cannot elevate themselves to any platform role.

### 6.2 Multi-membership

A user may belong to multiple orgs. The **active workspace** is stored server-side in the session, set via an explicit switch action that re-validates membership. Routes that need a tenant fail closed if none is active. UI always shows the active org and a switcher (only when >1 membership).

### 6.3 Authentication rules

- **Employees:** verified email ending `@azentio.com` **AND** a row in `employee_allowlist` (organiser-approved provisioning). Domain alone is insufficient.
- **Clients:** by **single-use, expiring invitation** bound to org + proposed role + intended email. Accept only when the verified account email matches. An arbitrary external email **never** auto-creates a tenant membership.
- Sessions: database sessions, short idle timeout, rotate on privilege/workspace change, revocation on membership removal takes effect on next request.
- First-time client journey (mandatory order): invitation → verify identity → review terms + learning-sharing explanation (**joining ≠ consent to share/train**) → land on correct dashboard with only entitled features.

- **Public access:** Public routes are available without signing in, but only explicitly approved public catalogue/content/media and public demo/event forms are exposed. Public visitors cannot read private workspaces, observations, employee broadcasts, moderation queues, admin pages, or write configuration.
- **Login and session lifecycle:** Provide sign-in, sign-out, expired/invalid-session handling, idle expiry, secure session cookies, session rotation after privilege or active-workspace changes, and server-side revocation after membership/role removal. Re-check session, membership, grants, tenant and entitlement on every protected request; stale UI state never preserves access. Do not treat an email address or a successful login alone as authorisation.
- **Invitation lifecycle:** Tokens are cryptographically random, stored hashed, single-use, expiring, bound to intended verified email + organisation + proposed client role, and invalidated after acceptance, expiry or revocation. Reject expired, reused, mismatched-email and cross-tenant invitations. Invitation acceptance cannot grant platform-level roles.
- **Provisioning and role changes:** Role grants, revocations, membership changes, entitlement changes and support authorisations are server-side, audited, and take effect on the next protected request. Client administrators can administer only their own organisation's approved client roles. Only explicitly authorised platform administrators can manage platform grants.
- **Passwordless provider:** For the hackathon, use the configured managed email-code/magic-link flow with rate limiting and expiry. Production Entra ID/OIDC is the preferred employee identity integration. Do not invent or claim a production identity integration that is not configured.

## 7. Authorisation architecture (the heart of the system)

### 7.1 Single policy module

All access decisions go through one module: `src/server/policy/authorize.ts`.

```ts
authorize(actor: Actor, action: Action, resource: ResourceRef): Decision // {allow: boolean, reason: string}
```

- `Actor` = `{ userId, platformGrants[], memberships[], activeTenantId | null, isVerifiedEmployee }`, built **server-side** from the session + DB, never from the request body.
- Every decision is **deny unless an explicit rule allows**.
- Rules are pure functions → unit-testable and covered by the **access matrix test** (§17).

### 7.2 Data Access Layer (DAL)

- UI components, route handlers and server actions **never** import `db` directly. They call DAL functions in `src/server/dal/*`.
- Each DAL function takes `actor`, calls `authorize`, and applies tenant/audience scoping **in the query** (not after fetch).
- Cross-tenant shared reads go through a **dedicated shared read model** (`published_observations`, `theme_*` views) that structurally lacks tenant IDs, author IDs, attachments and reviewer notes.
- ESLint rule (`no-restricted-imports`) bans `@/db` outside `src/server/**`.

### 7.3 Middleware

`middleware.ts` is **UX only** (redirect unauthenticated users to sign-in). It is **never** a security boundary. Every Route Handler, Server Action and media route re-authorises.

### 7.4 Resource audience model

Every protected resource carries explicit audience metadata:

```
audience: 'public' | 'employee' | 'tenant' | 'tenant_team' | 'entitled' | 'shared_learning' | 'author_only'
```

`public` must be set explicitly. A null/unknown audience resolves to **deny**. Comments and attachments **inherit** the parent's audience and are subject to moderation/reporting.

### 7.5 Media & direct URLs

All media (video, attachments, recordings) is served through an authorised Route Handler that calls `authorize` per request. No public blob/CDN URLs for non-public audiences. Direct API/media requests must be denied the same as UI requests.

## 8. Data model (logical)

Names are canonical; Drizzle schema must match.

**Identity & tenancy:** `users`, `accounts`, `sessions`, `organisations`, `memberships(user_id, org_id, role, status)`, `invitations(token_hash, org_id, email, role, expires_at, used_at, invited_by)`, `employee_allowlist`, `platform_grants(user_id, grant, granted_by, expires_at)`, `support_authorisations(id, granted_to, org_id, scope, reason, expires_at, approved_by)`.

**Catalogue & entitlement:** `offerings`, `org_entitlements(org_id, offering_id, status, granted_by)`.

**Learning (private side):** `contributions` (private source: id, org_id, author_id, current_state, visibility_choice, created_at), `contribution_revisions` (versioned fields: type, title, body, offering_id, industry, region, observation_period, evidence_type, confidence, links[]), `consents` (contribution_id, kind, granted, granted_by, at, policy_version), `sensitivity_flags`, `moderation_events`, `reports`.

**Learning (shared side):** `published_observations` (id, source_contribution_ref **internal only**, version, de-identified title/body, offering_id, industry_band, region_band, period_band, evidence_type, confidence, attribution_opt_in, attribution_label, status `live|unpublished|withdrawn`, published_at, search_vector) — **no tenant_id, no author_id** exposed via any shared DAL function; `observation_org_link` (private join used only for distinct-org counting, never returned).

**Insights:** `themes`, `theme_evidence(theme_id, published_observation_id)`, `improvement_ideas`, `idea_evidence_links`, `idea_status_history`, `idea_assignments`.

**Platform:** `notifications` (outbox pattern: id, user_id, kind, payload, state, created_at, delivered_channel_state), `audit_events` (append-only), `content_items` (banners/pages, audience), `media_items` (videos/recordings, audience), `sessions_live` (broadcasts, audience), `playground_scenarios`, `playground_runs` (tenant/user scoped), `saved_searches`, `bookmarks`, `comments`, `hackathon_registrations`, `demo_enquiries`, `experiments`, `release_notes`, `knowledge_items(owner, review_date)`.

All tenant-owned tables carry `org_id` + indexes; every tenant query includes it.

## 9. Contribution lifecycle (state machine)

```
Draft ──submit──▶ Submitted ──claim──▶ In_Review
In_Review ──request_clarification──▶ Returned ──amend+resubmit──▶ Submitted
In_Review ──reject──▶ Rejected (terminal; author notified with reason)
In_Review ──publish──▶ Published
Published ──report (moderator action)──▶ Unpublished_Under_Review
Unpublished_Under_Review ──reinstate──▶ Published | ──withdraw/reject──▶ Withdrawn
Published ──author_withdraw──▶ Withdrawn (terminal)
Published ──material_edit──▶ new version enters Submitted (old stays Published until new is approved; never silently widens audience)
Draft ──delete──▶ (hard delete allowed, author only)
```

Rules:
- Only transitions above are valid; enforced in one function `transition(contribution, event, actor)`; invalid → 409.
- Every transition writes an `audit_events` row **and** a notification row for the author (in-app).
- **Withdraw** executes in one DB transaction: set shared row `withdrawn`, delete `search_vector`, remove from `theme_evidence`, recompute theme counts, bump cache tags, purge AIRA retrieval eligibility. UI shows "Removed from search" confirmation with timestamp.
- Published content is **immutable per version**; edits create versions.
- Reports: any entitled reader can report without revealing another client's identity. Moderator may temporarily unpublish pending decision; decision + reason recorded; contributor informed.

## 10. Sharing & consent model

### 10.1 Visibility choices (per contribution)

`private_to_author` → `within_organisation` → `propose_to_learning_community`. Default **private**. Broadening requires explicit author action; community sharing additionally requires moderation. Organisation-only content never becomes shared by default.

### 10.2 Four separate consents (recorded individually, with policy version & timestamp)

| Key | Meaning |
|---|---|
| `consent_process` | Store/process the contribution |
| `consent_publish` | Publish its reviewed shared representation |
| `consent_attribution` | Disclose author/org attribution (opt-in; must also pass review) |
| `consent_training` | Any future training / federated-learning programme (**default off; not collected as a side-effect of anything else**) |

UI shows the contributor, per version: who can see it and how it may be used. Withdrawal control is always reachable.

### 10.3 Cross-client publication rules

- Shared payloads never contain: tenant IDs, author profile, original attachments, internal reviewer notes, source revision IDs.
- De-identified wording by default; attribution opt-in only.
- Reduce specificity of geography/dates/unusual details; removing a name ≠ anonymous.
- No pricing, customer-level financials, secrets, contract terms.
- Private raw records never enter shared analytics, vector indexes, logs or AI provider payloads.
- Sensitivity scanner (regex/heuristic: emails, long digit runs, IBAN-like, keywords like password/secret/account no.) **flags for review only**; UI copy states it is not a privacy guarantee.

### 10.4 Aggregation safeguards

- `MIN_DISTINCT_ORGS` config, **default 3** (judging uses ≥ 3 synthetic orgs). Production value requires approval.
- Theme stats/counts shown only when distinct orgs ≥ threshold; otherwise "insufficient evidence — hidden".
- Count **distinct organisations**, never post volume. Repeat posts from one org are one voice.
- Suppress small cohorts, sensitive breakdowns, and differencing-friendly filters (e.g., refuse filter combinations whose result differs from a neighbour by < threshold). Counts, suggestions, search facets and exports all use the **same** visibility function as records.
- Themes preserve evidence links + uncertainty/limitations text. Popularity ≠ prevalence ≠ causation (UI note).

## 11. Insights & improvement loop

- Approved feed: searchable, filters = offering, industry, region, observation period, topic.
- Theme dashboard: theme, offerings, supporting approved contributions, observation period, distinct org count (when safe), confidence/limitations, last update.
- Improvement idea fields: title, problem statement, offering, supporting contribution refs, proposed outcome, owner/team, priority, status, last_update.
- Statuses: `Proposed → Under review → Planned → In progress → Released | Not proceeding`. Every change audited in `idea_status_history`.
- Client-visible status is a **separate projection**: theme + decision + plain-language status + owner/team + last update. It never exposes private tickets, internal prioritisation, unapproved delivery commitments. "Under review" is never rendered as a promise.
- Product-owner evidence access = only items explicitly shared for that idea.
- No product model changes automatically from any of this.
- **AI-assisted synthesis:** AIRA may summarise only approved/public/shared/entitled evidence. Responses and generated themes must cite or link the approved contribution evidence used, preserve uncertainty/limitations, and never retrieve private drafts, employee-only content, reviewer notes, or another tenant's records.
- Enhancement backlog from the brief: semantic clustering, duplicate detection, trend-change summaries, subscription digests, and assisted prioritisation. Generated output must preserve evidence links and uncertainty; popularity is not market prevalence or proof of causation.
- Contribution quality feedback includes “useful” / “needs evidence”, transparent moderation reasons, and reviewer-assessed evidence quality. Do not use leaderboards that pressure clients to disclose sensitive information or reward volume over quality.

## 12. Optional P2 — federated model-learning track

This is optional in the brief and separate from the required collective-learning hub. If the team selects P2, the implementation/demo must address every item below; do not claim simulated controls are production-grade guarantees.

- Use at least **three separately isolated synthetic client datasets**; document the learning task, model, feature schema, and compatibility assumptions.
- Demonstrate local training in each client environment, at least one aggregation round, and global evaluation on a separate synthetic holdout. Report participation, weighting method, and metrics against a simple baseline.
- Log programme consent, participants, model/update versions, aggregation method, and evaluation outcomes. Never send training examples to coordinator logs or payloads.
- Validate client updates; demonstrate a failed/dropout participant; explain how skewed client distributions affect results.
- Register the aggregate model as a candidate. Require human review and an explicit deployment decision; document rollback.
- Document threats: updates may leak information and malicious clients may poison training. Local raw-data retention alone does not guarantee confidentiality, anonymity, or compliance.
- Describe or implement authenticated participants, minimum cohort participation, secure aggregation where applicable, bounded/clipped updates, poisoning checks, and a differential-privacy design with declared accounting if used. Label simulated controls honestly. Plain averaging must not be called secure aggregation or a formal privacy guarantee.
- Define withdrawal and model-lineage policy. Withdrawal stops future participation/update use according to the policy; treatment of already aggregated/deployed models must be explicit. Never promise automatic untraining.

## 13. Employee portal (summary)

Dashboard; guided Playground (synthetic scenarios: pick offering → inspect inputs → deterministic or AI-assisted run → review evidence → structured feedback; clearly labelled "sample data / simulated output / not a credit or business decision"); internal Live + recordings restricted to employee audience; publishers configure sessions, ordinary employees cannot; experiments submissions; hackathon team spaces; release notes; knowledge library (owner, review date, feedback loop). **Employee-only content never enters public/client search or AIRA.**

## 14. Client portal (summary)

Dashboard (active org, entitled offerings, approved demos, sessions, contribution status, visible improvement ideas; empty states, never another tenant's sample data); entitled sandboxes with tenant-isolated runs; My observations / Our organisation's observations (visually **and** technically distinct from the shared cross-client feed); draft/submit/amend/withdraw; browse/search shared feed + themes; client-admin invitations & roles (cannot escalate to employee/moderator/publisher/portal-admin); saved searches, bookmarks, notifications, comments (inherit audience and subject to moderation/reporting), contribution acknowledgements, support-ticket link-out, and client-specific resources. Include client briefings, client-facing release notes, and invitation-only webinars/sessions where assigned; show clear empty states when none are available.

## 15. Notifications

- P0: persisted in-app notifications. Table is the outbox.
- P1: email via Resend worker, **idempotent** (idempotency key per notification+channel). UI states: `stored` → `queued` → `sent` → `delivered` only when provider confirms. Never label queued/stored as delivered.

## 16. Routes & API surface (canonical)

**Public:** `/`, `/offerings`, `/offerings/[slug]`, `/solutions`, `/media`, `/insights` (approved public insights only), `/about`, `/demo-request`, `/events/hackathon`.
**Auth:** `/sign-in`, `/invite/[token]`, `/onboarding/terms`.
**Employee:** `/employee`, `/employee/playground`, `/employee/live`, `/employee/experiments`, `/employee/teams`, `/employee/knowledge`, `/employee/releases`, `/employee/ideas`, `/employee/learning`.
**Client:** `/client`, `/client/demos`, `/client/observations` (mine/org), `/client/observations/new`, `/client/shared` (cross-client feed), `/client/themes`, `/client/ideas`, `/client/admin/members`, `/client/saved`, `/client/resources`.
**Moderation:** `/moderation/queue`, `/moderation/[id]`, `/moderation/reports`.
**Publisher:** `/publisher/content`, `/publisher/media`.
**Admin:** `/admin/orgs`, `/admin/grants`, `/admin/audit`, `/admin/config`, `/admin/support-access`.
**API:** `/api/*` Route Handlers each call `authorize`. `/api/media/[id]` authorised proxy. `/api/aira` retrieval-restricted.

Every route above is listed in the access matrix test; adding a route without a matrix row fails CI.

## 17. Testing — acceptance gates

1. **Policy unit tests:** table-driven `authorize` tests for every role × action × resource audience.
2. **Access matrix e2e (Playwright, API-level):** for each persona and each route/API/media URL, assert allow/deny **including direct URL and direct API calls with another tenant's IDs**.
3. **Tenant isolation test:** Org A user cannot read/write Org B records by ID guessing, query params, or search.
4. **Withdrawal test:** publish → appears in search, theme count, AIRA retrieval → withdraw → absent from all within **60 s** (assert immediately and at +60 s). Cache check included.
5. **Aggregation test:** 2 orgs → theme stat hidden; 3 orgs → shown; 5 posts from 1 org → counts as 1.
6. **Privacy payload test:** shared API JSON schema contains none of `tenant_id`, `author*`, `attachments`, `reviewer_notes`.
7. **State machine tests:** every invalid transition rejected.
8. **Consent tests:** Save never shares; training consent independent and default off.
9. **Escalation test:** client_admin cannot grant employee/moderator/publisher/portal_admin; cannot act on another tenant.
10. **Notification honesty test:** UI never shows "delivered" for stored/queued.
11. **Moderator boundary:** moderator cannot read an unsubmitted draft.
12. **Employee boundary:** employee-only content absent from client/public search and AIRA.

A phase is **not done** until its listed gates pass in CI on a Vercel preview.

## 18. Security baseline

HTTPS only; secure/httpOnly/sameSite cookies; CSRF protection on mutations; Zod on every input (client **and** server); length limits; output encoding; CSP headers; rate limits on auth/submit/report/search; single-use hashed invitation tokens; audit log append-only; secrets only in Vercel env vars; no secrets/PII in logs; AI provider payloads built only from approved shared content; dependency audit in CI.

## 19. Seed data (synthetic)

- 3+ client orgs: **Alder Finance**, **Birchway Bank**, **Cedar Microlending** (+ optional 4th with zero entitlements to test empty states).
- Users per persona incl. one multi-membership user and one user with `@gmail.com` and no invitation (must fail to join).
- Offerings catalogue: create an original, hackathon-appropriate catalogue based on the approved challenge scope and synthetic content. Include **Financial Analysis Intelligence**. Do not copy or derive the catalogue, layout, media, or content from the reference prototype.
- Scenario fixtures: three orgs submit seasonal-SME-cash-flow observations → clarification → published → theme "Seasonality context" (small-sample warning) → idea "Seasonality-aware comparison explanation" status **Under review**.
- Everything flagged `synthetic=true`; UI banner on sandbox/demo views.

## 20. Antigravity development protocol

- All implementation is done by Antigravity agents working from this file and `PHASES.md`.
- Repo root contains **`AGENTS.md`** (short: "read `SOURCE_OF_TRUTH.md` first; follow `PHASES.md`; one phase at a time; never bypass `authorize`/DAL; run gates before declaring done"). Mirror it into Antigravity's rules location (e.g. `.agent/rules/`) — verify the current path in Antigravity docs.
- Workflow per phase: (1) agent produces an **implementation plan artifact** for the phase; (2) human reviews against this file; (3) agent implements on a branch; (4) agent runs the phase gates and attaches evidence (test output, browser walkthrough recording/screenshots); (5) PR → Vercel preview → human sign-off → merge.
- Use separate agents for **build** and **adversarial review** (reviewer agent's only job: try to break access control/privacy using the §17 matrix).
- Agents must not widen scope, add unlisted libraries, or "temporarily" disable checks. If blocked → write the question into `OPEN_QUESTIONS.md`.
- Commit convention: `phase-N: <what>`; every PR description links the §17 gates it satisfies.

## 21. Definition of Done (global)

Feature works on Vercel preview · server-side authz present and tested · Zod on client+server · audit/notification side-effects written · empty/error states · synthetic labels where relevant · gates for the phase pass in CI · no TODO that weakens security · docs/Decision Log updated.

## 22. Decision Log

| # | Date | Decision | Reason |
|---|---|---|---|
| 1 | 2026-10-30 | Next.js + Vercel + Neon Postgres + Drizzle + Auth.js | Fast deploy, single-transaction withdrawal via Postgres FTS |
| 2 | 2026-10-30 | Email-code/magic link auth + `employee_allowlist` | Org Entra registration unavailable; brief allows organiser-approved provisioning |
| 3 | 2026-10-30 | P0 attachments = links only | Brief allows omission; avoids private blob risk |
| 4 | 2026-10-30 | Search = Postgres FTS on shared read model only | Guarantees withdrawal ≤ 60 s and no private data in index |
| 5 | 2026-10-30 | Federated track (P2) is optional and separate | Brief §12; not required for core |
| 6 | 2026-10-30 | Build an original product experience; do not use the reference prototype | Team will create its own concept, visual identity, information architecture, catalogue presentation, and media; the prototype is not a design or content dependency |

## 23. Requirements traceability checklist

Use this checklist against `azentio.ai-Hackathon-Requirements.docx`. A requirement is **not complete** merely because it appears here: implementation and evidence must pass the acceptance gates in §17. Track each item as `Not started / In progress / Verified / Deferred by allowed scope` during the build.

**Coverage rule:** The original brief's public visitor, employee, client member, client administrator, learning moderator, content publisher and portal administrator boundaries are all mandatory. `product_owner` is an additional least-privilege assignment role to support the brief's improvement loop. The role/action matrix in §6.1.1, authentication rules in §6.3, route list in §16 and acceptance gates in §17 must stay consistent. If any route, action, data type or persona is added, update the matrix and tests before implementation.

| Brief requirement | Source-of-truth coverage | Validation evidence |
|---|---|---|
| Public catalogue, offering details/media, demo enquiry, hackathon interest registration | §§5, 6, 16, 19 | Public journey + route tests |
| Employee-only dashboard, Playground, Live/recordings, experiments, hackathon spaces, releases, knowledge library, assigned ideas | §§6, 13, 16 | Employee walkthrough + access matrix |
| Client workspace, entitlements, demos/sessions, observations, organisation administration and resources | §§6, 14, 16 | Client walkthrough + tenant-isolation tests |
| Server-side RBAC, tenant membership, audience, entitlement, least privilege, multi-membership | §§6–8, 17–18 | Policy and direct API/media denial tests |
| Invitations, verified identity, onboarding terms, membership revocation/session lifecycle | §§6–7, 17 | Authentication/onboarding tests |
| Private drafts, submit/amend/withdraw, moderation, redaction, reports, versioning and audit events | §§9–10, 15, 17 | State-machine, report and withdrawal tests |
| Separate process/publish/attribution/training consents; sharing choices and consent history | §10; retention policy tracked in §24 | Consent tests and retention-policy document |
| De-identification, sensitive-data review, private payload boundaries, aggregation thresholds and suppression | §§10, 17–18 | Privacy payload and aggregation tests |
| Approved shared feed, filters, themes, evidence links, confidence/limitations, distinct-org counts | §§4, 11, 14 | Three-organisation scenario + search tests |
| Improvement ideas, owner/team, status, audit trail and audience-appropriate updates | §§11, 13–14 | End-to-end scenario + status-history tests |
| AIRA/insight synthesis cites approved evidence and never retrieves disallowed content | §§4, 5, 11, 16–18 | Retrieval/citation and isolation tests |
| Saved searches, bookmarks, notifications, comments, acknowledgements, support link-out, client resources, briefings/release notes/webinars | §14 | Feature checklist and audience tests |
| Semantic clustering, duplicate detection, trend-change summaries, digests, assisted prioritisation and quality feedback | §11 | Evidence-linked output tests; otherwise explicitly tracked as deferred enhancement |
| Honest notification states; P0 in-app and P1 provider-backed email | §15 | Notification state/idempotency tests |
| Synthetic data; no real credit/reporting/document-processing product or real PII | §§3, 5, 13, 19 | Seed-data review and UI labels |
| Optional P2 genuine federated learning and all safety/lineage requirements | §12 | P2 evidence checklist; if not selected, record as explicitly not implemented |
| Security, CI, phase gates, implementation plan, adversarial review and Definition of Done | §§17–21 | CI logs, preview walkthrough, reviewer evidence and sign-off |

## 24. Open questions

- Define the original offerings catalogue and create/source approved media assets for the team's own design. Do not use the reference prototype as a source.
- Production `MIN_DISTINCT_ORGS` and suppression policy: needs sign-off before any real launch.
- Retention policy for consent history / moderation decisions: document in `docs/retention.md` (draft in Phase 5).
- Production withdrawal propagation SLA statement: draft in Phase 5 (hackathon target ≤ 60 s).