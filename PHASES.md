# PHASES.md — azentio.ai Implementation Roadmap

This document outlines the phased build of the azentio.ai portal conforming strictly to `SOURCE_OF_TRUTH.md` and `azentio.ai-Hackathon-Requirements.docx`.

---

## Phase 1: Project Scaffolding & Advanced Animated Design System
- Setup Next.js App Router (TypeScript strict, Tailwind CSS, Lucide icons, Framer Motion, next-themes).
- Implement global ThemeProvider (Dark & Light theme support with buttery smooth transitions).
- Build animated UI design system: header, sidebar, command palette, interactive badges, glassmorphic cards, motion wrappers.
- Implement Dev Persona Switcher in the top bar to easily preview and test all 8 personas (`public`, `employee`, `client_member`, `client_admin`, `learning_moderator`, `content_publisher`, `product_owner`, `portal_admin`) + active tenant switching.

## Phase 2: Authorization Engine (Policy) & Data Architecture
- Implement single source of authorization: `src/server/policy/authorize.ts`.
- Implement Data Access Layer (DAL) under `src/server/dal/*` ensuring deny-by-default, tenant isolation, and audience filters.
- Define Drizzle schema for identity, organisations, memberships, offerings, entitlements, contributions, revisions, consents, published observations, themes, improvement ideas, notifications, and audit logs.
- Provide comprehensive synthetic seed data (Alder Finance, Birchway Bank, Cedar Microlending, synthetic users, offerings including Financial Analysis Intelligence).

## Phase 3: Public Showcase & Discovery Portal
- Public homepage (`/`): Animated hero, offerings preview, enterprise stats, trusted security badges.
- Offerings catalogue (`/offerings` & `/offerings/[slug]`): Detailed modules, interactive capabilities, synthetic sandbox previews.
- Solutions (`/solutions`), approved Media (`/media`), Public Insights (`/insights`), About (`/about`).
- Interactive forms: Demo Enquiry (`/demo-request`) and Hackathon Interest (`/events/hackathon`) with client & server validation.

## Phase 4: Client Portal & Contribution State Machine
- Client Dashboard (`/client`): Active org indicators, entitled offerings, quick action shortcuts, notification outbox.
- Entitled Demos (`/client/demos`): Tenant-isolated interactive simulation sandboxes with synthetic data labels.
- Contribution Management (`/client/observations` & `/client/observations/new`):
  - Draft, submit, amend, withdraw lifecycle.
  - Granular 4-part consents (Process, Publish, Attribution, Training).
  - Client-side & server-side sensitivity scanner.
  - Direct synchronous withdrawal (≤ 60s hard requirement) purging from search, themes, and AIRA.
- Client Admin (`/client/admin/members`): Single-use invitation generation, member list, role assignment (isolated to own org).

## Phase 5: Collective Learning Hub, Safe Themes & AIRA Synthesis
- Shared Feed (`/client/shared`): Cross-client learning with strict de-identification (no author/org/tenant leaked).
- Search & Filters: Offering, industry, region, period, keyword search.
- Themes Dashboard (`/client/themes`):
  - Distinct-org counting safeguard (`MIN_DISTINCT_ORGS >= 3`).
  - Small cohort suppression and limitation warnings.
  - Citing supporting approved observations.
- AIRA AI Assistant (`/api/aira` + chat widget):
  - Retrieval-augmented synthesis citing only approved shared evidence.
  - Deterministic fallback when API key is unconfigured.
  - Strict boundary enforcement: zero leakage of private drafts or internal employee notes.

## Phase 6: Employee Portal & Improvement Loop
- Employee Dashboard (`/employee`): Internal tools, live broadcasts, recent innovation items.
- Guided Playground (`/employee/playground`): Synthetic scenarios, input inspection, AI run, evidence review, feedback recording.
- Internal Live & Recordings (`/employee/live`): Restrict to employee audience.
- Knowledge Library (`/employee/knowledge`), Experiments (`/employee/experiments`), Hackathon Spaces (`/employee/teams`), Releases (`/employee/releases`).
- Improvement Loop (`/employee/ideas`): Product Owner connects themes into improvement ideas with status history (`Proposed` -> `Under review` -> `Planned` -> `In progress` -> `Released` / `Not proceeding`).
- Client-visible projection of ideas (`/client/ideas`).

## Phase 7: Moderation, Content Publishing & Platform Administration
- Moderation Queue (`/moderation/queue`, `/moderation/[id]`): Claim, review, redact, request clarification, publish, reject, handle reports (`/moderation/reports`).
- Content Publisher Portal (`/publisher/content`, `/publisher/media`): Manage public banners and media audiences.
- Portal Administration (`/admin/orgs`, `/admin/grants`, `/admin/audit`, `/admin/config`, `/admin/support-access`): Org management, platform role grants, append-only audit trail viewer, time-boxed support access.

## Phase 8: Acceptance Verification & Polish
- Acceptance gates verification (§17): Policy matrix tests, tenant isolation tests, withdrawal synchronous verification, privacy payload validation, state machine tests.
- UI motion polish, dark/light theme contrast checks, accessibility and fast-loading asset optimization.
