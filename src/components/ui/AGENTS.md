# UI PRIMITIVE LAYER GUIDE

## OVERVIEW
`src/components/ui/` is the shared primitive layer. Most files follow the shadcn-style pattern: one primitive per file, typed props, `forwardRef`, `cn()`, and optional `cva()` variants.

## WHERE TO LOOK
| Need | File | Notes |
|------|------|-------|
| Button variants / `asChild` baseline | `button.tsx` | Canonical `Slot` + `cva` pattern |
| Basic compound section pattern | `card.tsx` | Useful baseline for simple composed primitives |
| Select / popover-like controls | `select.tsx` | Shared low-level control used on analytics page |
| Tooltip plumbing | `tooltip.tsx` | Also mounted globally through `TooltipProvider` |
| Legacy Radix toast path | `toast.tsx`, `toaster.tsx` | Backed by `hooks/use-toast.ts` |
| Sonner path | `sonner.tsx` | Theme-aware wrapper mounted in `App.tsx` |
| Complex layout primitive | `sidebar.tsx` | Large custom compound primitive with its own provider/hook |

## LOCAL CONVENTIONS
- Keep primitives generic. Business logic belongs in app or feature components, not here.
- Reuse `cn()` from `@/lib/utils` for class merging.
- Use `React.forwardRef` for exported primitives unless the file is intentionally a plain wrapper.
- When a primitive supports element substitution, keep using `Slot`/`asChild` instead of forking duplicate variants.
- Prefer `cva()` for repeatable variant systems; keep one-off state styling readable with `data-*` attributes and class names.
- If a feature needs a new primitive capability, extend the primitive here rather than cloning button/input/card/select patterns elsewhere.

## SIDEBAR IS THE EXCEPTION
- `sidebar.tsx` is not a tiny primitive; treat it like a local subsystem.
- It owns `SidebarProvider` and `useSidebar()`. Consumers should not recreate sidebar state outside that API.
- It handles desktop vs mobile behavior internally, including the keyboard shortcut and sheet fallback.
- It exports many compound pieces (`SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu*`, etc.). Keep new sidebar work inside that composition model instead of inventing parallel markup.

## TOAST / NOTIFICATION RULES
- This repo currently mounts both `Toaster` and `Sonner` in `App.tsx`.
- `toaster.tsx` is the local Radix toast renderer backed by `hooks/use-toast.ts`.
- `sonner.tsx` is the theme-aware Sonner wrapper.
- Follow the notification path already used by nearby code; do not introduce a third toast mechanism.

## OUT OF SCOPE
- Global visual philosophy belongs in `docs/design-system.md`.
- Project-specific glass wrappers belong in `src/components/glass/index.tsx`, not in this directory.
- Feature composition belongs outside `components/ui/`.

## ANTI-PATTERNS
- Do not recreate basic primitives inside feature folders.
- Do not add app-specific storage, routing, or analytics logic here.
- Do not bypass the sidebar provider/hook contract when editing sidebar behavior.
