# AGENTS.md — Antigravity Agent Guidelines for azentio.ai

1. Read `SOURCE_OF_TRUTH.md` first. It is authoritative.
2. Follow `PHASES.md` step by step. Do not skip phases or take unapproved shortcuts.
3. Deny by default: never bypass `src/server/policy/authorize.ts` and the Data Access Layer (`src/server/dal/*`).
4. UI components and server actions never query the database directly. All cross-tenant shared reads must use the de-identified shared read model.
5. All UI must be animative, supporting both dark and light theme seamlessly, responsive, fast-loading, and polished for enterprise presentation.
6. Verify acceptance gates (§17 in `SOURCE_OF_TRUTH.md`) before declaring any phase complete.

