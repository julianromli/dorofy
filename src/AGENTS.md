# SOURCE TREE GUIDE

## OVERVIEW
`src/` holds the runtime app: bootstrap, routes, shared primitives, app composites, hooks, storage helpers, tests, and the analytics feature slice.

## STRUCTURE
```text
src/
├── main.tsx                 # DOM mount + service worker registration
├── App.tsx                  # Global providers + route registry
├── pages/                   # Route shells
├── components/              # App composites + glass wrapper layer
├── components/ui/           # Shared primitives; see local AGENTS.md
├── features/analytics/      # Feature slice; see local AGENTS.md
├── hooks/                   # Shared app hooks
├── lib/                     # Utilities, browser helpers, persistence
└── test/                    # Shared Vitest setup and render utilities
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add or change routes | `App.tsx`, `pages/` | Keep route registration in `App.tsx`; keep page shells thin |
| Home/timer experience | `pages/Index.tsx`, `components/`, `hooks/` | `Index.tsx` composes many app-level pieces |
| Analytics page | `pages/Analytics.tsx` + `features/analytics/` | Route file composes feature view models and sections |
| Shared low-level UI | `components/ui/` | Update primitives here instead of cloning them in features |
| Glass-specific wrappers | `components/glass/index.tsx` | Project-specific visual wrappers used across pages/components |
| Persistence and backup contracts | `lib/indexeddb.ts` | IndexedDB stores, export/import/clear, migration helpers |
| Shared browser/test helpers | `lib/browser-capabilities.ts`, `test/` | Capability detection, test render wrappers, fake timers/date |

## SOURCE CONVENTIONS
- `main.tsx` should stay tiny: mount the app, import global CSS, register app-wide runtime hooks like the service worker.
- `App.tsx` owns global providers and route registration. Do not scatter router/provider setup into page files.
- `pages/` are route shells. New business logic should move into hooks, selectors, or feature/app components instead of growing route files further.
- `components/` is for app-specific composition, not generic primitives. If a button/input/select/card pattern needs reuse across features, promote it to `components/ui/`.
- `hooks/` is for shared app hooks. Feature-local hooks stay with the feature slice.
- `lib/` is the place for foundational helpers and storage/browser boundaries; pages and presentational components should not grow low-level persistence code.

## TESTING
- Shared browser shims live in `test/setup.ts`.
- Shared render helpers live in `test/test-utils.tsx`; prefer them over ad-hoc provider setup.
- Tests are usually co-located with the file or slice they exercise.
- Page-level behavior gets page tests in `pages/`; deeper feature logic gets tests next to selectors/hooks/components.

## ANTI-PATTERNS
- Do not import runtime code from `.sisyphus/` or generated output folders.
- Do not put analytics derivation logic directly in `pages/Analytics.tsx`; keep it in the analytics slice.
- Do not duplicate UI primitives in feature directories when `components/ui/` already owns the pattern.

## NOTES
- `pages/Index.tsx` is already a broad integration point. Prefer extracting new logic outward, not adding more local state there unless it is truly route-only.
- `docs/design-system.md` explains visual intent; `components/glass/index.tsx` is the actual wrapper API that enforces it.
