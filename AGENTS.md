# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-23T05:29:08+07:00  
**Commit:** 7797ad5  
**Branch:** main

## OVERVIEW
Dorofy is a single-package Vite + React + strict TypeScript app for Pomodoro sessions, task management, and route-based productivity analytics. The app uses a glass-heavy UI layer, local persistence via IndexedDB/localStorage, and Vitest for verification.

## STRUCTURE
```text
./
├── src/                # App source; see src/AGENTS.md
├── public/             # Static assets, icons, screenshots, audio
├── docs/               # Design notes; see docs/design-system.md
├── .sisyphus/          # Plans, evidence, notepads; never runtime code
├── dev-dist/           # Generated dev build output; do not edit
├── dist/               # Production build output; do not edit
└── coverage/           # Test coverage output; do not edit
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App bootstrap | `src/main.tsx` | Mounts React and registers the service worker |
| Global providers + routes | `src/App.tsx` | Query/theme/tooltip providers, toasts, router |
| Source-tree guidance | `src/AGENTS.md` | Start here for any app-code change |
| Shared UI primitives | `src/components/ui/AGENTS.md` | Buttons, select, toast, sidebar, other low-level primitives |
| Analytics feature work | `src/features/analytics/AGENTS.md` | Selectors, page hook, backup flows, analytics components |
| Glass wrapper layer | `src/components/glass/index.tsx` | Project-specific visual wrapper API over vendor glass components |
| Persistence + backup schema | `src/lib/indexeddb.ts` | IndexedDB stores, export/import/clear contracts |
| Shared test harness | `src/test/setup.ts`, `src/test/test-utils.tsx` | Browser shims, custom render, timer/date helpers |
| Design rationale | `docs/design-system.md` | Liquid-glass rules and layout philosophy |
| Planning artifacts | `.sisyphus/` | Evidence and plans only; exclude from product code |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | component | `src/App.tsx` | Top-level provider stack and route registry |
| `SidebarProvider` / `useSidebar` | primitive + hook | `src/components/ui/sidebar.tsx` | Complex shared sidebar state and compound primitive API |
| `useAnalyticsPage` | hook | `src/features/analytics/hooks/useAnalyticsPage.ts` | Analytics page view-model and shared filter owner |
| `useProductivityData` | hook | `src/features/analytics/hooks/useProductivityData.ts` | Analytics persistence boundary with `reload()` |
| `dorofyDB` | singleton | `src/lib/indexeddb.ts` | IndexedDB access, backup export/import, clear |

## CONVENTIONS
- Use `@/*` imports for app code; the alias points at `src/`.
- TypeScript is intentionally strict: `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `allowJs: false`.
- Vite dev server is not default: host is `::`, port is `8080`.
- PWA support is active in development too; `src/main.tsx` always registers the service worker.
- Vitest runs in `jsdom` with global setup from `src/test/setup.ts` and 80% global coverage thresholds.
- There is no checked-in CI workflow; local npm scripts are the source of truth for verification.

## ANTI-PATTERNS (THIS PROJECT)
- Do not edit generated output under `dev-dist/`, `dist/`, `coverage/`, `test-results/`, or `tmp/`.
- Do not treat `.sisyphus/` as app code or import from it.
- Do not document generic framework behavior in child AGENTS files; keep them local and evidence-based.

## COMMANDS
```bash
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
npm run test
npm run test:ui
npm run test:run
npm run test:coverage
```

## TESTING SHAPE
- Tests are co-located beside features, hooks, pages, and components.
- Shared setup lives in `src/test/`; use it instead of re-creating browser/query/router wrappers per test.
- Analytics has the deepest test surface: selectors, hooks, components, and page integration/layout tests.

## NOTES
- Route surface is intentionally small: `/` for the timer/task experience, `/analytics` for reporting.
- The root file should stay high-level. Put source-tree details in `src/AGENTS.md`, primitive rules in `src/components/ui/AGENTS.md`, and analytics rules in `src/features/analytics/AGENTS.md`.
