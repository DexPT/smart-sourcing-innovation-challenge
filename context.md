# Project Context

## Overview

This repository contains a prototype of an AI-powered innovation and sourcing platform built with Next.js App Router.

Primary purpose:
- manage innovation submissions
- simulate AI evaluation
- run compliance review workflows
- manage vendors, pilots, procurement, insights, and audit logs

Important functional note:
- all data is mock/synthetic
- AI behaviour is simulated/deterministic
- there is no real backend, external API, or production authentication flow wired in

## Tech Stack

- Next.js `15.1.0`
- React `19`
- TypeScript
- Tailwind CSS
- Zustand for global state
- Recharts for analytics/visual charts
- Lucide React for icons
- Radix UI primitives in selected shared components

Main scripts from `package.json`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Repository Structure

Top-level structure:
- `app/`: App Router pages
- `components/layout/`: app shell, sidebar, top bar
- `components/ui/`: shared design system components
- `data/`: mock domain data
- `hooks/`: role/permission hooks
- `lib/`: utilities and AI logic
- `store/`: Zustand global store
- `types/`: TypeScript models

Main routes currently present:
- `/dashboard`
- `/submissions`
- `/submissions/[id]`
- `/submissions/new`
- `/ai-evaluation`
- `/compliance`
- `/vendors`
- `/pilots`
- `/procurement`
- `/insights`
- `/audit`

## Product Model

The app represents an innovation pipeline roughly like this:

`Submission -> AI Evaluation -> Human Evaluation -> Compliance -> Approval -> Pilot -> Procurement`

There is also:
- vendor management
- analytics/insights
- audit traceability

Roles are handled in the UI and permission layer through the role hook/store logic. The experience changes depending on role, but the app is still prototype-only.

## Key Shared Components

Important UI building blocks:
- `components/layout/AppShell.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/TopBar.tsx`
- `components/ui/Button.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Card.tsx`
- `components/ui/StatCard.tsx`
- `components/ui/Progress.tsx`
- `components/ui/AIScorePanel.tsx`
- `components/ui/Timeline.tsx`
- `components/ui/ClientOnly.tsx`

Important state/utility areas:
- `store/appStore.ts`
- `hooks/useRole.ts`
- `lib/utils.ts`
- `lib/aiEngine.ts`

## What Was Fixed In This Work Session

### 1. Recharts hydration mismatch

Problem observed:
- hydration error caused by mismatched generated chart IDs between server and client in Recharts

Fix applied:
- added stable `id` props to pie charts so the generated markup is deterministic

Files updated:
- `app/dashboard/page.tsx`
- `app/insights/page.tsx`

### 2. Git push failure caused by large files

Problem observed:
- initial push failed because `node_modules` and build artifacts were included in git history/worktree
- GitHub rejected a large native binary under `node_modules`

Fix applied:
- added a proper `.gitignore`

File updated:
- `.gitignore`

Current `.gitignore` intent includes:
- `node_modules/`
- `.next/`
- common build outputs
- env files
- logs
- OS junk files

Note:
- the user later confirmed this issue was resolved on their side

### 3. Button consistency and visibility improvements

Problems addressed:
- inconsistent button typography
- inconsistent border radius
- icons not always aligned consistently
- low contrast on blue CTA buttons

Fixes applied in shared button component:
- standardized font sizing across button sizes
- standardized radius to a consistent rounded shape
- normalized icon sizing/alignment through shared icon handling
- ensured icons inherit current text color consistently

File updated:
- `components/ui/Button.tsx`

Specific CTA visibility fixes:
- `Run AI Evaluation` and `Start AI Evaluation` were forced to white text on `/ai-evaluation`

File updated:
- `app/ai-evaluation/page.tsx`

### 4. Invalid interactive nesting fix

Problem observed:
- nested button semantics in AI evaluation queue/detail interactions

Fix applied:
- outer clickable queue container changed away from nested button structure
- keyboard interaction preserved

File updated:
- `app/ai-evaluation/page.tsx`

### 5. Stat card icon alignment

Problem observed:
- icons inside KPI/stat cards were visually misaligned

Fix applied:
- normalized icon rendering and sizing inside shared stat card
- improved icon container behavior for gradient cards

File updated:
- `components/ui/StatCard.tsx`

### 6. Badge and card header consistency

Problems addressed:
- some badge text had weak contrast on warning surfaces
- badge shape/line-height was not fully consistent
- card headers/actions could misalign in tighter layouts

Fixes applied:
- improved warning badge text contrast
- normalized badge pill styling
- improved `CardHeader` spacing and action alignment behaviour

Files updated:
- `components/ui/Badge.tsx`
- `components/ui/Card.tsx`

### 7. Global responsive shell improvements

Problems addressed:
- shell/header/sidebar behavior was too rigid on smaller screens

Fixes applied:
- mobile off-canvas sidebar behaviour
- desktop collapsible sidebar preserved
- adjusted main content left padding rules
- improved page padding by breakpoint
- top bar adapted for mobile navigation button flow

Files updated:
- `components/layout/AppShell.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/TopBar.tsx`

### 8. Dashboard cleanup and responsiveness

Problems addressed:
- misaligned icons in KPI cards
- rigid KPI grids
- cramped CTA/activity sections on small screens
- corrupted text separators

Fixes applied:
- responsive KPI card grid
- improved CTA stacking
- tightened/smoothed mobile layout flow
- cleaned corrupted characters and separators

File updated:
- `app/dashboard/page.tsx`

### 9. AI Evaluation page improvements

Problems addressed:
- button text visibility on blue buttons
- responsive detail header
- chart area sizing
- queue/detail layout consistency
- corrupted text characters

Fixes applied:
- white button text on key CTAs
- responsive `View Submission` button behaviour
- more flexible stats grid
- improved chart wrappers and layout flow
- cleaned broken separator characters

File updated:
- `app/ai-evaluation/page.tsx`

### 10. Submissions and Audit page cleanup

Problems addressed:
- filters and controls were too tight
- table layouts were not ideal on smaller screens
- contrast issues in warning/status areas
- text corruption artifacts

Fixes applied:
- responsive filter bars
- consistent input/select styling
- explicit minimum table widths for scrollable data tables
- improved warning text color handling
- cleaned corrupted separator characters

Files updated:
- `app/submissions/page.tsx`
- `app/audit/page.tsx`

### 11. Vendors page improvements

Problems addressed:
- inconsistent filter alignment
- detail panel spacing/alignment
- rigid metrics grid
- metadata wrapping issues

Fixes applied:
- responsive filter controls
- improved vendor detail header structure
- more flexible metrics grid
- better registration/detail row stacking
- improved certification and specialization layout

File updated:
- `app/vendors/page.tsx`

### 12. Pilots page improvements

Problems addressed:
- detail headers too rigid
- KPI and milestone rows too tight on small screens
- final score block alignment
- supporting vendor context missing from detail header

Fixes applied:
- responsive header and CTA flow
- responsive KPI/meta blocks
- milestone rows now wrap better
- final score summary aligns correctly in mobile/tablet
- related vendor name shown when present

File updated:
- `app/pilots/page.tsx`

### 13. Procurement page improvements

Problems addressed:
- detail rows and approval card were too rigid
- note/callout block styling needed consistency
- submission CTA width/flow not ideal on small screens

Fixes applied:
- improved responsive detail layout
- responsive action button group in approval state
- cleaner pilot-origin note callout
- better stacking in metadata rows

File updated:
- `app/procurement/page.tsx`

### 14. Compliance page improvements

Problems addressed:
- corrupted separator text remained
- compliance detail header and submission CTA needed responsive cleanup
- condition rows and check rows needed better spacing and wrapping

Fixes applied:
- cleaned remaining corrupted text
- responsive detail header and button layout
- improved check list and condition item formatting
- kept severity/status visual language consistent

File updated:
- `app/compliance/page.tsx`

### 15. Insights page improvements

Problems addressed:
- remaining corrupted text in header copy
- KPI chart section too rigid
- export action needed better mobile behaviour

Fixes applied:
- cleaned text corruption
- responsive header action
- responsive KPI grid
- kept charts stable and aligned with the rest of the design system

File updated:
- `app/insights/page.tsx`

### 16. Additional pages cleaned for consistency

These pages were also cleaned earlier in the session for text corruption, contrast, and responsive/detail consistency:
- `app/procurement/page.tsx`
- `app/compliance/page.tsx`
- `app/vendors/page.tsx`
- `app/pilots/page.tsx`

Also updated in earlier passes:
- `app/submissions/page.tsx`
- `app/audit/page.tsx`

## Visual/System-Level Outcomes

After the changes above, the project should now have:
- more consistent button sizes
- more consistent button radius
- more consistent icon sizing and alignment
- better text contrast on blue CTAs and warning surfaces
- fewer cramped layouts on mobile/tablet
- cleaner stacking behaviour in master-detail screens
- removal of corrupted text artifacts like `Â·` and similar encoding leftovers in the touched pages

## Files Most Relevant Going Forward

If continuing work, the most important files to review first are:

Shared layout/system:
- `components/layout/AppShell.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/TopBar.tsx`
- `components/ui/Button.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Card.tsx`
- `components/ui/StatCard.tsx`

Feature pages:
- `app/dashboard/page.tsx`
- `app/ai-evaluation/page.tsx`
- `app/submissions/page.tsx`
- `app/audit/page.tsx`
- `app/vendors/page.tsx`
- `app/pilots/page.tsx`
- `app/procurement/page.tsx`
- `app/compliance/page.tsx`
- `app/insights/page.tsx`

## Known Caveats

- Next.js in `package.json` is still `15.1.0`; the runtime warning about being outdated has not been addressed as part of these UI fixes
- build/runtime verification in this environment has not been fully reliable
- there was previously a build path that reached an unrelated prerender issue around `/audit`
- this workspace contains `.next/` and `node_modules/` locally, but these should remain ignored in git

## Suggested Next Steps

Reasonable next steps for future work:
- run a full browser pass on desktop, tablet, and mobile breakpoints
- run `npm run build` and `npm run lint` in a fully working local environment
- update `README.md`, which still appears to contain encoding corruption in its current text
- consider upgrading Next.js from `15.1.0` if the project is meant to continue evolving
- add a short visual QA checklist for each major route

## Working Summary

This project is currently a polished UI prototype with:
- a complete multi-stage sourcing workflow
- shared design system components
- mock data-driven pages
- improved responsive behavior across the major routes
- consistent button/icon treatment
- corrected chart hydration handling in the affected Recharts usage

This `context.md` is intended to be the handoff/reference file for future continuation.
