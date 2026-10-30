# CREDENTIALS.md — azentio.ai Portal Role Credentials & Personas

> **Authentication Model:** In accordance with §6.3 of `SOURCE_OF_TRUTH.md`, azentio.ai employs database-enforced authentication with organization scoping, role-based access control, and password verification.
> 
> Click the **Sign In** button next to **Request Demo** in the top navigation bar to access [`/sign-in`](http://localhost:3000/sign-in). Select the target organization, enter your email and password, or use the 1-click credential auto-fill helper.

---

## 1. Persona & Role Credentials Matrix

| Role / Persona | Representative Identity | Work Email | Password | Organisation Scope | Platform Grants | Key Capabilities & Boundaries |
|---|---|---|---|---|---|---|
| **Public Visitor** | *Anonymous Guest* | *(None required)* | *(None)* | Public / No Tenant | *None* | Read public catalogue, solutions, approved public insights, request a demo, register for hackathons. Strictly denied from private workspaces and employee portals. |
| **Employee** | **Nithesh M** | `nithesh_m@azentio.com` | `emp123` | **Azentio Platform** (`azentio.com`) | *None* (Base employee) | Access internal dashboard, guided scenario playground, live internal broadcasts, knowledge library, and experiment submissions. No automatic access to client-private data. |
| **Learning Moderator** | **Pranika K** | `pranika_k@azentio.com` | `learning123` | **Azentio Platform** (`azentio.com`) | `learning_moderator` | Access moderation triage queue (`/moderation/queue`), claim submissions, redact & de-identify text, request author clarification, publish to shared feed, reject, and investigate reports. **Zero access to unsubmitted private drafts.** |
| **Content Publisher** | **Nishanth E** | `nishanth_e@azentio.com` | `content123` | **Azentio Platform** (`azentio.com`) | `content_publisher` | Access content publishing console (`/publisher/content`), manage global homepage banners, and configure public media audiences. No access to private learning records or IAM. |
| **Product Owner** | **Lewis Hamilton** | `lewis_hamilton@azentio.com` | `product123` | **Azentio Platform** (`azentio.com`) | `product_owner` | Access product improvement console (`/employee/ideas`), connect collective learning themes into engineering ideas, update audited statuses (`Proposed` → `Under review` → `Planned` → `In progress` → `Released`). |
| **Portal Administrator** | **Max Verstappen** | `max_verstappen@azentio.com` | `admin123` | **Azentio Platform** (`azentio.com`) | `portal_admin`, `learning_moderator`, `content_publisher`, `product_owner` | Dedicated Organization Management Console (`/admin/orgs`), manage `Azentio`, `ABCD`, and `XYZ` organizations, provision tenant users with strict role segregation, and inspect append-only security audit logs (`/admin/audit`). |
| **Client Member** | **Virat Kohli** | `virat_kohli@abcd.in` | `cleint123` | **ABCD Technologies** (`org-abcd` / `abcd.in`) | *None* (Tenant member) | Access `abcd.in` workspace, entitled AI sandboxes, draft/submit/withdraw market observations, view collective learning feed and themes. Cannot view other tenants' private data. |
| **Client Administrator** | **MS Dhoni** | `dhoni.ms@xyz.com` | `admin123` | **XYZ Global** (`org-xyz` / `xyz.com`) | *None* (Tenant admin) | Manage `xyz.com` workspace members, generate single-use expiring invitation tokens for colleagues. Cannot touch other tenants or escalate to platform roles. |
| **Multi-Org Member** | **Hardik Pandya** | `hardik.pandya@xyz.com` | `multiorg123` | Multi-Tenant: **XYZ Global** (`xyz.com`) & **ABCD Technologies** (`abcd.in`) | *None* (Tenant member) | Tests multi-tenant membership across `xyz.com` and `abcd.in`. Actions are strictly bound to the selected active tenant. |

---

## 2. Configured Organisations

| Organisation Name | Org ID | Domain | Type | Entitled Product Offerings | Purpose / Test Scenario |
|---|---|---|---|---|---|
| **Azentio Platform** | `org-azentio` | `azentio.com` | Platform Root | Financial Analysis Intelligence, Core Banking Engine, AML Surveillance, Digital Lending Suite | Internal workforce (`@azentio.com`) and system platform operations. |
| **ABCD Technologies** | `org-abcd` | `abcd.in` | Client Enterprise | Financial Analysis Intelligence, Core Banking Engine, AML Surveillance | Retail SME borrower observation contributor (`pub-obs-01`) — Virat Kohli's home org |
| **XYZ Global** | `org-xyz` | `xyz.com` | Client Enterprise | Financial Analysis Intelligence, Digital Lending Suite | Hospitality & agro-processing cyclical turnover contributor (`pub-obs-02`) — MS Dhoni's home org |
| **Cedar Capital** | `org-cedar` | `cedar.synthetic` | Client Enterprise | Financial Analysis Intelligence, Digital Lending Suite | Agricultural harvest-cycle flexible repayment contributor (`pub-obs-03`) — 3rd org for aggregation safeguard |

---

## 3. How to Sign In & Test

1. Click the **Sign In** button in the top navigation bar (located right next to **Request Demo**).
2. **Step 1: Select Organisation**:
   - Choose between **Azentio** (`azentio.com`), **ABCD** (`abcd.in`), or **XYZ** (`xyz.com`).
3. **Step 2: Enter Credentials**:
   - Enter your designated work email and password from the table above.
4. **1-Click Auto-Fill**:
   - Alternatively, click any account card under **Designated Role Credentials** on the right side of the sign-in screen to instantly populate the organization, email, and password.
5. Click **Sign In to Organisation**:
   - The server verifies database credentials and immediately redirects you to the authorized role console.

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
- **Portal Admin Organization & User Console:** `http://localhost:3000/admin/orgs`
- **Portal Admin Security Audit Trail:** `http://localhost:3000/admin/audit`
