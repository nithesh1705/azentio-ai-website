# CREDENTIALS.md — azentio.ai Portal Role Credentials & Personas

> **Authentication Model:** In accordance with §6.3 of `SOURCE_OF_TRUTH.md`, azentio.ai employs passwordless managed magic-link / verified session authentication. No plaintext passwords are used. 
> 
> You can sign in using any of the verified email identities below on the [`/sign-in`](http://localhost:3000/sign-in) page or instantly toggle between personas using the **Interactive Persona Switcher** dropdown in the top bar of the application.

---

## 1. Persona & Role Credentials Matrix

| Role / Persona | Representative Identity | Verified Work Email | Scope & Active Tenant | Platform Grants | Key Capabilities & Boundaries |
|---|---|---|---|---|---|
| **Public Visitor** | *Anonymous Guest* | *(None required)* | Public / No Tenant | *None* | Read public catalogue, solutions, approved public insights, request a demo, register for hackathons. Strictly denied from private workspaces and employee portals. |
| **Employee** | **Nithesh M** | `nithesh_m@azentio.com` | Internal Platform (`@azentio.com`) | *None* (Base employee) | Access internal dashboard, guided scenario playground, live internal broadcasts, knowledge library, and experiment submissions. No automatic access to client-private data. |
| **Client Member** | **Virat Kohli** | `virat_kohli@abcd.in` | **ABCD Technologies** (`org-abcd` / `abcd.in`) | *None* (Tenant member) | Access `abcd.in` workspace, entitled AI sandboxes, draft/submit/withdraw market observations, view collective learning feed and themes. Cannot view other tenants' private data. |
| **Client Administrator** | **MS Dhoni** | `dhoni.ms@xyz.com` | **XYZ Global** (`org-xyz` / `xyz.com`) | *None* (Tenant admin) | Manage `xyz.com` workspace members, generate single-use expiring invitation tokens for colleagues. Cannot touch other tenants or escalate to platform roles. |
| **Multi-Org Member** | **Hardik Pandya** | `hardik.pandya@xyz.com` | Multi-Tenant: **XYZ Global** (`xyz.com`) & **ABCD Technologies** (`abcd.in`) | *None* (Tenant member) | Tests multi-tenant membership. Can switch active workspace between `xyz.com` and `abcd.in` via header dropdown. Actions are strictly bound to the active tenant. |
| **Learning Moderator** | **Pranika K** | `pranika_k@azentio.com` | Azentio Platform | `learning_moderator` | Access moderation triage queue (`/moderation/queue`), claim submissions, redact & de-identify text, request author clarification, publish to shared feed, reject, and investigate reports. **Zero access to unsubmitted private drafts.** |
| **Content Publisher** | **Nishanth E** | `nishanth_e@azentio.com` | Azentio Platform | `content_publisher` | Access content publishing console (`/publisher/content`), manage global homepage banners, and configure public media audiences. No access to private learning records or IAM. |
| **Product Owner** | **Lewis Hamilton** | `lewis_hamilton@azentio.com` | Azentio Platform | `product_owner` | Access product improvement console (`/employee/ideas`), connect collective learning themes into engineering ideas, update audited statuses (`Proposed` → `Under review` → `Planned` → `In progress` → `Released`). |
| **Portal Administrator** | **Max Verstappen** | `max_verstappen@azentio.com` | Azentio Platform | `portal_admin`, `learning_moderator`, `content_publisher`, `product_owner` | Manage tenant organisations, provision product entitlements, grant platform roles, and inspect append-only security audit logs (`/admin/audit`). |

---

## 2. Configured Client Organisations

| Organisation Name | Org ID | Domain | Entitled Product Offerings | Purpose / Test Scenario |
|---|---|---|---|---|
| **ABCD Technologies** | `org-abcd` | `abcd.in` | Financial Analysis Intelligence, Core Banking Engine, AML Surveillance | Retail SME borrower observation contributor (`pub-obs-01`) — Virat Kohli's home org |
| **XYZ Global** | `org-xyz` | `xyz.com` | Financial Analysis Intelligence, Digital Lending Suite | Hospitality & agro-processing cyclical turnover contributor (`pub-obs-02`) — MS Dhoni's home org |
| **Cedar Capital** | `org-cedar` | `cedar.synthetic` | Financial Analysis Intelligence, Digital Lending Suite | Agricultural harvest-cycle flexible repayment contributor (`pub-obs-03`) — 3rd org for aggregation safeguard |
| **Delta Credit Cooperative** | `org-delta-empty` | `delta.synthetic` | *None* (0 entitlements provisioned) | Verifies clean empty-state presentation without placeholder data leakage |

---

## 3. How to Authenticate & Test

### Method A: Interactive Top-Bar Switcher (Recommended for Live Judging)
1. On any page of the web application, look at the sticky top evaluation bar.
2. Click the **Interactive Persona** dropdown menu.
3. Select any of the personas:
   - `Public Visitor`
   - `Employee (Nithesh M)`
   - `Client Member (Virat Kohli @ abcd.in)`
   - `Client Admin (MS Dhoni @ xyz.com)`
   - `Multi-Org Member (Hardik Pandya)`
   - `Moderator (Pranika K)`
   - `Publisher (Nishanth E)`
   - `Product Owner (Lewis Hamilton)`
   - `Portal Admin (Max Verstappen)`
4. The application state, role-based navigation menus, and authorization boundaries immediately update in real-time.

### Method B: Magic Link Sign-In Page
1. Navigate to [`/sign-in`](http://localhost:3000/sign-in).
2. Enter any of the verified email addresses above (e.g. `nithesh_m@azentio.com` or `virat_kohli@abcd.in`).
3. Click **Send Magic Link / Sign In** (or click any of the 1-click quick persona buttons).
4. You will be redirected to the respective role-authorized dashboard.

---

## 4. Key Portal URLs by Persona

- **Public Showcase:** `http://localhost:3000/`
- **Solution Catalogue:** `http://localhost:3000/offerings`
- **Interactive AI Sandbox:** `http://localhost:3000/offerings/financial-analysis-intelligence`
- **Client Workspace Dashboard (`abcd.in` / `xyz.com`):** `http://localhost:3000/client`
- **Client Observations (Draft / Submit / Withdraw):** `http://localhost:3000/client/observations`
- **Collective Learning Hub (De-identified Feed):** `http://localhost:3000/client/shared`
- **Safe Trend Themes (MIN_ORGS ≥ 3):** `http://localhost:3000/client/themes`
- **Client Member Invitations:** `http://localhost:3000/client/admin/members`
- **Employee Innovation Lab:** `http://localhost:3000/employee`
- **Guided Scenario Playground:** `http://localhost:3000/employee/playground`
- **Product Owner Improvement Loop:** `http://localhost:3000/employee/ideas`
- **Moderator Triage Queue:** `http://localhost:3000/moderation/queue`
- **Content Publisher Console:** `http://localhost:3000/publisher/content`
- **Portal Admin & Audit Trail:** `http://localhost:3000/admin/audit`
