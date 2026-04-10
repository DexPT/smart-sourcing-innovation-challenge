# Dubai Chambers Innovation Platform

**Enterprise-grade AI-powered innovation and sourcing platform** — developed in collaboration with Ignyte.ae.

> ⚠️ **Prototype Notice:** All AI logic is deterministic simulation. All data is mock/synthetic. No real authentication, external APIs, or databases are used.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the dashboard.

---

## Architecture

```
smart-sourcing-innovation-challenge/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Role-specific dashboards
│   ├── submissions/        # Submission portal + [id] detail
│   ├── ai-evaluation/      # AI scoring hub
│   ├── compliance/         # Compliance & security hub
│   ├── vendors/            # Vendor registry
│   ├── pilots/             # Pilot management
│   ├── procurement/        # Procurement decisions
│   ├── insights/           # Analytics & reports
│   └── audit/              # Audit logs
├── components/
│   ├── layout/             # AppShell, Sidebar, TopBar, RoleSwitcher
│   └── ui/                 # Badge, Button, Card, AIScorePanel, Timeline, Progress, StatCard
├── data/                   # Mock data (submissions, vendors, compliance, pilots, procurement, audit)
├── hooks/                  # useRole (nav + permissions)
├── lib/                    # utils (formatting) + aiEngine (scoring logic)
├── store/                  # Zustand global state
└── types/                  # TypeScript types
```

---

## Roles

Switch roles using the **Role Switcher** in the bottom-left sidebar.

| Role | Label | Access |
|------|-------|--------|
| `admin` | Admin / Decision Maker | Full access — all modules, approvals, procurement |
| `evaluator` | Evaluator | Submissions, AI evaluation, pilots, insights |
| `compliance` | Compliance Officer | Compliance hub, vendor registry, audit logs |
| `startup` | Startup / Vendor | Own submissions, status tracking, new submission form |

---

## Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Role-specific KPIs, trends, quick actions |
| Submissions | `/submissions` | Create, list, filter, and manage submissions |
| Submission Detail | `/submissions/[id]` | Full detail: overview, AI eval, compliance, timeline |
| New Submission | `/submissions/new` | 3-step wizard for startups |
| AI Evaluation Hub | `/ai-evaluation` | Ranked queue + AI scoring with radar charts |
| Compliance Hub | `/compliance` | DESC-aligned checks per submission |
| Vendor Registry | `/vendors` | Registered vendors with tier, status, and metrics |
| Pilot Management | `/pilots` | KPI tracking, milestones, budget utilization |
| Procurement | `/procurement` | Contract approval workflow |
| Insights & Reports | `/insights` | Charts: funnel, trend, category performance |
| Audit Logs | `/audit` | Filterable full traceability log |

---

## Workflow

```
Submission → AI Evaluation → Human Evaluation → Compliance Check → Approval → Pilot → Procurement
```

Each step updates status badges, timeline events, and role-appropriate action buttons in real time.

---

## AI Simulation

The `lib/aiEngine.ts` module generates deterministic AI scores based on:
- **Relevance** (category alignment, strategic fit)
- **Feasibility** (team size, funding stage)
- **Compliance** (country of origin, pre-screening)
- **Risk** (TRL, technology maturity)
- **Innovation** (domain novelty)
- **Market Fit** (estimated value, demand signals)

Scores are deterministic (hash-based seeding) so the same submission always yields the same score. A simulated 2.5-second delay mimics AI processing.

---

## Design System

Based on `DESIGN.md` — **Sovereign Intelligence Interface**:
- **Colors:** Primary `#003d9b` (Chamber authority), Secondary `#006a6a` (AI/innovation)
- **Typography:** Manrope (display/headlines) + Inter (body/data)
- **No border-lines rule:** All sectioning via background tonal shifts
- **Power Gradient:** `linear-gradient(135deg, #003d9b, #0052cc)` for primary CTAs
- **Ghost Border:** `outline-variant` at 15% opacity for data tables

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom design tokens)
- **Zustand** (global state)
- **Recharts** (Area, Bar, Line, Pie, Radar charts)
- **Lucide React** (icons)
- **Google Fonts** (Manrope + Inter)
