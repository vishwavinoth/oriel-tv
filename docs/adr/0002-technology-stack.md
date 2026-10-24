# ADR 0002: Technology stack

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

PRD section 3.2 recommends Kotlin and Jetpack Compose for TV for the launcher, a Kotlin desktop app for Control Center, and a static site generator for the website. The stack has to run well on low-cost TV hardware, open in the Android Studio versions contributors actually use, and stay cheap and simple to host.

## Decision

### Launcher (`launcher/`)

- Kotlin 2.2, Jetpack Compose with `androidx.tv:tv-material`, and Gradle with a version catalog.
- Android Gradle Plugin 8.13 with Gradle 9.0. AGP 9 needs a newer Android Studio than many contributors run; AGP 8.13 opens in Android Studio 2025.2 and later.
- `minSdk 26` (Android 8.0) and `compileSdk`/`targetSdk 36`.
- Preferences are stored with Jetpack DataStore. No database and no `INTERNET` permission.
- Application ID `tv.oriel.launcher`. This is provisional until the project secures a matching domain (PRD section 4.1).

### Shared code (`shared/`)

- Design tokens live in `shared/design-tokens/tokens.json` (see ADR 0003).
- Device-operation models that the launcher and Control Center both need will go in a Kotlin/JVM module here when Control Center work starts.

### Website (`website/`)

- Next.js with React and TypeScript, using the App Router and static export (`output: "export"`). The site builds to plain files and needs no server.
- Pages are React Server Components rendered at build time. Client components are used only where interaction is the point, such as the launcher demo and the device filter.
- Tailwind CSS v4, with its theme built from the generated design tokens and its default palette turned off, so every utility uses Oriel's values. The launcher demo's TV screen uses a CSS Module because it scales by container units like a real screen.
- Motion for animation (it follows reduced-motion settings), Radix UI primitives for accessible dialogs, toggle groups, and tooltips, lucide icons, next-themes for the light and dark preference, and clsx, tailwind-merge, and class-variance-authority for component variants. All are installed as npm dependencies under MIT, ISC, or Apache-2.0 licenses, and none are copied into the repository. These were added at the maintainer's request.
- No web fonts and no third-party scripts.
- Deployable to any static host, such as GitHub Pages.
- Chosen over Astro at the maintainer's request, for a React ecosystem that more contributors already know.

### Control Center (`control-center/`)

- Planned as a Kotlin desktop app built with Compose Multiplatform, calling the user's installed Android platform tools (`adb`). Work starts in Phase 2.

## Consequences

- One language, Kotlin, across the launcher, shared code, and Control Center.
- Building the website needs Node.js. Building the launcher needs JDK 17 or newer and the Android SDK.
- Static export rules out Next.js features that need a server, such as API routes, middleware, on-demand image optimization, and incremental regeneration. The PRD calls for no backend, so this is acceptable. Images are optimized before they are committed instead.
- Every page ships the React runtime, so client components must stay small, and pages that don't need interaction mustn't become client components.
- Moving to AGP 9 is a separate decision, to be recorded once most contributors' Android Studio versions support it.
