# Azentio AI — Project Pages by Role

> [!NOTE]
> Authorization is deny-by-default via `authorize()`. Middleware only handles unauthenticated redirects — it is never a security boundary. Platform grants (e.g., `portal_admin`, `content_publisher`) are additive on top of a base role.

---

## Roles Overview

| Role | Base | How Granted |
|------|------|-------------|
| **Public / Unauthenticated** | — | No session |
| **Authenticated (pre-workspace)** | — | Valid session, no active org |
| **Client Member** | `client_member` | Org invitation only |
| **Client Admin** | `client_admin` | Promoted within org |
| **Azentio Employee** | Employee | `@azentio.com` email verified |
| **Content Publisher** | Employee | `content_publisher` platform grant |
| **Learning Moderator** | Employee | `learning_moderator` platform grant |
| **Portal Administrator** | Employee | `portal_admin` platform grant |

---

## 1. Public / Unauthenticated Visitor

### Marketing & Public Pages

| Route | Description |
|-------|-------------|
| `/` | Home page — hero banner, product highlights, testimonials, and CTA sections |
| `/about` | Company overview, mission statement, and values |
| `/careers` | Open job positions with application links |
| `/contact` | Contact form for general enquiries |
| `/contact-us` | Alternate contact route (same form, different URL for campaigns) |
| `/demo-request` | Book a product demo — enquiry form sent to sales |
| `/request-demo` | Alternate demo request route (campaign landing) |
| `/our-leadership` | Leadership team profiles and bios |
| `/our-presence` | Global office locations and regional presence map |
| `/solutions` | Industry-specific solutions overview |
| `/products` | All product domains catalogue |
| `/products/[domainSlug]` | Products listed under a specific domain |
| `/[domainSlug]/[productSlug]` | Individual product detail page with features and pricing |
| `/offerings` | Service offerings catalogue |
| `/offerings/[slug]` | Specific offering detail with scope and contact CTA |
| `/insights` | Insights hub landing — blogs, case studies, events |
| `/insights/blogs` | All published blog articles |
| `/insights/case-studies` | All published case studies |
| `/insights/events` | Upcoming events listing |
| `/insights/hackathons` | Hackathon programme listings |
| `/events/hackathon` | Hackathon detail and registration form |
| `/signin` | Sign-in / magic-link login page |
| `/sign-in` | Alternate sign-in route |
| `/invite/[token]` | Accept an organisation invitation (validates token, prompts sign-in) |

---

## 2. Any Authenticated User (Pre-Workspace)

Pages accessible after sign-in but before (or independent of) an active workspace.

| Route | Description |
|-------|-------------|
| `/choose-workspace` | Select or switch active organisation workspace; redirect target when no workspace is active |
| `/onboarding/terms` | Accept Terms & Conditions during first-time onboarding |
| `/account` | Personal profile, display name, avatar, password/passkey, connected sessions |
| `/notifications` | Personal notification inbox showing all unread and historical in-app notifications |

---

## 3. Client Member

> Clients join **only by invitation**. Active workspace is server-side only; never from URL or client storage.

### Client Portal — `/client/**`

| Route | Description |
|-------|-------------|
| `/client` | Client dashboard — activity summary, recent demos, observation status, shared feed highlights |
| `/client/demos` | Browse available product demo scenarios entitled to the org |
| `/client/demos/[id]` | View a specific demo scenario, launch a sandbox run |
| `/client/demos/runs` | History of all sandbox demo runs for the active org |
| `/client/observations` | List and manage private observations/contributions submitted by the member |
| `/client/observations/new` | Submit a new observation (field notes, pain points, use-case ideas) |
| `/client/observations/[id]` | View observation detail, status in contribution state machine, and feedback |
| `/client/shared` | De-identified cross-tenant shared learning feed (published observations only) |
| `/client/themes` | Browse AI model customisation themes available to the org |
| `/client/themes/[id]` | View theme detail and activate it for the org's demo sessions |
| `/client/ideas` | Submit and upvote product improvement ideas |
| `/client/resources` | Compliance packs, whitepapers, and certification documents entitled to the org |
| `/client/saved` | Bookmarked/saved observations, resources, and shared learning items |
| `/client/search` | Global search across permitted client content (no cross-tenant leakage) |

---

## 4. Client Admin

> Inherits **all Client Member pages** above, plus the organisation administration section below.

### Client Admin Console — `/client/admin/**`

| Route | Description |
|-------|-------------|
| `/client/admin` | Client admin overview — member count, pending invitations, org health summary |
| `/client/admin/members` | Manage org members: invite by email, promote/demote roles, revoke memberships |
| `/client/admin/observations` | Org-level oversight of all observations submitted by any member of the org |

---

## 5. Azentio Employee

> Requires a verified `@azentio.com` session. Employees cannot access client-only pages.

### Employee Portal — `/employee/**`

| Route | Description |
|-------|-------------|
| `/employee` | Employee dashboard — recent playground runs, experiment status, knowledge updates |
| `/employee/playground` | Interactive AI model prompt testing workspace |
| `/employee/playground/[runId]` | View result detail for a specific playground run |
| `/employee/playground/runs` | Full history of all playground runs |
| `/employee/experiments` | Browse and manage ML/AI experiments |
| `/employee/experiments/new` | Create a new experiment with parameters and dataset config |
| `/employee/experiments/[id]` | View experiment detail, metrics, runs, and comparisons |
| `/employee/live` | Live demo facilitation queue — active client sessions |
| `/employee/live/[id]` | Conduct a specific live demo session with a client |
| `/employee/knowledge` | Internal knowledge base — articles, runbooks, and guides |
| `/employee/knowledge/new` | Author a new knowledge base article |
| `/employee/knowledge/[id]` | View and edit a specific knowledge article |
| `/employee/releases` | Product release notes and changelogs |
| `/employee/releases/[id]` | View a specific release detail with feature breakdown |
| `/employee/learning` | Cross-tenant de-identified shared learning observations (read/moderation view) |
| `/employee/teams` | Engineering and product teams directory |
| `/employee/teams/[id]` | View a specific team's members, ownership areas, and contacts |
| `/employee/search` | Internal enterprise search across knowledge, experiments, and releases |
| `/employee/ideas` | Internal idea board for product improvements and suggestions |

---

## 6. Content Publisher

> **Employee** holding the `content_publisher` platform grant. Sidebar link shown only when the server confirms the grant.

| Route | Description |
|-------|-------------|
| `/publisher/content` | Manage all publishable content — draft, review, publish, and unpublish articles, case studies, and testimonials |

> [!IMPORTANT]
> Testimonials require recorded **consent evidence** before publishing. Self-granting `content_publisher` requires a second portal admin to approve (dual control).

---

## 7. Learning Moderator

> **Employee** holding the `learning_moderator` platform grant.

| Route | Description |
|-------|-------------|
| `/moderation/queue` | Review submitted cross-tenant observations: claim, request clarification, approve/publish, reject, or withdraw from the shared feed |

---

## 8. Portal Administrator

> **Employee** holding the `portal_admin` platform grant. All sensitive actions require step-up authentication (email code within 10 min). Dual control required for high-risk operations.

### Admin Console — `/admin/**`

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard — platform-wide counts, pending approvals, recent audit events |
| `/admin/orgs` | List all organisations with status, entitlement tier, and member count |
| `/admin/orgs/new` | Create a new client organisation on the platform |
| `/admin/orgs/[id]` | View/edit org details, suspend, archive, or manage entitlements |
| `/admin/users` | Platform-wide user directory with role and grant summary |
| `/admin/users/[id]` | View user detail, manage grants, suspend, anonymise (soft) |
| `/admin/grants` | Issue, revoke, and review platform grants (`portal_admin`, `content_publisher`, `learning_moderator`) |
| `/admin/entitlement-requests` | Review and approve/reject org entitlement upgrade requests |
| `/admin/offerings` | Manage platform offerings — create, update, retire |
| `/admin/content` | Content publishing hub — overview of all content item statuses |
| `/admin/content/blogs` | List all blog posts with draft/published/archived status |
| `/admin/content/blogs/new` | Author a new blog post (rich text editor) |
| `/admin/content/blogs/[id]` | Edit a specific blog post and manage its publish lifecycle |
| `/admin/content/case-studies` | List all case studies |
| `/admin/content/case-studies/new` | Create a new case study with client org association |
| `/admin/content/case-studies/[id]` | Edit and manage publish lifecycle for a specific case study |
| `/admin/content/testimonials` | Manage customer testimonials with consent evidence tracking |
| `/admin/content/banners` | Manage promotional banners displayed on the public site |
| `/admin/content/faqs` | Manage FAQ entries for public and portal pages |
| `/admin/content/media` | Media library — upload, tag, and manage images/files (Vercel Blob) |
| `/admin/notifications` | Compose and send in-app notifications; broadcast to orgs or all clients (dual-control for all-clients) |
| `/admin/approvals` | Dual-control approval queue — pending self-grants, role changes, org archival, audit exports |
| `/admin/audit` | Paginated audit event log with filters by actor, action, org, and date range |
| `/admin/audit/[id]` | View full detail of a specific audit event |
| `/admin/support-access` | Review support authorisation requests — scoped, reason-required, time-boxed, read-only |
| `/admin/support-access/[id]` | Approve or reject a specific support access request and view its audit trail |
| `/admin/config` | Platform configuration — feature flags, email provider settings, retention policies |
| `/admin/enquiries` | View and manage demo enquiries and hackathon registrations submitted via public forms |
| `/admin/ops` | Operations panel — seed reset (non-prod only, dual-control), health checks, job queue status |
| `/admin/account` | Admin's own account settings within the admin context |

---

## Access Matrix Summary

| Page Group | Public | Auth (no WS) | Client Member | Client Admin | Employee | Publisher | Moderator | Portal Admin |
|------------|:------:|:------------:|:-------------:|:------------:|:--------:|:---------:|:---------:|:------------:|
| `/` Marketing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/signin`, `/invite` | ✅ | ✅ | — | — | — | — | — | — |
| `/choose-workspace`, `/account`, `/notifications` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/client/**` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/client/admin/**` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/employee/**` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/publisher/content` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅¹ |
| `/moderation/queue` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/admin/**` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

> ¹ Portal admin can access `/admin/content/**` directly; `/publisher/content` requires the `content_publisher` grant explicitly.

---

*Last updated: Oct 2026 — 97 page routes across 8 roles*
