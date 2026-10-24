# Contributing to Oriel TV

Thanks for helping build a better home screen for TVs. Contributions of every kind are welcome: code, design, documentation, translations, and device reports.

## Ground rules

- **Original work only.** Write everything you contribute yourself. Don't copy or adapt code, text, artwork, or documentation from other projects (PRD section 9.2). Studying how other products behave is fine; reproducing their implementation isn't.
- **Dependencies stay dependencies.** Add third-party libraries only as declared build dependencies, with licenses compatible with Apache-2.0, such as Apache-2.0, MIT, BSD, or ISC. No GPL or AGPL dependencies in the launcher or Control Center.
- **Remote first.** Every launcher feature must work with only a D-pad, OK, and Back.
- **Private by default.** Don't add analytics, tracking, or network access. Any network feature needs a discussion first and must be off by default.
- **Honest compatibility.** Never mark a device as tested unless you tested it yourself.
- **Be kind.** Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Sign your commits

Contributions are accepted under the Apache License 2.0. Every commit needs a Developer Certificate of Origin sign-off, which states that you wrote the change or have the right to submit it:

```bash
git commit -s -m "Describe your change"
```

## Project layout

| Folder | What's in it |
|---|---|
| `launcher/` | The Android TV launcher (Kotlin, Jetpack Compose for TV) |
| `website/` | The website (Next.js, React, Tailwind CSS), exported as a static site |
| `shared/design-tokens/` | Design tokens shared by the launcher and the website |
| `docs/` | Guides and architecture decision records |
| `assets/` | Original brand assets |

## Set up

You need:

- Node.js 20.9 or newer, for the website and the design tokens.
- JDK 17 or newer and the Android SDK (platform 36), for the launcher. Android Studio 2025.2 or newer includes both.

### Design tokens

Tokens live in `shared/design-tokens/tokens.json`. After changing them, regenerate the platform files and run the contrast tests from the repository root:

```bash
npm run tokens
npm run test:tokens
```

Commit the generated files with your change. CI fails if they're out of date.

### Website

```bash
cd website
npm ci
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check:routes
```

### Launcher

From the repository root:

```bash
./gradlew :launcher:assembleDebug
./gradlew :launcher:testDebugUnitTest
./gradlew :launcher:lintDebug
```

On Windows, use `gradlew.bat`. To try it, install the debug APK on an Android TV emulator or a TV, as described in [Getting started](docs/guides/getting-started.md).

## Design

Read [ADR 0004](docs/adr/0004-glass-material-system.md) and [ADR 0005](docs/adr/0005-materials-hig.md) before changing any surface. In short: glass is only for controls and navigation, standard materials give structure to content, glass never sits on glass, and every combination must pass the contrast tests.

### Submit a theme pack

Anyone can propose a theme pack:

1. Add an entry to `themePack.options` in `shared/design-tokens/tokens.json`, with a one-word lowercase id, a `label`, a one-sentence `description`, a `theme` (`dark` or `light`), and an existing `accent` and `wallpaper`. To use a new wallpaper or accent, add it to `tokens.json` first.
2. Run `npm run tokens && npm run test:tokens` from the repository root. The tests check contrast and that the pack is valid and new.
3. Open a pull request with a screenshot of the pack in the website demo or the launcher. All artwork must be original (see Ground rules).

## Pull requests

1. Open an issue first for anything larger than a small fix, so we can agree on the approach.
2. Keep each pull request focused on one change.
3. Fill in the pull request template, including how you tested it. Show screenshots for visible changes.
4. Update the documentation and [CHANGELOG.md](CHANGELOG.md) when behavior changes.

## Reporting problems

- **Bugs and ideas:** use the issue forms on GitHub.
- **Device reports:** use the device compatibility form. Reports help even when things don't work.
- **Security problems:** follow [SECURITY.md](SECURITY.md). Please don't open a public issue.
