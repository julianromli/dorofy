# Analytics Route Redesign and Session Analysis Refactor

## TL;DR
> **Summary**: Replace the current sheet-based analytics surface with a dedicated `/analytics` route, then rebuild the feature around pure analytics selectors and a page-level view-model hook so session analysis becomes the primary experience and backup tools remain inside analytics without hard reloads.
> **Deliverables**:
> - Route-based analytics page at `/analytics`
> - `src/features/analytics/` module with selectors, hooks, and presentational components
> - Backup/import flow refreshed through explicit data reloads instead of `window.location.reload()`
> - Analytics regression tests covering route render, filters, backup, and timer-navigation guard
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 3 → 4 → 9 → 10

## Context
### Original Request
- Refactor the analytics feature.

### Interview Summary
- The refactor is allowed to change behavior and APIs.
- Scope is limited to the analytics feature and its direct dependencies.
- Analytics must move from the current sheet to a dedicated route/page.
- Success is defined by simpler analytics data flow, not just cosmetic cleanup.
- Backup/export remains part of analytics.
- The redesign should be major and emphasize session analysis.
- Analytics derivation must move into dedicated selectors plus a feature hook.
- Test strategy is **tests-after** using the existing Vitest + RTL stack.

### Metis Review (gaps addressed)
- Account for the hidden backup dependency currently embedded in analytics.
- Remove fragmented inline derivation logic from analytics UI components.
- Explicitly handle timer-navigation behavior when leaving `/` for `/analytics`.
- Fix existing analytics edge cases instead of carrying them forward: inclusive date boundaries, stale month selection, orphaned task references, empty-state handling, and refresh side effects.

## Work Objectives
### Core Objective
Deliver a route-based analytics feature centered on session analysis, with raw persistence reads isolated to one hook, all analytics derivation isolated to pure selectors, and all analytics UI components rendered from view models instead of inline filtering logic.

### Deliverables
- `src/pages/Analytics.tsx` route shell
- Route entry in `src/App.tsx`
- Updated home-page analytics navigation in `src/pages/Index.tsx` and `src/components/Header.tsx`
- `src/features/analytics/types.ts`
- `src/features/analytics/selectors/sessionSelectors.ts`
- `src/features/analytics/selectors/taskSelectors.ts`
- `src/features/analytics/hooks/useProductivityData.ts`
- `src/features/analytics/hooks/useAnalyticsPage.ts`
- `src/features/analytics/components/*` for the redesigned analytics page
- Analytics tests under `src/features/analytics/**/__tests__` or colocated `*.test.ts(x)` files
- Updated README analytics instructions to match route-based behavior

### Definition of Done (verifiable conditions with commands)
- [ ] `npm run test:run -- src/features/analytics` passes
- [ ] `npm run test:run -- src/pages/Analytics.test.tsx src/pages/Index.analytics-navigation.test.tsx` passes
- [ ] `npm run test:coverage` passes with existing global thresholds from `vitest.config.ts`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

### Must Have
- `/analytics` is directly routable and refresh-safe.
- `src/pages/Index.tsx` no longer owns `analyticsSheetOpen` or renders `AnalyticsSheet`.
- `src/components/Header.tsx` no longer receives `openAnalytics`; analytics navigation becomes route-based.
- Session analysis is the primary page focus.
- Completed tasks and backup tools remain on the analytics page as secondary sections.
- Analytics components receive precomputed props/view models only.
- Backup import and clear refresh analytics data through an explicit `reload()` path.
- Empty datasets, orphaned `taskId` references, and month/range edge cases are handled intentionally.
- Navigation from `/` to `/analytics` is blocked while the timer is running, with explicit user feedback.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT introduce a new global state library or app-wide provider for analytics.
- Must NOT preserve the sheet and page in parallel.
- Must NOT keep analytics filtering/aggregation inside render components.
- Must NOT use `window.location.reload()` or delayed refresh timers in analytics flows.
- Must NOT expand scope into timer persistence continuity across routes.
- Must NOT change task-creation, task-completion, or timer countdown business logic beyond the explicit navigation guard.
- Must NOT add backend, server, or cloud-sync work.
- Must NOT use snapshot tests for the analytics redesign.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: **tests-after** with Vitest + React Testing Library
- QA policy: Every task includes agent-executed scenarios and evidence output paths.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: route foundation, selector contracts, data-loading boundary, page view-model

Wave 2: session-focused UI sections, completed-task section, backup refresh boundary, page integration, route guard, legacy surface removal, regression tests, README alignment

### Dependency Matrix (full, all tasks)
- Task 1: none
- Task 2: none
- Task 3: none
- Task 4: blocked by 2, 3
- Task 5: blocked by 4
- Task 6: blocked by 4
- Task 7: blocked by 4
- Task 8: blocked by 3
- Task 9: blocked by 1, 4, 5, 6, 7, 8
- Task 10: blocked by 1-9

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `unspecified-high` x4
- Wave 2 → 6 tasks → `visual-engineering` x3, `unspecified-high` x3

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Register `/analytics` route and replace sheet navigation contract

  **What to do**: Add `src/pages/Analytics.tsx` as a lightweight route shell, register it in `src/App.tsx`, replace the `openAnalytics` prop in `src/components/Header.tsx` with a route-navigation callback prop, and update `src/pages/Index.tsx` to navigate to `/analytics` instead of toggling sheet state. Keep the new page shell minimal in this task: title, description, and placeholder containers only. Do not add the timer-running guard yet; that lands in Task 9.
  **Must NOT do**: Do not keep `analyticsSheetOpen` as a fallback. Do not render both the sheet and page in parallel. Do not add analytics business logic to the new page shell.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: touches routing, component contracts, and page orchestration.
  - Skills: `[]` — no extra skill is needed beyond repo patterns.
  - Omitted: `visual-engineering` — styling is not the main risk in this foundation step.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [9, 10] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/App.tsx:18-23` — existing route registration pattern with `Routes` and `Route`.
  - Pattern: `src/pages/Index.tsx:20,40,135-138,255-264` — current lazy sheet import, open state, header callback wiring, and conditional sheet render to remove.
  - Pattern: `src/components/Header.tsx:7-18,51-57` — current analytics button prop contract and trigger button.
  - Pattern: `src/pages/NotFound.tsx` — use the existing page-level route style as the baseline for route shell shape.
  - External: `https://reactrouter.com/en/main/start/overview` — route element and navigation callback semantics.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/App.tsx` contains a real `/analytics` route that renders `src/pages/Analytics.tsx`.
  - [ ] `src/pages/Index.tsx` no longer imports `AnalyticsSheet` or owns `analyticsSheetOpen` state.
  - [ ] `src/components/Header.tsx` no longer accepts an `openAnalytics` prop.
  - [ ] `npm run test:run -- src/pages/Analytics.route-shell.test.tsx src/components/Header.analytics-trigger.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: /analytics route renders the new shell
    Tool: Bash
    Steps: Run `npm run test:run -- src/pages/Analytics.route-shell.test.tsx`; the test must mount `App` at `/analytics` and assert the analytics page shell renders instead of `NotFound`.
    Expected: Test passes and writes evidence proving `/analytics` resolves correctly.
    Evidence: .sisyphus/evidence/task-1-route-shell.txt

  Scenario: Unknown route still falls through to NotFound
    Tool: Bash
    Steps: In the same test file or companion test, mount `App` at `/definitely-missing` and assert the analytics shell is absent while `NotFound` content is present.
    Expected: Unknown routes still hit the catch-all route.
    Evidence: .sisyphus/evidence/task-1-route-shell-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): add route shell` | Files: `src/App.tsx`, `src/pages/Analytics.tsx`, `src/pages/Index.tsx`, `src/components/Header.tsx`, new tests

- [x] 2. Extract analytics domain types and pure selector modules

  **What to do**: Create `src/features/analytics/types.ts`, `src/features/analytics/selectors/sessionSelectors.ts`, and `src/features/analytics/selectors/taskSelectors.ts`. Move every analytics calculation out of UI components into pure functions: range bounds, month-option generation, session summary, session trend points, recent sessions, task lookup, and completed-task filtering. Use one shared filter model for the whole page: preset values `7d | 30d | 90d | month`, plus `selectedMonth` when preset is `month`. Make all range boundaries inclusive and deterministic by accepting `now` as an injectable argument in selector inputs.
  **Must NOT do**: Do not leave any filtering math in `SummaryStats`, `DailyPomodoroChart`, or `CompletedTasksLog`. Do not use `new Date()` directly inside render components. Do not make selectors depend on React or IndexedDB.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: pure domain modeling and edge-case-heavy data logic.
  - Skills: `[]` — existing selector extraction can follow direct code evidence.
  - Omitted: `visual-engineering` — no UI work is needed here.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [4, 7, 9, 10] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/analytics/SummaryStats.tsx:15-35` — current inline session summary and streak logic to extract.
  - Pattern: `src/components/analytics/DailyPomodoroChart.tsx:12-33` — current day bucketing and metric derivation to extract.
  - Pattern: `src/components/analytics/CompletedTasksLog.tsx:16-29,31-71` — current month-option and range filter logic to extract and fix.
  - API/Type: `src/hooks/usePomodoroHistory.tsx:4-9` — `PomodoroSession` contract.
  - API/Type: `src/hooks/useTasks.tsx:6-14` — `Task` contract.
  - Test: `src/hooks/usePomodoroHistory.test.ts:16-251` — unit-test style for pure logic and date mocking.
  - Test: `src/test/test-utils.tsx:60-66` — `mockDateNow` helper pattern.
  - External: `https://date-fns.org/` — inclusive range helpers and month boundary behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] All analytics range, aggregation, and month-option logic lives in selector modules under `src/features/analytics/selectors/`.
  - [ ] The selector API supports `7d`, `30d`, `90d`, and `month` page presets.
  - [ ] Selectors return safe values for empty datasets and orphaned `taskId` references.
  - [ ] `npm run test:run -- src/features/analytics/selectors/sessionSelectors.test.ts src/features/analytics/selectors/taskSelectors.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Session and task selectors compute stable analytics outputs
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/selectors/sessionSelectors.test.ts src/features/analytics/selectors/taskSelectors.test.ts`; cover 30-day summary, 90-day trends, month filtering, and recent-session task mapping.
    Expected: Tests pass with deterministic results using mocked dates.
    Evidence: .sisyphus/evidence/task-2-selectors.txt

  Scenario: Edge cases do not crash or silently drop valid boundary records
    Tool: Bash
    Steps: In selector tests, include empty arrays, tasks completed exactly on the range boundary, and sessions whose `taskId` has no matching task.
    Expected: Boundary records are included, empty states return zero-value models, and orphaned tasks are labeled as unlinked rather than throwing.
    Evidence: .sisyphus/evidence/task-2-selectors-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): extract pure analytics selectors` | Files: `src/features/analytics/types.ts`, `src/features/analytics/selectors/*`, selector tests

- [x] 3. Introduce a read-only productivity data hook with explicit reload support

  **What to do**: Add `src/features/analytics/hooks/useProductivityData.ts` as the only analytics-layer module that talks to persistence. It must initialize IndexedDB, reuse migration checks from the task data flow, load `tasks`, `pomodoroHistory`, and relevant settings in one `reload()` path, and expose `{ tasks, sessions, settings, isLoading, error, reload }`. Keep the hook read-only for analytics; backup actions will call `reload()` rather than mutating route state manually.
  **Must NOT do**: Do not reuse `useTasks()` or `usePomodoroHistory()` inside analytics. Do not write back to IndexedDB from this hook. Do not trigger toasts on successful background loads.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: persistence boundary design and async state handling.
  - Skills: `[]` — no extra skill required.
  - Omitted: `quick` — error states and migration behavior make this more than a trivial edit.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [4, 8, 9, 10] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/hooks/useTasks.tsx:16-18,22-49,54-70` — existing initialization, migration, and persistence-loading behavior.
  - Pattern: `src/hooks/usePomodoroHistory.tsx:11-20,40-58` — existing history-loading structure and return shape.
  - API/Type: `src/lib/indexeddb.ts:38-79,95-165,167-243` — IndexedDB init, getters, export/import behavior, and stored settings shape.
  - Test: `src/hooks/usePomodoroHistory.test.ts:7-14,30-57,144-181` — mocking persistence and validating error handling.
  - Test: `src/test/setup.ts:5-36` — fake IndexedDB and localStorage environment.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `useProductivityData()` exposes a stable `reload()` method that refreshes analytics data without full-page reloads.
  - [ ] The hook returns explicit loading and error states.
  - [ ] The hook reads from IndexedDB and settings without writing on mount.
  - [ ] `npm run test:run -- src/features/analytics/hooks/useProductivityData.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: reload() refreshes analytics data from persistence
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/hooks/useProductivityData.test.ts`; mock a first DB response, then a second response after calling `reload()`.
    Expected: The hook updates tasks/sessions/settings to the second response without recreating the page or calling `window.location.reload()`.
    Evidence: .sisyphus/evidence/task-3-productivity-hook.txt

  Scenario: IndexedDB failure surfaces a safe error state
    Tool: Bash
    Steps: In the same test file, mock `dorofyDB` getters to reject.
    Expected: The hook sets `error`, stops loading, and returns empty-safe data rather than throwing.
    Evidence: .sisyphus/evidence/task-3-productivity-hook-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): add productivity data hook` | Files: `src/features/analytics/hooks/useProductivityData.ts`, tests

- [x] 4. Build the analytics page view-model hook around shared filters

  **What to do**: Add `src/features/analytics/hooks/useAnalyticsPage.ts` that consumes `useProductivityData()` and the selector modules, owns all page filters, and returns page-ready view models for session summary, session trend, recent sessions, completed tasks, month options, loading/error states, and backup refresh callbacks. Set the default preset to `30d`, default chart metric to `minutes`, and auto-repair stale month state by snapping `selectedMonth` to the newest available month when the current month selection disappears after reload/filter changes.
  **Must NOT do**: Do not duplicate selector logic inside the hook. Do not give child components direct access to raw DB APIs. Do not allow section-level local filter state to diverge from page filter state.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: this is the main orchestration seam for the redesign.
  - Skills: `[]` — orchestration follows repository patterns plus selector contracts.
  - Omitted: `visual-engineering` — the hook is data orchestration, not presentation.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [5, 6, 7, 9, 10] | Blocked By: [2, 3]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/AnalyticsSheet.tsx:18-22,71-103` — current top-level analytics state and composition to replace with hook output.
  - Pattern: `src/components/analytics/CompletedTasksLog.tsx:31-35,64-71,74-120` — section-level filter state that must move into the page hook.
  - Pattern: `src/components/analytics/DailyPomodoroChart.tsx:6-10,12-33` — current metric + range inputs that become view-model props.
  - Pattern: `src/components/analytics/SummaryStats.tsx:9-15` — current summary component input shape to simplify.
  - API/Type: `src/features/analytics/selectors/sessionSelectors.ts` — use extracted pure selector outputs.
  - API/Type: `src/features/analytics/selectors/taskSelectors.ts` — use extracted completed-task and month outputs.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `useAnalyticsPage()` is the single owner of analytics filter state.
  - [ ] Default view is `30d` + `minutes`.
  - [ ] Stale `selectedMonth` values self-heal to the newest available month.
  - [ ] `npm run test:run -- src/features/analytics/hooks/useAnalyticsPage.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Page hook returns stable view models from shared filters
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/hooks/useAnalyticsPage.test.ts`; assert default filters, metric switching, and shared updates across summary/trend/completed-task outputs.
    Expected: All sections react to one filter source of truth.
    Evidence: .sisyphus/evidence/task-4-page-hook.txt

  Scenario: Removed month selection self-repairs after reload
    Tool: Bash
    Steps: In the same test file, select a month present in the first dataset, then reload with data that no longer contains that month.
    Expected: `selectedMonth` resets to the newest available month and no component receives `undefined` month labels.
    Evidence: .sisyphus/evidence/task-4-page-hook-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): add analytics page view model hook` | Files: `src/features/analytics/hooks/useAnalyticsPage.ts`, tests

- [x] 5. Redesign the analytics page around session analysis sections

  **What to do**: Build the new analytics UI components under `src/features/analytics/components/` and render them from `src/pages/Analytics.tsx` using `useAnalyticsPage()`. The page must be structured in this order: page header/navigation, primary session summary cards, primary session trend chart, secondary recent-sessions/task-linked session list, secondary completed-task insights, and final backup panel. Keep the page route-based and full-width rather than sheet-based. Reuse the existing visual language (`GlassCard`, `GlassBadge`, `GlassButton`) but remove sheet-specific framing and controls.
  **Must NOT do**: Do not reintroduce `GlassSheet`. Do not place backup above the session-analysis sections. Do not let presentational components fetch or transform raw data.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: this is the primary UI redesign task with a new page layout.
  - Skills: `[]` — existing component library is sufficient.
  - Omitted: `quick` — the redesign spans multiple UI modules.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [9, 10] | Blocked By: [4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/AnalyticsSheet.tsx:23-103` — current analytics section order and existing cards to supersede.
  - Pattern: `src/components/analytics/SummaryStats.tsx:38-60` — current KPI card visual structure to reuse stylistically, not architecturally.
  - Pattern: `src/components/analytics/DailyPomodoroChart.tsx:35-61` — current chart presentation and Recharts usage.
  - Pattern: `src/components/analytics/CompletedTasksLog.tsx:72-155` — current completed-task card pattern and empty state.
  - Pattern: `src/components/Timer.tsx:165-244` — current glass-surface hero style to borrow for high-emphasis sections.
  - API/Type: `src/features/analytics/hooks/useAnalyticsPage.ts` — the only allowed page-data source.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/analytics` renders session analysis as the first and visually dominant section.
  - [ ] No analytics component imports `dorofyDB`, `useTasks`, or `usePomodoroHistory` directly.
  - [ ] The page uses route-page layout, not sheet or modal layout.
  - [ ] `npm run test:run -- src/pages/Analytics.layout.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Analytics page renders redesigned session-first layout
    Tool: Bash
    Steps: Run `npm run test:run -- src/pages/Analytics.layout.test.tsx`; assert that session summary and trend sections render before completed tasks and backup.
    Expected: The analytics page has a deterministic, session-first DOM order and no sheet container markup.
    Evidence: .sisyphus/evidence/task-5-layout.txt

  Scenario: Empty analytics data shows safe empty states across sections
    Tool: Bash
    Steps: In the same test file, mock the page hook with empty tasks and empty sessions.
    Expected: Session summary renders zero values, trend area renders an empty-safe state, completed tasks show a no-data message, and the page does not crash.
    Evidence: .sisyphus/evidence/task-5-layout-error.txt
  ```

  **Commit**: NO | Message: `feat(analytics): redesign analytics page layout` | Files: `src/pages/Analytics.tsx`, `src/features/analytics/components/*`, tests

- [x] 6. Replace the chart section with selector-fed session trend and recent-session views

  **What to do**: Rebuild the chart section to consume selector-fed trend data from `useAnalyticsPage()` and add a session-focused secondary view showing recent sessions with duration, completion time, and linked task title or an explicit “No linked task” label. Support both `minutes` and `sessions` metrics from shared page state. Preserve Recharts unless a concrete technical limitation forces replacement.
  **Must NOT do**: Do not compute chart series inside the chart component. Do not hide orphaned-task sessions. Do not invent new persistence fields.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: combines data visualization and session-centric UI treatment.
  - Skills: `[]` — existing Recharts dependency is already installed.
  - Omitted: `unspecified-high` — the main complexity is UI presentation over already-defined data contracts.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [9, 10] | Blocked By: [4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/analytics/DailyPomodoroChart.tsx:1-65` — current Recharts configuration and metric toggle semantics.
  - Pattern: `src/hooks/usePomodoroHistory.tsx:4-9` — session shape used to derive recent-session display fields.
  - Pattern: `src/components/analytics/SummaryStats.tsx:31-36` — existing session-centric KPI language for continuity.
  - API/Type: `src/features/analytics/selectors/sessionSelectors.ts` — required source for trend and recent-session outputs.
  - External: `https://recharts.org/en-US/api/BarChart` — existing chart dependency behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Chart data is supplied exclusively by selector/view-model outputs.
  - [ ] Metric switching updates the trend section without changing the page filter source of truth.
  - [ ] Recent sessions render task-linked and task-orphaned entries explicitly.
  - [ ] `npm run test:run -- src/features/analytics/components/SessionTrendSection.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Metric toggle updates the session trend section
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/components/SessionTrendSection.test.tsx`; click the minutes/sessions controls wired through the page hook.
    Expected: The trend legend/labels update correctly and the rendered section reflects the selected metric.
    Evidence: .sisyphus/evidence/task-6-session-trend.txt

  Scenario: Orphaned sessions remain visible and labeled safely
    Tool: Bash
    Steps: In the same test file, supply recent-session view models containing a `taskId` with no matching task.
    Expected: The session row renders with an explicit fallback label such as `No linked task`, not blank text or a crash.
    Evidence: .sisyphus/evidence/task-6-session-trend-error.txt
  ```

  **Commit**: NO | Message: `feat(analytics): add session analysis sections` | Files: session trend/recent-session components, tests

- [x] 7. Rebuild completed-task insights as a secondary analytics section

  **What to do**: Replace the old `CompletedTasksLog` with a redesigned completed-task insights section under `src/features/analytics/components/`, driven entirely by page-hook outputs. Keep it secondary to session analysis. Support shared page presets and month selection from the page hook instead of owning local range state. Preserve virtualization only if the new design still needs it after restructuring; otherwise simplify to a normal list if performance remains acceptable.
  **Must NOT do**: Do not keep independent `range` or `selectedMonth` state in the task section. Do not leave the old `forcedRangeDays` API in place. Do not silently exclude boundary-day task completions.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: UI restructure plus shared-filter wiring.
  - Skills: `[]` — existing UI and list patterns are sufficient.
  - Omitted: `quick` — this involves behavioral API changes and state-contract cleanup.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [9, 10] | Blocked By: [2, 4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/analytics/CompletedTasksLog.tsx:11-16,31-71,122-153` — current props, filters, empty state, and list behavior to replace.
  - Pattern: `src/components/analytics/CompletedTasksLog.tsx:127-151` — current `react-virtuoso` usage and item card structure.
  - API/Type: `src/features/analytics/hooks/useAnalyticsPage.ts` — shared filter and completed-task outputs.
  - API/Type: `src/features/analytics/selectors/taskSelectors.ts` — completed-task and month-option contracts.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Completed-task insights consume shared page filters only.
  - [ ] Month selection appears only when the active preset is `month`.
  - [ ] Boundary-day task completions are included correctly.
  - [ ] `npm run test:run -- src/features/analytics/components/CompletedTaskInsights.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Completed-task section follows the shared page filter model
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/components/CompletedTaskInsights.test.tsx`; render the section with the page hook wrapper and switch presets.
    Expected: The section updates from the shared filter state without maintaining duplicate local filter state.
    Evidence: .sisyphus/evidence/task-7-completed-tasks.txt

  Scenario: Specific-month filtering includes tasks completed on the first and last day of the month
    Tool: Bash
    Steps: In the same test file, provide tasks completed exactly at the start and end boundaries of a target month.
    Expected: Both tasks remain visible for that month and tasks outside the month are excluded.
    Evidence: .sisyphus/evidence/task-7-completed-tasks-error.txt
  ```

  **Commit**: NO | Message: `feat(analytics): rebuild completed task insights` | Files: completed-task analytics components, tests

- [x] 8. Convert backup tools into analytics-scoped refreshable actions

  **What to do**: Move backup UI into the analytics feature as a page-scoped panel, preserving export/import/clear capabilities but replacing every hard reload with the explicit `reload()` callback from `useProductivityData()`. Remove the delayed `setTimeout(() => window.location.reload())` behavior. After import or clear, refresh analytics data in-place and keep the user on `/analytics`. Preserve destructive confirmations and error toasts.
  **Must NOT do**: Do not leave `window.location.reload()` anywhere in analytics code. Do not move backup outside analytics. Do not broaden backup scope to include route navigation or timer persistence redesign.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: mixes persistence side effects, UX guarantees, and regression risk.
  - Skills: `[]` — current backup implementation is local.
  - Omitted: `visual-engineering` — correctness of side effects matters more than styling here.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [9, 10] | Blocked By: [3]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/BackupSystem.tsx:12-89` — current export/import/clear logic and all reload side effects to replace.
  - API/Type: `src/lib/indexeddb.ts:167-243` — export/import/clear DB contracts.
  - API/Type: `src/features/analytics/hooks/useProductivityData.ts` — `reload()` contract for in-place refresh.
  - Test: `src/test/setup.ts:9-36` — localStorage and browser API mocks.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Analytics backup actions no longer call `window.location.reload()`.
  - [ ] Import and clear both refresh analytics data in-place by calling `reload()`.
  - [ ] Export still produces a download file with the existing backup schema.
  - [ ] `npm run test:run -- src/features/analytics/components/BackupPanel.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Import refreshes analytics data without leaving the route
    Tool: Bash
    Steps: Run `npm run test:run -- src/features/analytics/components/BackupPanel.test.tsx`; mock a file import and a successful DB import.
    Expected: The panel calls `reload()`, shows success feedback, and does not call `window.location.reload()`.
    Evidence: .sisyphus/evidence/task-8-backup.txt

  Scenario: Invalid import file fails gracefully
    Tool: Bash
    Steps: In the same test file, supply malformed JSON or a backup payload missing `version`/`timestamp`.
    Expected: An error toast appears, `reload()` is not called, and the file input resets.
    Evidence: .sisyphus/evidence/task-8-backup-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): refresh backup flows in place` | Files: backup analytics component(s), tests

- [x] 9. Integrate the analytics page, add timer-running route guard, and remove legacy analytics surface

  **What to do**: Wire the completed redesigned analytics feature into `src/pages/Analytics.tsx`, update `Header`/`Index` navigation to use the final route behavior, and remove the legacy `src/components/AnalyticsSheet.tsx` surface once the page is feature-complete. Add an explicit navigation guard: when the timer on `/` is running and the user triggers analytics navigation, show a confirmation explaining that leaving the timer page stops/resets the current session; only navigate on confirmation. Keep timer scope local to `/`; do not promote timer state above routes.
  **Must NOT do**: Do not preserve background timer continuity across route changes. Do not leave dead analytics imports or callbacks in `Index.tsx`. Do not silently navigate away while the timer is running.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: final cross-cutting integration and lifecycle guard.
  - Skills: `[]` — this is repo-specific orchestration.
  - Omitted: `quick` — multiple high-risk files and behavior changes are involved.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [10] | Blocked By: [1, 2, 3, 4, 5, 6, 7, 8]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/pages/Index.tsx:73-80,100-110,121-123,135-138,255-264` — timer ownership, unload guard, active task counts, header wiring, and legacy analytics render.
  - Pattern: `src/hooks/useTimer.tsx:35-59,63-89,210-260` — timer lifecycle and localStorage-backed running state behavior.
  - Pattern: `src/components/Header.tsx:15-23,40-57` — analytics button placement and prop surface.
  - Pattern: `src/components/AnalyticsSheet.tsx:1-109` — entire legacy surface to remove after replacement.
  - API/Type: `src/pages/Analytics.tsx` — final route shell entry point.
  - External: `https://reactrouter.com/en/main/hooks/use-navigate` — navigation API if used.

  **Acceptance Criteria** (agent-executable only):
  - [ ] The legacy analytics sheet component is removed from runtime usage; no code path renders it.
  - [ ] Triggering analytics while the timer is running prompts for confirmation before navigation.
  - [ ] Canceling the confirmation keeps the user on `/` with the timer unchanged.
  - [ ] Confirming the navigation moves to `/analytics`.
  - [ ] `npm run test:run -- src/pages/Index.analytics-navigation.test.tsx src/pages/Analytics.integration.test.tsx` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Timer-running navigation requires explicit confirmation
    Tool: Bash
    Steps: Run `npm run test:run -- src/pages/Index.analytics-navigation.test.tsx`; mock the timer as running, click the analytics trigger, stub `window.confirm`, and exercise cancel/confirm branches.
    Expected: Cancel keeps the current route and confirm changes to `/analytics`.
    Evidence: .sisyphus/evidence/task-9-navigation-guard.txt

  Scenario: Legacy sheet path is fully removed
    Tool: Bash
    Steps: In `src/pages/Analytics.integration.test.tsx`, render the app and assert no analytics sheet container/title from the old component appears in the DOM after navigation.
    Expected: The app shows only the route-based analytics page and no sheet-based fallback.
    Evidence: .sisyphus/evidence/task-9-navigation-guard-error.txt
  ```

  **Commit**: NO | Message: `refactor(analytics): finalize route integration` | Files: `src/pages/Index.tsx`, `src/components/Header.tsx`, `src/pages/Analytics.tsx`, legacy analytics removal, integration tests

- [x] 10. Add full analytics regression coverage and align docs to the new route behavior

  **What to do**: Finish analytics coverage across selectors, hooks, route shell, major sections, backup actions, and route guard; then update `README.md` so analytics documentation matches the new route-based design and redesigned filters. The README must stop describing analytics as a sheet and explain how to reach `/analytics`. Ensure test files use the existing RTL utilities and maintain the project’s naming/style conventions.
  **Must NOT do**: Do not leave stale README sheet instructions. Do not weaken coverage thresholds. Do not add broad CI infrastructure work.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: combines regression proof and documentation accuracy.
  - Skills: `[]` — existing test/doc patterns are enough.
  - Omitted: `writing` — docs are small; the main weight is verification completeness.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [Final Verification Wave] | Blocked By: [1, 2, 3, 4, 5, 6, 7, 8, 9]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `vitest.config.ts:8-31` — jsdom and 80% global coverage thresholds.
  - Pattern: `package.json:6-15` — test, coverage, lint, and build commands.
  - Pattern: `src/test/test-utils.tsx:1-67` — project test wrapper and helper utilities.
  - Pattern: `README.md:60-68` — stale analytics sheet instructions to rewrite.
  - Test: all analytics test files created in Tasks 1-9 — ensure they still pass as a complete suite.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run test:coverage` passes with no threshold regressions.
  - [ ] `npm run build` passes.
  - [ ] `npm run lint` passes.
  - [ ] README analytics instructions reference the route/page instead of a sheet.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Full analytics verification suite passes under project thresholds
    Tool: Bash
    Steps: Run `npm run test:coverage`.
    Expected: Coverage completes successfully and respects the existing 80% global thresholds.
    Evidence: .sisyphus/evidence/task-10-coverage.txt

  Scenario: Final build, lint, and docs align with the route-based redesign
    Tool: Bash
    Steps: Run `npm run build && npm run lint`; then verify README content through tests or direct assertions in a docs check if one is added.
    Expected: Build and lint succeed, and README no longer mentions opening an analytics sheet from the header.
    Evidence: .sisyphus/evidence/task-10-build-lint-error.txt
  ```

  **Commit**: YES | Message: `refactor(analytics): move analytics to route-based session dashboard` | Files: analytics feature files, tests, README.md

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- No per-task commits during implementation.
- Create one final commit only after Tasks 1-10 pass, the Final Verification Wave passes, and the user explicitly approves completion.
- Recommended final commit message: `refactor(analytics): move analytics to route-based session dashboard`

## Success Criteria
- The analytics experience is accessed at `/analytics`, not through a sheet.
- Route navigation, refresh behavior, and backup refreshes work without app-wide reloads.
- Analytics calculations live in pure selector modules with direct unit coverage.
- Page components are presentational and consume view-model props only.
- Session analysis is visibly primary; completed tasks and backup are secondary.
- Existing build, lint, and coverage requirements still pass.
