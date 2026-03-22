
## 2026-03-22 Wave 1 decisions
- Task 1 should be minimal: add `/analytics`, remove sheet-opening contract from `Index`/`Header`, and create route-shell tests without introducing the timer-running guard yet.
- Route tests should use the existing RTL/Vitest stack and current test utilities rather than adding a new router-testing framework.
- Task 2 selectors should own all deterministic analytics math: summary stats, streak, chart series, completed-task filtering, month options, and display-label derivation.
- Task 4 page hook should own shared analytics filter state and stale-month repair; render components should only consume view models.
- Task 3 should introduce a read-only analytics data hook that reads persistence directly and exposes `reload()` instead of reusing `useTasks()` / `usePomodoroHistory()`.

## 2026-03-22 Task 2 implementation decisions
- Kept analytics domain types structurally compatible with the existing `useTasks()` and `usePomodoroHistory()` hook payloads by aliasing those base records in `types.ts` and layering analytics-specific filter/view-model types on top.
- Centralized all date-range math in `createAnalyticsDateRange()` so preset and month filtering use one inclusive boundary implementation instead of duplicating logic across components.
- Added `selectResolvedAnalyticsFilter()` in the task selector module to repair missing or stale month selections without pushing hook-level orchestration into Task 2.
- Task 1 navigation should move into `Header.tsx` via `useNavigate('/analytics')` so `Index.tsx` can drop analytics sheet state entirely instead of keeping a parallel page-plus-sheet contract.
- Task 3 `useProductivityData()` should expose only IndexedDB-backed analytics-relevant settings (`activeTaskId`, `isLongPomodoro`, `timerState`) and treat all load failures as empty-safe state resets plus an explicit `error` value.
- Task 3 settings loading must follow the app's current mixed persistence sources: keep `activeTaskId` on IndexedDB with tasks, but read `isLongPomodoro` and `timerState` from `localStorage` so analytics matches runtime timer state until a future persistence migration lands.

## 2026-03-22 Task 4 implementation decisions
- `useAnalyticsPage()` is now the single owner of analytics filter state (`preset`, `selectedMonth`) plus chart metric state, with defaults locked to `30d` and `minutes` so downstream UI can consume one shared page contract.
- The hook composes only selector outputs from `useProductivityData()` and exposes page-ready view models for summary, chart series, recent sessions, completed tasks, month options, current filter label, and passthrough `reload()`/loading/error state.
- Stale month repair stays hook-driven: selector resolution computes the newest valid month option, and the hook syncs local state to that resolved filter when task data changes after reloads.
