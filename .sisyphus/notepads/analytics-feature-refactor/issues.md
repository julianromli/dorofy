
## 2026-03-22 Known issues / guardrails
- Current analytics duplicates filtering responsibility between `AnalyticsSheet.tsx` and `CompletedTasksLog.tsx`.
- `CompletedTasksLog.tsx` month filtering uses exclusive date helpers and can drop exact boundary values.
- `selectedMonth` is only initialized once and can become stale when task data changes.
- `BackupSystem.tsx` still uses `window.location.reload()`; replacement is deferred to Task 8.
- Navigation while timer is running is unresolved on purpose until Task 9; do not broaden Wave 1 into timer continuity work.
- Hands-on QA note: navigating from `/` to `/analytics` keeps the old timer page title, while direct-loading `/analytics` shows the default app title. Not a Task 1 blocker, but the dedicated analytics page should eventually own its document title.
- Task 5: BackupSystem still utilizes `window.location.reload()` which forces a full app reload upon import. This should be addressed in the later planned tasks for backup redesign.
- Task 5 Fix: Recharts chart series structure requires checking `.some(p => p.value > 0)` for an explicit fallback when all data points evaluate to zero. Fixed in `AnalyticsTrendChart.tsx`.

## 2026-03-22 Task 8 QA notes
- Playwright import QA on `/analytics` confirmed the route stayed on `/analytics` and the page refreshed in place after upload; the visible recent-session and completed-task sections updated without any navigation.
- Playwright clear-path verification was partially limited by the wrapper's confirm-dialog handling, so destructive clear behavior was fully covered in focused component tests instead.

## 2026-03-22 Task 9 QA note
- Attempted hands-on Playwright QA against a live local Vite server for the `/` timer guard and `/analytics` route, but this environment exposes the `npx playwright` CLI without an importable `playwright`/`@playwright/test` package for scripted execution on Windows. Focused Vitest route tests, typecheck, and production build all passed; browser automation remains blocked by tool packaging rather than app behavior.

## 2026-03-23 Backup boundary compliance verification note
- This repo currently has no `npm run typecheck` script in `package.json`; `npx tsc --noEmit -p tsconfig.app.json` surfaces unrelated pre-existing TypeScript errors outside the analytics backup files, so changed-file validation relied on `lsp_diagnostics`, focused Vitest coverage, and a successful production build.

## 2026-03-23 F3 final manual QA note
- Fresh local QA against `npm run dev` on `http://127.0.0.1:4175/analytics` returned HTTP 200 and rendered the current analytics route successfully; full-page capture showed session-first ordering (`Session Summary` -> `Focus sessions` -> `Recent sessions` -> `Completed tasks log` -> `Backup and restore`).
- This Windows environment still exposes the `npx playwright` CLI without an importable `playwright` package for scripted interaction, so the range dropdown and confirm dialogs could not be driven programmatically even though screenshots worked.
- `src/pages/Analytics.tsx` currently includes `Last 7 days`, `Last 30 days`, `Last 90 days`, and `Specific month` in the range `SelectContent`; live capture showed `Last 30 days` selected by default rather than the expanded option list.
- Narrow fallback tests passed for the blocked branches: `src/pages/Index.analytics-navigation.test.tsx`, `src/features/analytics/components/BackupPanel.test.tsx`, and `src/pages/Analytics.layout.test.tsx`. Production build also passed.
