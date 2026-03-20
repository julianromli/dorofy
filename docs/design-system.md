# Dorofy Design System 🎨

Dorofy is designed to be a highly premium, distraction-free Pomodoro companion. The entire visual language is anchored in an **Apple-inspired "Liquid Glass" (VisionOS style)** aesthetic, prioritizing translucency, soft depth, specular borders, and dynamic ambiance.

This document outlines the core principles, CSS variables, and building blocks of the Dorofy UI.

---

## 1. Core Aesthetics & Philosophy ✨

- **Liquid Translucency**: Solid colors are almost completely avoided for surface backgrounds; instead, everything relies on `backdrop-filter: blur(...)` combined with translucent `rgba` or color-mixed fills.
- **Specular Edge Highlights**: True glass doesn't have a flat solid 1px border. We use a dual-stroke technique (`var(--glass-stroke)`) that provides an intense white inner reflection on the top edge and a faint shadow on the bottom edge.
- **Deep Glow & Shadows**: Dropshadows are soft and wide (`--glass-shadow`), giving cards a feeling of floating directly above the dynamic desktop.
- **Dynamic Context**: The dominant accent colors globally shift based on the user's timer mode (Focus vs. Break), communicating state through peripheral vision.

---

## 2. Color Primitives & Semantics 🖌️

Dorofy builds upon standard HSL-based Tailwind variables (similar to Shadcn UI), but shifts everything toward a translucent glass aesthetic. 

### Theme Modes (Dynamic Accents)
Each Pomodoro mode updates the global `--mode-accent` CSS variable, which completely transforms active buttons, glowing borders, and background gradients.
- 🔴 **Pomodoro (Deep focus):** Warm Coral/Red `hsl(12 82% 64%)`
- 🔵 **Short Break:** Serene Blue `hsl(213 86% 64%)`
- 🟢 **Long Break:** Restful Green `hsl(170 64% 46%)`

### Base Colors
- `--background`, `--foreground`: Minimal contrast, mostly acts as the absolute back wall for non-custom image states.
- `--card-bg`, `--card-border`: Specifically tuned translucent values for light/dark modes to maintain legibility.
- `--text-muted`: Softened text for secondary labels to avoid harsh contrast on glass panels.

---

## 3. Glass Variables & Tokens 🪟

These are the secret sauce of Dorofy's UI, located in `src/styles/glass-theme.css`:

### Blurs
Used for `backdrop-filter`:
- `--glass-blur-sm`: `12px` (chips, active tasks)
- `--glass-blur-md`: `20px` (standard panels, buttons)
- `--glass-blur-lg`: `34px` (sidebars, major overlays)

### Borders & Strokes
- `--card-border`: The outer bounding line (e.g., `rgba(255,255,255,0.16)` in Dark Mode).
- `--glass-stroke`: The signature Apple inner reflection string:
  ```css
  inset 0 1px 0 rgba(255, 255, 255, 0.75), 
  inset 0 -1px 0 rgba(255, 255, 255, 0.25)
  ```

### Shadows & Glows
- `--glass-shadow-strong`: `0 40px 120px rgba(2, 6, 23, 0.56)` — Used for Hero sections to pull them forward visually.
- `--glow-primary`: Outer glow mixed with the active primary mode color.

---

## 4. Core Glass Components 🧩

Dorofy offers pre-made CSS layers/classes and React component wrappers to maintain consistency.

### CSS Classes

| Class Name | Usage | Visual Characteristics |
| :--- | :--- | :--- |
| `.glass-panel` | Standard cards, navbars, settings windows. | Medium blur (`md`), `border`, `--glass-stroke`, linear gradient top-down. |
| `.liquid-glass-shell` | Specialized wrapper for the main Timer. | Contains raw displacement canvas backdrop, mimics refraction visually. |
| `.glass-sidebar` | Off-canvas sidebars (Tasks, Music). | Heavy blur (`lg`), `glass-shadow-strong`, identical stroke to `.glass-panel`. |
| `.glass-floating-button` | Circular tool buttons (bottom-left). | Medium blur, floating drop-shadow, inner stroke reflection. |
| `.glass-chip` | Small metadata badges. | Subtle translucent fill, small blur, rounded pill shape. |
| `.glass-input-shell` | Text inputs & textareas. | Specialized inner drop-shadow to look indented inside the glass. |

### React Wrappers (`@/components/glass/index.tsx`)

- `<LiquidGlassSurface />`: A wrapper specifically engineered for the Hero/Timer module. Automatically injects a WebGL Liquid Glass `<canvas>` if the browser supports it, falling back to standard CSS blur natively.
- `<GlassCard />`: Your go-to component for generic layout boxes. Maps directly to `.glass-panel` and accepts `variant` props (`default`, `elevated`, `dense`).
- `<GlassButton />`: A universal, standalone interactable button. **Architectural Note:** All variants (excluding `ghost`) internally map to `<VendorButtonGlass variant="ghost">` but are injected with Custom Pill Aesthetics (e.g. `glass-mode-accent` or `glass-fallback`) combined with `--glass-stroke` and drop-shadows. This enforces the sleek Apple VisionOS capsule style on *every* button universally across the project, eliminating flat opaque backgrounds.
- `<GlassBadge />`: Replaces typical solid badges with `.glass-chip` aesthetics.

---

## 5. Layout & UX Patterns 📐

- **Distraction-Free Center**: The main canvas should only ever show the most critical active information (`Focus Timer` and `Active Task`). 
- **Sidebars over Modals**: Deep interactions (managing the task list, picking a background, changing music) slide in from the screen edges (usually left) instead of blocking the screen with intrusive center-screen portals/modals. This keeps the Timer perpetually clickable.
- **Symmetry**: Layouts balance out columns heavily. Modals or tools anchor on global boundaries (like the `bottom-left` icon stack) uniformly spaced (`-60px`, `-120px`, `-180px` translations).
- **Smooth Animations**: Every appearance has an `.animate-fade-in` or uses `framer-motion` to smoothly transition coordinates on the Y-axis.

---

*This design system is a living document and scales alongside Dorofy's feature set.*
