# Changelog

All notable changes to Oriel TV are recorded here. The format follows the common "keep a changelog" style, and versions will follow [semantic versioning](https://semver.org/) once releases begin.

## Unreleased

## [0.1.0] - 2026-10-25

The first public preview. It's for testing: nobody has run it on a physical TV yet, so expect rough edges. Please report what you find, including when something works, with a device report or a bug report on GitHub.

### Supported platforms

- **Launcher:** Android TV and Google TV devices running Android 5.0 or newer. It also installs on Fire TV, but it can't be the home screen there.
- **Control Center:** Windows (`.msi`) and Debian or Ubuntu Linux (`.deb`), each with its own Java runtime, and macOS as a `.jar` for Apple silicon Macs that needs Java 17 or newer (there's no build for Intel Macs yet). Control Center needs Android platform tools (`adb`).

### Known limitations

- Not yet tested on a physical TV. It has run only on an Android phone emulator in landscape.
- On Google TV and many Android TV devices, there's no setting to change the home app. Control Center can turn the built-in home screen off with adb, which can affect setup screens, voice search, or casting on some models, and firmware updates can turn it back on.
- The Control Center window has only had a startup check, and there's no macOS installer yet.
- The translations are drafts awaiting native-speaker review.

### Added

- Product requirements in [PRD.md](PRD.md), with Oriel TV as an original, independent project.
- Apache License 2.0, a project notice, a trademark policy, and community files: contributing guide, code of conduct, security policy, privacy policy, and issue and pull request templates.
- Architecture decision records in `docs/adr/`, covering the technology stack, design tokens, the Oriel Glass material system, and how Apple's Human Interface Guidelines for Materials apply on the web and Android.
- Shared design tokens in `shared/design-tokens/tokens.json`, with a generator for CSS, TypeScript, and Kotlin, and tests that check contrast for every text, accent, glass, and material combination.
- The website, built with Next.js, React, Tailwind CSS, Motion, Radix UI, and lucide icons, and exported as a static site:
  - A landing page with an interactive launcher demo that works with a keyboard, pointer, or on-screen remote, including the control panel and simulated TV settings screens.
  - A live demo page that starts with the TV switched off, tracks a guided walkthrough, goes fullscreen, and walks through Control Center's review, confirm, run, and result steps.
  - Features, compatibility explorer, documentation, downloads, changelog, contributing, security, privacy, and license pages.
  - A community gallery of theme packs and device reports. Reports are JSON files in `community/device-reports/`, checked at build time, and they also appear in the compatibility explorer.
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
  - Draft translations into Spanish, French, German, Hindi, Tamil, and Arabic, each marked for native-speaker review. The launcher works right to left, and on Android 13 and newer its language can be chosen on its own. See [docs/translations.md](docs/translations.md).
- Oriel Control Center, a desktop companion in Kotlin with Compose Multiplatform (ADR 0006):
  - Finds or connects to TVs through the user's own adb, and shows device details and warnings.
  - Installs or updates Oriel, makes it the home app, and turns the built-in home screen off and back on, never uninstalling anything.
  - Shows every operation's explanation, risks, reversibility, exact commands, and recovery before a confirmation, and reports partial failures honestly.
  - Exports a backup of which apps are turned off, and restores one after previewing every change.
  - Keeps an operation history on the computer, without device serial numbers.
  - Copies a device report for compatibility and bug reports, leaving out the TV's address, serial number, and app list.
- A device-safety core with a closed command allowlist and validation that blocks shell injection, covered by unit tests.
- Dependency license checks: every Gradle and npm dependency is checked against the licenses the project allows, in CI and in every release build. The launcher and Control Center show their libraries in an Open-source licenses screen, and the website lists its own on the License page.
- A release workflow that builds the launcher APK and Control Center installers for Linux and Windows (and a runnable jar for Apple silicon Macs) from a version tag, adds SHA-256 checksums and build provenance, and opens a draft release for review. See [docs/releasing.md](docs/releasing.md).
- Dependabot keeps Gradle, npm, and GitHub Actions dependencies up to date.
- Six theme packs (Evening, Cinema, Reef, Northern, Morning, and Sunrise) set the theme, accent, and wallpaper in one step, in the launcher and the website demo. Anyone can propose a new one; see CONTRIBUTING.md.

### Privacy

- The launcher requests no internet access and contains no analytics. It reads only the connection type, for the status in the top row. The website uses no cookies, analytics, or third-party scripts.
