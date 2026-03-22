## 2026-03-23 F4 scope fidelity review blockers
- `src/pages/Analytics.tsx` exposes only `7d`, `30d`, and `month` in the route-level range selector even though the plan requires the shared preset model to support `7d | 30d | 90d | month` end-to-end for the analytics page.
- `src/features/analytics/components/BackupPanel.tsx` imports and calls `dorofyDB` directly for export/import/clear, which conflicts with the Task 5 acceptance guard that no analytics component should import `dorofyDB` directly.
