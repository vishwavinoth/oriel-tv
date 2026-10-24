# ADR 0004: Oriel Glass material system

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

PRD section 4.3 makes a Liquid Glass-inspired design mandatory. Apple's published guidance for Liquid Glass describes principles that translate well to a TV: glass is a functional layer for controls and navigation that floats above content, it has a more opaque form for surfaces that carry text and a more transparent form over media, glass is not stacked on glass, color is used sparingly in controls, and accessibility settings can reduce or remove transparency.

Apple's implementation is native to Apple platforms. Oriel runs on Android and the web, so it needs its own implementation of the same ideas, under its own name.

## Decision

Oriel defines its own material system, **Oriel Glass**, with these rules.

1. **Two layers.** Wallpaper, app tiles, artwork, and page sections belong to the content layer. Glass is reserved for the functional layer: the top bar, the dock, the settings panel, dialogs, toasts, and focused controls.
2. **Two variants.**
   - `regular`: stronger blur and a tinted base, for surfaces that carry text, such as the settings panel, dialogs, and the website navigation.
   - `clear`: lighter blur and higher translucency, for small controls that float over wallpaper or media. Over bright backgrounds it adds a dimming layer.
3. **No glass on glass.** A glass surface never sits on another glass surface. Controls inside a glass panel use tinted fills, not glass of their own.
4. **Group related controls** in one shared glass container instead of many separate glass pills.
5. **Concentric corners.** An inner element's corner radius equals its container's radius minus the padding between them.
6. **Focus becomes glass on TV.** App tiles are content. When a tile gains focus, it scales up slightly and gains a light edge and a soft shadow. This is the TV equivalent of a control taking on glass while someone interacts with it.
7. **Fallbacks.**
   - Web: `backdrop-filter` with a solid fallback where it is unsupported. Surfaces turn solid under `prefers-reduced-transparency: reduce` and `prefers-contrast: more`, and animation stops under `prefers-reduced-motion: reduce`.
   - Android: real blur only on Android 12 and newer (API 31, `RenderEffect`) and only on layers that don't change every frame. Elsewhere, glass is a pre-tinted translucent surface. A **Reduce transparency** setting makes every glass surface solid, and a **Reduce motion** setting removes scale and fade animations.
8. **Legibility first.** Text on glass must meet WCAG AA contrast (4.5:1 for body text) against the worst-case wallpaper. That's why `regular` keeps a tinted base instead of relying on blur alone.

## Consequences

- Designers and reviewers have a short rulebook to check work against.
- Weaker TVs get a flatter but consistent look instead of a slow one.
- Oriel neither depends on nor claims to implement Apple's Liquid Glass APIs.
