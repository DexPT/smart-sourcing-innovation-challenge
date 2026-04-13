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
- **Static data** in `data/` serves as the seed dataset. `submissions`, `complianceResults`, `pilots`, and `procurementDecisions` are loaded into Zustand on startup and are mutable during the session. `vendors` and `audit` are still read directly from `data/` as static imports (read-only).

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

- `components/ui/` — primitive UI components (Card, Badge, Button, StatCard, Progress, Timeline, AIScorePanel, ClientOnly, Skeleton).
- `components/layout/` — shell components (AppShell, Sidebar, TopBar, RoleSwitcher).
- Pages are large self-contained files with filtering/display logic inline — do not extract sub-components unless reuse is needed across pages.
- `ClientOnly` wraps anything that would cause SSR hydration mismatches (e.g., components reading from Zustand).
- Use `cn()` from `lib/utils.ts` (re-exports `clsx` + `tailwind-merge`) for conditional class merging.

---

## Outstanding work (gap analysis vs brief)

Items are ordered by demo impact. Do not mark an item done here until it is fully wired end-to-end.

### ~~P1 — Role-differentiated dashboards~~ ✓ DONE
Four fully distinct dashboards implemented in `app/dashboard/page.tsx` as `AdminDashboard`, `EvaluatorDashboard`, `ComplianceDashboard`, `StartupDashboard` components, rendered conditionally on `currentRole`. Startup demo submissions hardcoded to IDs `['sub-006', 'sub-008']`.

### P2 — Landing / demo entry page ✗ CANCELLED
Not relevant for this project. `app/page.tsx` redirects directly to `/dashboard`.

### ~~P3 — Evaluator actions on AI Evaluation Hub~~ ✓ DONE
`EvaluatorActions` component added inline in `app/ai-evaluation/page.tsx`. Three actions: **Shortlist** (moves to `compliance_check`, aligned with AI), **Request More Info** (inline textarea, appends `comment` timeline event, status unchanged), **Override** (choose approve/reject + required justification ≥20 chars, appends `decision` event marked as override). Panel remounts on each selection via `actionKey`. Post-action shows a "Decision recorded" confirmation.

### ~~P4 — Compliance officer actions~~ ✓ DONE
`complianceResults` moved from static `data/compliance.ts` into Zustand store (`useAppStore`) with `updateComplianceResult` action. `ComplianceActions` component added to `app/compliance/page.tsx` with three actions: **Approve** (direct, no input → `passed` + submission `approved`), **Conditional Approval** (multiline textarea, one condition per line → `conditional` + submission `approved`), **Block** (textarea ≥20 chars → `failed` + submission back to `evaluation`). All actions append a `compliance` timeline event. Dashboard and `submissions/[id]` updated to read compliance from store.

### ~~P5 — Procurement final-decision actions~~ ✓ DONE
`procurementDecisions` moved into Zustand store with `updateProcurementDecision` action. `DecisionSummary` component shows 4 quadrants: AI Score, Compliance, Pilot Outcome, Vendor Readiness. `ProcurementActions` component with three actions: **Approve** (direct → `approved` + `approvedAt` timestamp), **Return for Revision** (textarea → decision back to `pending_approval`, submission back to `approved`), **Reject** (textarea ≥20 chars → decision `cancelled`, submission `rejected`). All actions append timeline events.

### ~~P6 — Pilot status-change actions~~ ✓ DONE
`pilots` moved from static `data/pilots.ts` into Zustand store with `updatePilot` action. `PilotActions` component added to `app/pilots/page.tsx`. Status transitions: `planned→active` (Launch), `active→paused` (Pause), `paused→active` (Resume), `active/paused→completed` (opens completion panel with score slider 0-100, recommendation picker, notes textarea), `active/paused→cancelled`. Completed pilots with `proceed` recommendation show "Send to Procurement" button that moves submission to `procurement` status. All actions append timeline events to the related submission. Dashboard updated to read pilots from store.

### ~~P7 — Richer Insights page~~ ✓ DONE
All metrics derived live from Zustand store via `useMemo`. Added: **Sector Innovation Heatmap** (grouped bar — submission count + avg AI score per category), **Approval Rate Funnel** (cumulative counts at each pipeline stage, step-to-step conversion %), **AI Decision Alignment** (donut — AI-aligned vs overridden vs pending, override rate %), **Pilot Conversion** (donut + proceed/modify/terminate breakdown + proceed rate %). Avg Time to AI Eval stat card computed from `aiScore.generatedAt` vs `submittedAt`. Kept Submission Activity area chart and Pipeline Value bar chart.

### ~~P8 — Richer Audit Log page~~ ✓ DONE
Static audit logs merged with live timeline events from the submissions store (dynamic events detected via ID heuristic: `/^tl-ai-\d/` or `/^tl-\d{9,}$/`). Live events converted to `AuditLog` format with `deriveAction()` mapping from event type/title. New **Source** filter (All / AI System / Human). AI rows get a `bg-primary/[0.03]` tint + dedicated "AI" chip in Source column; human rows show initials avatar. Stats cards: Total Events, AI Events, Human Events, Unique Actors. Live events tagged with a "live" sub-label. IP address column removed in favour of Details column.

### ~~P9 — Individual detail routes~~ ✓ DONE
Three deep-link routes created, all using `useParams()` for the id:
- `app/vendors/[id]/page.tsx` — full vendor profile (about, performance bars, registration, contact, specializations, certs, tags). Reads from static `data/vendors`. "Full details" link added to vendor panel in list page.
- `app/pilots/[id]/page.tsx` — pilot detail (KPI tracker with progress bars, milestone timeline, budget breakdown, stakeholders, final score). Reads from Zustand store. "Details →" link added to each list card.
- `app/compliance/[id]/page.tsx` — compliance review detail (all checks with severity/category/status, conditions, reviewer notes, officer info, check summary). Reads from Zustand store. "Details →" link added to each list card.
All three show a "not found" state if the ID doesn't match any record.

### ~~P10 — Polish~~ ✓ DONE
- **Skeleton components** (`components/ui/Skeleton.tsx`): `Skeleton` (base), `SkeletonStatCard`, `SkeletonCard`, `SkeletonListItem`, `SkeletonTableRow`, `SkeletonText`, `SkeletonChart` — use `animate-pulse` with design-system surface tokens.
- **Global search** (`TopBar.tsx`): Input now shows a dropdown with matching submissions (→ `/submissions/[id]`) and vendors (→ `/vendors/[id]`), filtered via `useMemo`. Click-outside closes via `useRef`. Escape key clears. Clear button (×) when query is non-empty. "No results" state. Avatar links to `/settings`.
- **`/settings` page** (`app/settings/page.tsx`): Stub with 5 sections — profile, notifications (toggles), appearance (toggles), language/region (selects), security, integrations. All toggles are local state. Settings link added to Sidebar bottom nav (visible to all roles).

---

## Remaining work (brief alignment gaps)

These items were identified after a full re-read of the original brief. They are ordered by demo impact. Do not mark an item done here until it is fully wired end-to-end.

### ~~P11 — DESC AI Security Policy panel~~ ✓ DONE
`DESCAISecurityPanel` component added inline in `app/ai-evaluation/page.tsx`, rendered between the score charts and the evaluator actions when `aiScore` is present.
- **AI Lifecycle stepper** (5 phases: Design → Develop → Deploy → Monitor → Dispose) with dot-and-line progress indicator. Each phase derives its status (`pass` / `warning` / `fail`) from the relevant `aiScore` dimension (compliance, feasibility, risk, overall).
- **Risk controls checklist** (5 items): Data Poisoning, Adversarial Attacks, Hallucination Monitoring, Secure APIs, UAE Data Residency — each with standard reference (DESC AI Policy §, ISO 27001, PDPL), derived status, and a pill badge.
- **Overall compliance badge** in card header (Pass / Review Needed / Non-Compliant) — worst-case of all controls.
- UAE Data Residency control automatically fails for non-UAE `countryOfOrigin`.
- Footer note clarifies auto-assessment vs. manual DESC audit.

### ~~P12 — Finalist pipeline stage~~ ✓ DONE
`FinalistsPanel` component added to `app/dashboard/page.tsx` (AdminDashboard only).
- Slot counter (5 coloured bars) showing X/5 filled.
- Current finalists grid with "Confirm for Demo Day" button per card (sets status → `demo_day`).
- Eligible approved submissions list with "Select as Finalist" button (sets status → `finalist`).
- Both actions append a timeline event and re-render reactively from the store.
- `finalist` and `demo_day` added to `SubmissionStatus` in `types/index.ts`, status configs in `lib/utils.ts`, and `STATUS_OPTIONS` in `app/submissions/page.tsx`.

### ~~P13 — DESC-approved vendor filter & badge~~ ✓ DONE
`descCertified: boolean` added to `Vendor` type and all 8 seed records in `data/vendors.ts` (true for SecureNet Arabia only — the one with "DESC Certified" in certs).
- `app/vendors/page.tsx`: "DESC Approved Only" toggle button above the list; when active filters to `descCertified === true`. Each list card shows a green "DESC" badge or grey "DESC Pending" badge. Detail panel header shows the same badge at a larger size.
- `app/vendors/[id]/page.tsx`: DESC Certified / DESC Pending badge in the header alongside the tier pill.
- `app/procurement/page.tsx` `DecisionSummary`: Vendor Readiness quadrant now shows DESC status row with `ShieldCheck` (green, "DESC Certified") or `ShieldAlert` (amber, "DESC Certification Pending").
