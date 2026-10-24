# ADR 0003: One source of truth for design tokens

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

The website and the launcher must look and feel like one product (PRD section 4.3). Copying colors, radii, and timings by hand into CSS and Kotlin would drift apart within weeks.

## Decision

- All tokens live in `shared/design-tokens/tokens.json`, as plain JSON grouped by category: color, glass, radius, spacing, type, motion, focus, and elevation.
- `shared/design-tokens/build.mjs`, a Node.js script with no dependencies, generates:
  - `website/src/styles/tokens.css`: CSS custom properties for light and dark themes, plus overrides for reduced transparency and increased contrast. A `[data-oriel-scope]` element can preview a different theme, accent, or wallpaper than the page, which the website's launcher demo uses.
  - `website/src/lib/tokens.generated.ts`: the accent and wallpaper lists, for website code that needs them by name.
  - `launcher/src/main/java/tv/oriel/launcher/ui/theme/OrielTokens.kt`: Kotlin constants.
- `shared/design-tokens/tokens.test.mjs` checks the palette's contrast ratios, so a token change that breaks legibility fails CI.
- Generated files are committed, so each module builds without running the generator. CI runs `node shared/design-tokens/build.mjs --check` and fails if the committed output is out of date.

## Consequences

- Changing a token means editing the JSON and running `npm run tokens` from the repository root.
- Generated files start with a "do not edit" header.
