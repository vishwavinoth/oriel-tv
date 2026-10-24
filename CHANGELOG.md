# Changelog

All notable changes to Oriel TV are recorded here. The format follows the common "keep a changelog" style, and versions will follow [semantic versioning](https://semver.org/) once releases begin.

## Unreleased

### Added

- Product requirements in [PRD.md](PRD.md), with Oriel TV as an original, independent project.
- Apache License 2.0, a project notice, a trademark policy, and community files: contributing guide, code of conduct, security policy, privacy policy, and issue and pull request templates.
- Architecture decision records in `docs/adr/`, covering the technology stack, design tokens, the Oriel Glass material system, and how Apple's Human Interface Guidelines for Materials apply on the web and Android.
- Shared design tokens in `shared/design-tokens/tokens.json`, with a generator for CSS, TypeScript, and Kotlin, and tests that check contrast for every text, accent, glass, and material combination.
- The website, built with Next.js, React, Tailwind CSS, Motion, Radix UI, and lucide icons, and exported as a static site:
  - A landing page with an interactive launcher demo that works with a keyboard, pointer, or on-screen remote.
  - Features, compatibility explorer, documentation, downloads, changelog, contributing, security, privacy, and license pages.
  - Light, dark, and system themes, and support for reduced motion, reduced transparency, and increased contrast.
- User guides for getting started, device management, and troubleshooting.
- The Oriel Launcher for Android TV and Google TV, in Kotlin with Jetpack Compose for TV:
  - A home screen with a clock, a favorites dock, and a grid of every launchable app.
  - D-pad navigation that stops at edges and restores focus after closing a panel or returning from an app.
  - Favorites, reordering, and hiding apps, from an options menu on any app.
  - Settings for theme, accent, wallpaper, clock, reduce transparency, and reduce motion, saved on the TV.
  - No network permission.

### Privacy

- The launcher requests no network access and contains no analytics. The website uses no cookies, analytics, or third-party scripts.
