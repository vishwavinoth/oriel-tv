# Changelog

All notable changes to Oriel TV are recorded here. The format follows the common "keep a changelog" style, and versions will follow [semantic versioning](https://semver.org/) once releases begin.

## Unreleased

### Added

- Product requirements in [PRD.md](PRD.md), with Oriel TV as an original, independent project.
- Apache License 2.0, a project notice, a trademark policy, and community files: contributing guide, code of conduct, security policy, privacy policy, and issue and pull request templates.
- Architecture decision records in `docs/adr/`, covering the technology stack, design tokens, the Oriel Glass material system, and how Apple's Human Interface Guidelines for Materials apply on the web and Android.
- Shared design tokens in `shared/design-tokens/tokens.json`, with a generator for CSS, TypeScript, and Kotlin, and tests that check contrast for every text, accent, glass, and material combination.
- The website, built with Next.js, React, Tailwind CSS, Motion, Radix UI, and lucide icons, and exported as a static site:
  - A landing page with an interactive launcher demo that works with a keyboard, pointer, or on-screen remote, including the control panel and simulated TV settings screens.
  - A live demo page that starts with the TV switched off, tracks a guided walkthrough, goes fullscreen, and walks through Control Center's review, confirm, run, and result steps.
  - Features, compatibility explorer, documentation, downloads, changelog, contributing, security, privacy, and license pages.
  - Light, dark, and system themes, and support for reduced motion, reduced transparency, and increased contrast.
- User guides for getting started, device management, and troubleshooting.
- The Oriel Launcher for Android TV and Google TV, in Kotlin with Jetpack Compose for TV:
  - A home screen with a clock, a favorites dock, and a grid of every launchable app.
  - D-pad navigation that stops at edges and restores focus after closing a panel or returning from an app.
  - Favorites, reordering, and hiding apps, from an options menu on any app.
  - Settings for theme, accent, wallpaper, clock, reduce transparency, and reduce motion, saved on the TV.
  - A control panel with the connection status and shortcuts to the TV's own settings. Each shortcut appears only if the TV can open it.
  - Runs on Android 5.0 and newer, so it reaches older Android TV and Fire TV devices.
  - No internet permission.
- Oriel Control Center, a desktop companion in Kotlin with Compose Multiplatform (ADR 0006):
  - Finds or connects to TVs through the user's own adb, and shows device details and warnings.
  - Installs or updates Oriel, makes it the home app, and turns the built-in home screen off and back on, never uninstalling anything.
  - Shows every operation's explanation, risks, reversibility, exact commands, and recovery before a confirmation, and reports partial failures honestly.
  - Exports a backup of which apps are turned off, and restores one after previewing every change.
  - Keeps an operation history on the computer, without device serial numbers.
  - Copies a device report for compatibility and bug reports, leaving out the TV's address, serial number, and app list.
- A device-safety core with a closed command allowlist and validation that blocks shell injection, covered by unit tests.

### Privacy

- The launcher requests no internet access and contains no analytics. It reads only the connection type, for the status in the top row. The website uses no cookies, analytics, or third-party scripts.
