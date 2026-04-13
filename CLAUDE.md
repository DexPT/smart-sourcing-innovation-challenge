# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint via Next.js
```

No test suite is configured. There is no `.env` file — the app is fully client-side with no backend or API calls.

## Architecture

**Dubai Chambers Innovation Platform** — a Next.js 15 / React 19 prototype for AI-powered startup sourcing. All data is static (in-memory); there is no database or API.

### Key structural decisions

- **App Router** (`app/`) with one route per platform module: `/dashboard`, `/submissions`, `/ai-evaluation`, `/compliance`, `/vendors`, `/pilots`, `/procurement`, `/insights`, `/audit`.
- **All state lives in `store/appStore.ts`** (Zustand). Submissions, active role, sidebar state, and filters are all stored here. Never lift state to component-level for things that span pages.
- **Role-based access is derived, not stored.** `hooks/useRole.ts` computes a `can` permissions object and filtered `navItems` from the current role. Role is switched at runtime via the `RoleSwitcher` component — this is a prototype demo feature, not an auth system.
- **AI evaluation is simulated** in `lib/aiEngine.ts`. Scores are deterministic (seed-based hashing from submission ID), so the same submission always produces the same scores. The `startAIEvaluation` action in the store simulates a 2.5s delay then writes the result back to the submission.
- **Static data** in `data/` (submissions, vendors, compliance, pilots, audit, procurement) serves as the seed dataset loaded into Zustand on startup.

### Layout

Every page (except the root redirect `app/page.tsx`) wraps its content in `<AppShell>`, which renders `<Sidebar>` + `<TopBar>` + a responsive main area. The sidebar collapses to icon-only on desktop; on mobile it overlays. The `lg:pl-64` / `lg:pl-16` offset on `<main>` tracks `sidebarOpen` from the store.

### Type system

All domain types are in `types/index.ts`. The submission lifecycle flows through `SubmissionStatus` states: `draft → submitted → ai_review → evaluation → compliance_check → approved → pilot → procurement`. Each status transition is reflected in the submission's `timeline` array.

### Design system

The design system is fully documented in `DESIGN.md`. Key rules enforced via `tailwind.config.ts`:

- **No border lines** for section separation — use background color shifts (`surface-container-lowest` on `surface-container-low`).
- **Two fonts:** `font-display` (Manrope) for headlines/KPIs, `font-sans` (Inter) for body/data.
- **8px spacing grid** — use the defined spacing tokens, not arbitrary values.
- **Tonal layering instead of shadows** — `surface` → `surface-container-low` → `surface-container-lowest` creates the depth hierarchy.
- Custom color tokens (`primary`, `secondary`, `tertiary`, `error`, `warning`, `surface-*`, `on-surface-*`, `outline-*`) are all defined in `tailwind.config.ts`. Use these rather than Tailwind defaults like `blue-*` or `gray-*`.
- Status badges use `rounded-full`; action chips use `rounded-md`.

### Component conventions

- `components/ui/` — primitive UI components (Card, Badge, Button, StatCard, Progress, Timeline, AIScorePanel, ClientOnly).
- `components/layout/` — shell components (AppShell, Sidebar, TopBar, RoleSwitcher).
- Pages are large self-contained files with filtering/display logic inline — do not extract sub-components unless reuse is needed across pages.
- `ClientOnly` wraps anything that would cause SSR hydration mismatches (e.g., components reading from Zustand).
- Use `cn()` from `lib/utils.ts` (re-exports `clsx` + `tailwind-merge`) for conditional class merging.

---

## Outstanding work (gap analysis vs brief)

Items are ordered by demo impact. Do not mark an item done here until it is fully wired end-to-end.

### ~~P1 — Role-differentiated dashboards~~ ✓ DONE
Four fully distinct dashboards implemented in `app/dashboard/page.tsx` as `AdminDashboard`, `EvaluatorDashboard`, `ComplianceDashboard`, `StartupDashboard` components, rendered conditionally on `currentRole`. Startup demo submissions hardcoded to IDs `['sub-006', 'sub-008']`.

### P2 — Landing / demo entry page
No `/` or `/demo` route exists as a front door. Need a polished landing page that explains the platform and lets a reviewer choose a role before entering. `app/page.tsx` currently redirects straight to `/dashboard`.

### P3 — Evaluator actions on AI Evaluation Hub
`app/ai-evaluation/page.tsx` lets evaluators trigger scoring but is missing: **Shortlist**, **Request More Info**, **Override AI recommendation with justification** (text input modal). Each action must update submission status and append a timeline event.

### P4 — Compliance officer actions
`app/compliance/page.tsx` is read-only. Compliance officer must be able to: **Approve**, **Conditional Approval** (with editable conditions list), **Block** — each updating the submission status, compliance result, and timeline.

### P5 — Procurement final-decision actions
`app/procurement/page.tsx` needs admin actions: **Approve for procurement**, **Return for revision**, **Reject** — with the full summary panel (AI score, compliance result, pilot outcome, vendor readiness) visible before deciding.

### P6 — Pilot status-change actions
`app/pilots/page.tsx` is read-only. Evaluator/admin must be able to transition pilot status: `planned → active → completed / cancelled`, and mark a completed pilot as recommended for procurement.

### P7 — Richer Insights page
`app/insights/page.tsx` needs: sector innovation heatmap (bar or treemap), AI override trend chart, time-to-evaluation metric, approval rate funnel, pilot conversion rate. Charts should use Recharts with the design system colors.

### P8 — Richer Audit Log page
`app/audit/page.tsx` needs: searchable table with actor, role, entity, action, timestamp columns; AI-generated events visually distinguished from human decisions; filter by actor role and entity type.

### P9 — Individual detail routes
Currently vendors and pilots use master-detail panels (no deep links). Add:
- `app/vendors/[id]/page.tsx`
- `app/pilots/[id]/page.tsx`
- `app/compliance/[id]/page.tsx`

### P10 — Polish
- Loading skeleton components for cards and table rows (brief explicitly requires these).
- Global search in `TopBar` should filter submissions/vendors by name and navigate to results.
- `/settings` stub page.
