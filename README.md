# Dubai Chambers Innovation Platform

Enterprise-grade AI-powered innovation and sourcing platform prototype developed in collaboration with `Ignyte.ae`.

> Prototype notice: all AI logic is deterministic simulation. All data is mock/synthetic. No real authentication, external APIs, or databases are used.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

## Stack

- Next.js `15.1.0`
- React `19`
- TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Lucide React
- Radix UI primitives

## Repository Structure

```text
smart-sourcing-innovation-challenge/
|-- app/                    # App Router pages
|   |-- dashboard/          # KPI dashboard
|   |-- submissions/        # Submission list, detail, and creation
|   |-- ai-evaluation/      # AI scoring hub
|   |-- compliance/         # Compliance review workflows
|   |-- vendors/            # Vendor registry
|   |-- pilots/             # Pilot management
|   |-- procurement/        # Procurement decisions
|   |-- insights/           # Analytics and reporting
|   `-- audit/              # Audit trail
|-- components/
|   |-- layout/             # AppShell, Sidebar, TopBar
|   `-- ui/                 # Shared UI components
|-- data/                   # Mock domain data
|-- hooks/                  # Role and permission hooks
|-- lib/                    # Utilities and AI logic
|-- store/                  # Zustand store
`-- types/                  # TypeScript types
```

## Roles

Switch roles using the role switcher in the sidebar.

| Role | Label | Access |
|------|-------|--------|
| `admin` | Admin / Decision Maker | Full access across modules, approvals, and procurement |
| `evaluator` | Evaluator | Submissions, AI evaluation, pilots, insights |
| `compliance` | Compliance Officer | Compliance, vendor registry, audit |
| `startup` | Startup / Vendor | Own submissions, status tracking, submission form |

## Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | KPIs, quick actions, summary activity |
| Submissions | `/submissions` | Create, list, filter, and manage submissions |
| Submission Detail | `/submissions/[id]` | Overview, AI evaluation, compliance, timeline |
| New Submission | `/submissions/new` | Multi-step submission flow |
| AI Evaluation | `/ai-evaluation` | Ranked evaluation queue and AI score views |
| Compliance | `/compliance` | DESC-aligned compliance checks and notes |
| Vendors | `/vendors` | Vendor registry, metrics, certifications |
| Pilots | `/pilots` | KPI tracking, milestones, budgets |
| Procurement | `/procurement` | Contract review and approval workflows |
| Insights | `/insights` | Charts, funnel, trends, performance reporting |
| Audit | `/audit` | Filterable traceability log |

## Workflow

```text
Submission -> AI Evaluation -> Human Evaluation -> Compliance -> Approval -> Pilot -> Procurement
```

Each stage updates statuses, timeline data, and role-specific actions in the UI.

## AI Simulation

`lib/aiEngine.ts` generates deterministic AI scores based on:

- Relevance
- Feasibility
- Compliance
- Risk
- Innovation
- Market Fit

The same submission always yields the same simulated score. The flow includes an artificial delay to mimic AI processing.

## Design System

The visual language is based on `DESIGN.md` and a shared set of UI components.

Core principles:
- strong primary/secondary color system
- display and body typography split
- shared card, badge, stat, and button patterns
- chart styling aligned to the same palette
- responsive master-detail layouts across workflow pages

## Recent UI/UX Work

Recent updates applied in the project:

- fixed Recharts hydration mismatch by adding stable chart IDs in affected pie charts
- added `.gitignore` for `node_modules`, `.next`, env files, logs, and common build outputs
- standardized button font sizes, border radius, and icon alignment
- improved contrast for blue CTA buttons and warning surfaces
- fixed invalid nested interactive structure in the AI evaluation queue
- improved shared `StatCard`, `Badge`, and `CardHeader` consistency
- rebuilt the shell responsiveness for mobile sidebar/top bar behavior
- improved responsiveness and alignment across:
  - `/dashboard`
  - `/ai-evaluation`
  - `/submissions`
  - `/audit`
  - `/vendors`
  - `/pilots`
  - `/procurement`
  - `/compliance`
  - `/insights`
- removed corrupted text artifacts such as `Â·` and related encoding issues in the touched pages

For a more complete handoff summary, see [context.md](./context.md).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- This repo is currently a polished front-end prototype rather than a production-integrated platform.
- Next.js is pinned to `15.1.0`, which may surface an outdated-version warning during runtime.
- Local folders like `.next/` and `node_modules/` may exist in the workspace, but they should remain ignored by git.
