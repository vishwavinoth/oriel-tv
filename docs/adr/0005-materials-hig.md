# ADR 0005: Follow Apple's Human Interface Guidelines for Materials on every platform

- **Status:** Accepted
- **Date:** 2026-10-24
- **Extends:** [ADR 0004](0004-glass-material-system.md)

## Context

The maintainer requires Oriel to follow Apple's [Human Interface Guidelines for Materials](https://developer.apple.com/design/human-interface-guidelines/materials) on the web and Android, not only on Apple platforms. ADR 0004 covers Liquid Glass. The HIG also defines standard materials for structure in the content layer, label vibrancy on materials, and tvOS-specific guidance. tvOS is the closest match to a TV launcher.

Oriel can't use Apple's frameworks on these platforms. It applies the same guidance with each platform's own tools, under its own names, and uses no Apple APIs, assets, or symbols.

## Decision

Each guideline maps to a specific token, component rule, or test.

| HIG guidance | How Oriel applies it |
|---|---|
| Liquid Glass is a distinct functional layer for controls and navigation, above the content. | `glass.regular` and `glass.clear` appear only in the site header, launcher dock, quick actions, settings panel, dialogs, menus, and toasts. Content never uses glass. |
| A transient control in the content layer, such as a slider or toggle, can take on glass while someone interacts with it. | Content-layer controls get the glass focus treatment only while they're focused or pressed. |
| Use Liquid Glass sparingly. | On any screen, glass is limited to the bars and the overlay that's currently open. |
| The regular variant suits components with text, such as alerts, sidebars, and popovers. The clear variant suits components over media. | `glass.regular` for panels, menus, toasts, and the site header. `glass.clear` for small controls over wallpaper or artwork. |
| Clear glass over a bright background needs a dimming layer of about 35%. A dark background doesn't. | `glass.dim` sits under clear glass when the wallpaper or artwork is light (`wallpaper.tone` is `light`), and is skipped over dark backgrounds. |
| Standard materials create structure in the content layer. | `material.ultraThin`, `material.thin`, `material.regular`, and `material.thick`, with matching blur values. |
| Choose a material for its purpose, not the color it adds. | Components choose a thickness for a role (for example, "overlay that partly covers content") and never for its tint. Tints come from tokens, which system settings can change. |
| Thicker materials give better contrast for fine detail. Thinner ones keep more of the background visible. | Opacity and blur both increase from ultra-thin to thick. `tokens.test.mjs` checks legibility at each thickness against pure white and pure black backdrops. |
| Place vibrant label colors on materials. Avoid the quaternary level on thin and ultra-thin materials. | Four label levels: `textPrimary` to `textQuaternary`. Quaternary is used only on regular and thick materials, and only for non-essential text such as placeholders and disabled labels. |
| tvOS: ultra-thin for full-screen views, thin and regular for overlays that partly cover content, thick for overlays that need a dark scheme. | Launcher: ultra-thin behind full-screen views such as the app library. Thin or regular for partial overlays such as the focused app's info card. Thick for dark overlays. |
| tvOS: buttons and images take on glass when they gain focus. | The focus treatment in ADR 0004, rule 6. |
| The appearance responds to Reduce Transparency and Increase Contrast. | Both make glass and materials solid and stop blur. Increase Contrast also raises label and edge contrast. The web follows the system settings, and the launcher has its own settings. |

### Legibility rules, enforced by tests

- Regular and thick materials: primary text at 4.5:1 or better, secondary at 3:1 or better.
- Thin material: primary text at 3:1 or better, so only large text sits on it.
- Ultra-thin material: primary text at 3:1 or better over the scrimmed wallpaper.

### Platform implementation

- **Web:** `backdrop-filter` blur and saturation through the Tailwind utilities `glass`, `glass-clear`, and `material-*`. A solid fallback applies where `backdrop-filter` isn't supported.
- **Android:** `RenderEffect` blur on Android 12 and newer, used only on layers that don't change every frame. Elsewhere, a tinted translucent fill from the same tokens (`OrielTokens.DarkMaterial`, `OrielTokens.LightMaterial`).

## Consequences

- Design reviews check every new surface against the table above.
- Adding or changing a material means updating `tokens.json` and passing the legibility tests.
- If the HIG changes, this record is updated or superseded.
