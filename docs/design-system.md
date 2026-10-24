# Design system

Oriel's design system keeps the website and the TV launcher looking like one product. This page is the practical reference. The reasons behind it are in [ADR 0004](adr/0004-glass-material-system.md) (Oriel Glass) and [ADR 0005](adr/0005-materials-hig.md) (Apple's Human Interface Guidelines for Materials).

## One source of truth

Every color, material, radius, spacing step, type size, duration, easing, focus value, and wallpaper lives in [`shared/design-tokens/tokens.json`](../shared/design-tokens/tokens.json). Run `npm run tokens` from the repository root to generate:

| Output | Used by |
|---|---|
| `website/src/styles/tokens.css` | CSS custom properties (`--o-*`), mapped into Tailwind's theme in `website/src/styles/globals.css` |
| `website/src/lib/tokens.generated.ts` | Accent and wallpaper lists for website code |
| `launcher/src/main/java/tv/oriel/launcher/ui/theme/OrielTokens.kt` | Kotlin constants for the launcher |

`npm run test:tokens` checks contrast for every combination of text, accent, status color, glass, and material, in both themes, over pure white and pure black backdrops. A token change that hurts legibility fails CI.

## Layers

| Layer | What goes there | Surface |
|---|---|---|
| Content | Wallpaper, app tiles, artwork, page sections, cards | Solid surfaces, or standard materials for structure over imagery |
| Functional | Header, dock, quick actions, settings panel, dialogs, menus, toasts, tooltips | Oriel Glass |

Glass never sits on glass. Controls inside a glass panel use tinted fills. Related controls share one glass container.

## Materials

| Material | Use it for | Web | Android |
|---|---|---|---|
| Regular glass | Functional surfaces that carry text | `glass` | `GlassSurface(variant = Regular)` |
| Clear glass | Small controls over wallpaper or media | `glass-clear` | `GlassSurface(variant = Clear)` |
| Dimming layer | Under clear glass over a bright background | `glass-dim` | `GlassSurface(dim = true)` |
| Ultra-thin material | Full-screen views over the wallpaper | `material-ultra-thin` | `OrielTokens.*Material.UltraThin` |
| Thin material | Overlays that partly cover content; large text only | `material-thin` | `OrielTokens.*Material.Thin` |
| Regular material | Overlays that partly cover content | `material-regular` | `OrielTokens.*Material.Regular` |
| Thick material | Overlays that need strong contrast | `material-thick` | `OrielTokens.*Material.Thick` |

Choose a material for its purpose, never for the color it adds.

## Labels on materials

Use `fg` (primary), `fg-2` (secondary), and `fg-3` (tertiary) on the web, or the matching `textPrimary`, `textSecondary`, and `textTertiary` colors on Android. The quaternary level (`fg-4`) is only for placeholders and disabled text, and never on thin or ultra-thin materials.

## Focus

- **TV:** focused tiles scale by `Focus.Scale` (1.08), gain a `Focus.RingWidth` ring in the focus-ring color, and lift with a soft glow. That's where glass shows up on TV.
- **Web:** every interactive element shows a visible focus ring (`:focus-visible`), and every control works with a keyboard.

## Theme packs

A theme pack is a named set of a theme, an accent, and a wallpaper, applied together from the top of Settings in the launcher and in the website demo. Packs live in `tokens.json` under `themePack.options`, and the generator writes them into both apps, so they always match.

A pack only combines existing tokens. The contrast tests already check every theme over every wallpaper, so any valid pack is legible. The tests also check that each pack uses a real theme, accent, and wallpaper, and doesn't repeat another pack. Choosing a pack and then changing one part makes it a custom mix; nothing is lost.

To add a new look that needs a new wallpaper or accent, add that token first. It's then contrast-tested like every other, and a pack can use it.

## Accessibility settings

| Setting | Website | Launcher |
|---|---|---|
| Reduce transparency | Follows `prefers-reduced-transparency`; glass and materials turn solid | In-app setting; glass turns solid and blur stops |
| Increase contrast | Follows `prefers-contrast: more`; solid surfaces and stronger labels and edges | Planned |
| Reduce motion | Follows `prefers-reduced-motion`; animations stop | In-app setting, and follows the system's "remove animations" setting |

## Components

| Component | Website | Launcher |
|---|---|---|
| Glass navigation bar | `SiteHeader` | Top row with quick actions |
| Buttons and icon buttons | `ui/button.tsx` (variants: primary, glass, quiet, ghost) | tv-material `Surface` and `Card` |
| Dialogs and sheets | Radix `Dialog` (mobile menu) | `OrielDialog`, `SettingsPanel`, `AppOptionsMenu` |
| Tooltips | `ui/hint.tsx` (Radix `Tooltip`) | Not used on TV |
| Theme selector | `ThemeSwitcher` (Radix `ToggleGroup`, next-themes) | Settings panel |
| Wallpaper selector | Launcher demo | Settings panel |
| Focusable app cards | Launcher demo tiles | `AppTile` |
| Status indicators and badges | `StatusPill` (icon plus text, never color alone) | Not used yet |
| Search and filters | `DeviceExplorer` | Not used yet |
| Empty states | Devices, downloads, explorer | Empty dock and grid messages |
| Toasts | Launcher demo | Message toast on the home screen |
