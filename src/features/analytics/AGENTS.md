# ANALYTICS FEATURE GUIDE

## OVERVIEW
`src/features/analytics/` is a real feature slice, not just a component folder. The route entry is `src/pages/Analytics.tsx`, but the feature's contracts, calculations, persistence boundary, and presentational sections live here.

## STRUCTURE
```text
src/features/analytics/
├── types.ts            # Shared analytics types and view-model contracts
├── hooks/              # Page orchestration + persistence boundary
├── selectors/          # Pure analytics math and date-range logic
└── components/         # Presentational sections rendered by the route page
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Page-level filter / metric state | `hooks/useAnalyticsPage.ts` | Single owner of preset, month, metric, and derived view models |
| Persistence reads + refresh | `hooks/useProductivityData.ts` | Analytics-only storage boundary with `reload()` |
| Date ranges / summary / chart series / recent sessions | `selectors/sessionSelectors.ts` | Keep analytics math pure and testable |
| Completed-task filters / month options / labels | `selectors/taskSelectors.ts` | Shared task-side analytics derivation |
| Backup / import / clear flows | `components/BackupPanel.tsx` | Refreshes in place via `reload()` and uses toasts for feedback |
| Trend section | `components/SessionTrendSection.tsx`, `components/AnalyticsTrendChart.tsx` | Metric toggle and chart rendering |
| Task insights | `components/CompletedTaskInsights.tsx` | Secondary task-oriented analytics section |
| Route composition / page order | `src/pages/Analytics.tsx` | Compose feature outputs here; do not move analytics math back into the page |

## DATA-FLOW RULES
- `useAnalyticsPage()` is the single owner of page filter state and chart metric state.
- `useProductivityData()` is the persistence boundary. If a component needs fresh analytics data, it should receive `reload()` from above rather than touching IndexedDB directly.
- `selectors/` stays pure: no React, no IndexedDB, no toast calls, no DOM access.
- `components/` should render prepared props/view models. They should not re-derive date math, month resolution, or session/task aggregations.

## BACKUP / SAFETY RULES
- `BackupPanel` owns export/import/clear UI inside the analytics page.
- Import and clear must refresh in place via `reload()`.
- Do not reintroduce `window.location.reload()` in analytics flows.
- Do not move backup flows out of analytics unless the product model changes.

## ROUTE / UX RULES
- Keep analytics route-based. Do not reintroduce a sheet-based analytics surface.
- Session analysis is the primary concern; completed tasks and backup stay secondary in page structure.
- If new analytics UI needs raw storage data or filter ownership, that is usually a sign the logic belongs in a selector or hook first.

## TESTING
- Selector tests live next to selector files.
- Hook tests live next to hook files.
- Component tests live next to analytics components.
- Page layout / route integration tests live under `src/pages/Analytics*.test.tsx`.
- When changing range logic, month behavior, backup refresh, or navigation assumptions, update the slice tests and the relevant page tests together.

## ANTI-PATTERNS
- Do not compute analytics math inside React render components.
- Do not query `dorofyDB` from analytics components.
- Do not import raw task/session hooks into analytics presentation when the feature hook/selectors already shape that data.
- Do not silently regress month-boundary or empty-state behavior; those rules are intentional and covered by tests.
