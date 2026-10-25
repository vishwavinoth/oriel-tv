# Oriel TV

**Your TV. Your atmosphere.**

Oriel TV is an open-source, privacy-first home screen and customization toolkit for Android TV and Google TV, with a calm, glass-inspired design built for the remote.

> **Status:** Public preview. Oriel is ready to try, but nobody has tested it on a physical TV yet. [Download the latest release](https://github.com/vishwavinoth/oriel-tv/releases/latest), follow [Getting started](docs/guides/getting-started.md), and please [report how it works on your TV](https://github.com/vishwavinoth/oriel-tv/issues/new?template=device_report.yml), including when something doesn't.

**Website:** <https://oriel-tv.vercel.app>

## What's here

- **Oriel Launcher** (`launcher/`): a home screen for Android TV and Google TV, in Kotlin with Jetpack Compose for TV. It has a favorites dock, a grid of every app, D-pad navigation that stops at edges, an options menu for favorites and hiding apps, a control panel with the connection status and shortcuts to the TV's own Wi-Fi, Bluetooth, notifications, display, sound, and other settings, and settings for theme, accent, wallpaper, clock, reduce transparency, and reduce motion. It runs on Android 5.0 and newer, has draft translations into six languages awaiting native-speaker review ([docs/translations.md](docs/translations.md)), and has no internet permission.
- **Website** (`website/`): Next.js, React, Tailwind CSS, Motion, and Radix UI, exported as a static site. It includes an interactive launcher demo, a full live demo with a guided walkthrough and a Control Center walkthrough (<https://oriel-tv.vercel.app/demo/>), a compatibility explorer, a community gallery of theme packs and device reports, and the documentation.
- **Design tokens** (`shared/design-tokens/`): one source of colors, materials, type, motion, and wallpapers for both, with contrast tests.
- **Oriel Control Center** (`control-center/`): a desktop companion, in Kotlin with Compose Multiplatform, that installs Oriel, makes it the home app, turns the built-in home screen off and on, and backs up and restores which apps are turned off. Every change is explained, previewed with its exact commands, and confirmed first. Run it with `./gradlew :control-center:run`.
- **Device-safety core** (`shared/device/`): the command allowlist, validation, operation plans, and backup format behind Control Center, with unit tests.

## Principles

- **Local-first:** works without an account or cloud service.
- **Private:** no ads, no hidden analytics, no tracking.
- **Remote-first:** everything works with a TV remote.
- **Safe:** device changes are explained, previewed, and confirmed before they happen.
- **Original:** designed and written from scratch for this project.

## Build

```bash
# Launcher: JDK 17+ and the Android SDK (platform 36)
./gradlew :launcher:assembleDebug :launcher:testDebugUnitTest

# Website: Node.js 20.9+
cd website && npm ci && npm run dev

# Design tokens, from the repository root
npm run tokens && npm run test:tokens
```

## Documentation

- [Product requirements](PRD.md)
- [Getting started](docs/guides/getting-started.md), [Device management](docs/guides/device-management.md), and [Troubleshooting](docs/guides/troubleshooting.md)
- [Design system](docs/design-system.md), [architecture decisions](docs/adr/), and [releasing](docs/releasing.md)
- [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), [Privacy](PRIVACY.md), and [Changelog](CHANGELOG.md)

## License

Copyright 2026 Vishwa R and the Oriel TV contributors.

Licensed under the [Apache License 2.0](LICENSE). The license doesn't grant rights to use the Oriel name or logo; see [TRADEMARKS.md](TRADEMARKS.md).

<sub>Beautiful by design. Open by nature.</sub>
