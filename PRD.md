# Oriel TV
## Complete Product Requirements Document (PRD)
### Open-Source Smart TV Experience — Liquid Glass-Inspired Design

**Product name:** Oriel TV  
**Repository name:** `oriel-tv`  
**Product category:** Open-source Smart TV launcher and customization platform  
**Initial target:** Android TV and Google TV  
**Project type:** Original, independent product built from scratch. Not a fork, rebrand, or derivative of any existing project.  
**Repository:** `https://github.com/vishwavinoth/oriel-tv`  
**Primary implementation agent:** Claude Code  
**Design direction:** Apple-inspired premium UI, Liquid Glass-inspired materials, cinematic entertainment interfaces  
**Business model:** Community-driven open source; no mandatory subscriptions, accounts, telemetry, or cloud dependency  
**License:** Apache License 2.0 for all original Oriel code, documentation, and assets. Copyright 2026 Vishwa R and the Oriel TV contributors. See section 9.2.

---

# 1. Executive Summary

Oriel TV is an ambitious open-source project designed to make Smart TVs feel cleaner, faster, more personal, and more beautiful.

Oriel is a new product, designed and written from scratch. It is not a fork, rebrand, or derivative of any existing launcher or device-management project, and its repository contains only original work. Other products may be studied to understand the market and user needs, but their code, text, artwork, and documentation must not be copied or adapted.

The product combines two closely related experiences:

1. **Oriel Launcher:** A premium, customizable Android TV and Google TV home-screen experience.
2. **Oriel Control Center:** A safe, transparent interface for supported TV customization, device inspection, compatibility checks, backups, and guided maintenance.

A polished public website introduces the project, demonstrates its features, explains compatibility, and provides documentation, releases, and contribution instructions.

The visual identity takes inspiration from Apple's design philosophy and Liquid Glass materials: layered translucency, depth, controlled reflections, adaptive surfaces, fluid transitions, and clear visual hierarchy. Oriel must establish its own original identity and must not copy Apple's proprietary assets or claim to implement Apple's native Liquid Glass technology.

**Product mission:** Give people more control over their TVs without compromising privacy, safety, performance, or usability.

**Tagline:** *Your TV. Your atmosphere.*

**Open-source statement:** Beautiful by design. Open by nature.

---

# 2. Product Vision

## 2.1 The problem

Many Smart TV experiences suffer from one or more of these issues:

- Cluttered home screens and excessive promotional content.
- Slow navigation and unnecessary visual complexity.
- Limited control over application layout and appearance.
- Poor discoverability of customization options.
- Confusing technical procedures for advanced configuration.
- Device-specific instructions scattered across repositories and forums.
- Limited transparency about what device-management operations actually do.
- Lack of cohesive design across documentation, setup, tools, and the launcher itself.

Existing launchers and device tools each address parts of this problem. Oriel is a new product that addresses it as one coherent experience, combining usability, thoughtful customization, technical transparency, and a premium visual language.

## 2.2 Product principles

1. **Open by default:** Source code and development discussions should be publicly accessible.
2. **Local-first:** Core functionality must work without a cloud account.
3. **Privacy by design:** No advertising, hidden analytics, or unnecessary collection of personal information.
4. **Remote-first:** Every essential launcher interaction must work with a TV remote.
5. **Safe customization:** Device operations must be understandable, reversible where possible, and explicitly approved.
6. **Performance before decoration:** Glass effects must never make navigation sluggish.
7. **Progressive complexity:** Beginners receive guided workflows; advanced users retain access to appropriate technical details.
8. **Honest compatibility:** Clearly distinguish tested devices from devices that are merely expected to work.
9. **Original work:** Write all code, content, and assets for this project. Use Liquid Glass-inspired design principles without copying proprietary Apple interfaces or assets, and never copy code or material from other launchers, apps, or operating systems.
10. **Community ownership:** Welcome contributions, translations, documentation improvements, and community-maintained compatibility reports.

---

# 3. Scope and Platform Strategy

## 3.1 Initial platform

The first release targets Android TV and Google TV devices.

The product should distinguish between three environments:

- **Android TV:** Android-based television systems with their own launcher and platform capabilities.
- **Google TV:** Google's television experience, where launcher replacement and device-management behavior may differ by device and software version.
- **Other television platforms:** Samsung Tizen, LG webOS, Roku, Fire TV, and other systems must be treated as separate compatibility targets rather than assumed to support the same Android application.

Do not claim that every Smart TV supports launcher replacement, ADB operations, package management, or system-level customization.

## 3.2 Technology stack

Oriel starts from an empty repository. Choose each stack for TV hardware performance, long-term maintenance, and contributor familiarity, and record each decision as an architecture decision record (ADR) in `docs/adr/`.

Recommended starting point:

| Module | Recommended stack | Reason |
|---|---|---|
| Android TV launcher | Kotlin, Jetpack Compose for TV, Gradle | Google's current toolkit for TV interfaces, with built-in focus and D-pad handling |
| Control Center | Kotlin desktop app built with Compose Multiplatform, using the user's installed Android platform tools (ADB) | Shares the language, design tokens, and domain models with the launcher |
| Website | Next.js with React and TypeScript, Tailwind CSS, Motion, and Radix UI, exported as a static site | A React ecosystem many contributors know, with no server to run |

Deviate from these only with a documented reason. Avoid unnecessary services, databases, or deployment dependencies.

## 3.3 Product modules

- Public marketing website.
- Android TV launcher.
- Device setup and connection workflows.
- Compatibility and capability detection.
- Safe customization and maintenance workflows.
- Theme and wallpaper management.
- Backup and recovery.
- Documentation and help center.
- Open-source contribution infrastructure.
- Optional AI-assisted guidance, subject to privacy and safety requirements.

---

# 4. Brand and Visual Identity

## 4.1 Brand

**Name:** Oriel TV  
**Repository slug:** `oriel-tv`  
**Tagline:** Your TV. Your atmosphere.  
**Supporting message:** Beautiful by design. Open by nature.  
**Pronunciation:** OR-ee-ul  
**Short form:** Oriel. Use "Oriel TV" wherever the platform or product category needs to be explicit.

### Name rationale

An *oriel* is a bay window that projects out from a wall to let in more light and widen the view. The name fits the product on three levels:

- **The material:** Glass, light, and depth are the foundation of the Liquid Glass-inspired design system.
- **The device:** A TV is the room's window onto films, games, and the wider world. Oriel frames that view without cluttering it.
- **The tone:** A short, real English word with an architectural, quietly premium feel. It follows the restraint of premium hardware and software naming without borrowing any existing platform's prefixes, product names, or terminology.

The name is independent of Apple, Google, and any existing TV project. It works as a plain lowercase repository slug and is easy to say and spell. Pair it with "TV" in search-facing contexts such as the website title, store listings, and README heading, because "oriel" on its own also refers to the architectural term and to unrelated organizations.

Use the name consistently in the interface, website metadata, README, screenshots, release notes, and application packaging.

Before public release, verify name availability, trademarks, domains, package identifiers, and existing software projects. Treat this name as provisional until those checks are complete.

An initial web search in October 2026 found no TV launcher or Android TV project using the name. The only notable open-source namesake found was an unrelated interpreter for a 1991 Windows batch language. This is a preliminary check, not trademark clearance.

## 4.2 Design direction

The interface should feel premium, calm, cinematic, modern, and tactile.

Design references include:

- Apple's disciplined spacing and typography.
- Liquid Glass-inspired functional surfaces.
- The cinematic presentation of premium entertainment interfaces.
- The clarity of modern developer tools.
- The restrained use of motion and depth found in high-quality operating systems.

The goal is not to clone an existing operating system. Oriel must establish its own typography, icons, layout patterns, illustrations, transitions, and brand assets.

## 4.3 Mandatory Liquid Glass-inspired design system

Liquid Glass-inspired design is a core requirement, not an optional visual enhancement.

Use it as a coherent design language across the marketing website, setup flows, launcher controls, dialogs, toolbars, settings, and interactive demonstrations.

Follow Apple's [Human Interface Guidelines for Materials](https://developer.apple.com/design/human-interface-guidelines/materials) on every platform Oriel targets, including the web and Android, not only where Apple's own frameworks apply. That means Liquid Glass for the functional layer of controls and navigation, standard materials from ultra-thin to thick for structure in the content layer, vibrant label colors on materials, and the tvOS guidance for focus and overlays. [ADR 0005](docs/adr/0005-materials-hig.md) maps each guideline to Oriel's tokens and components. Oriel applies these guidelines with each platform's own rendering tools and uses no Apple APIs, assets, or symbols.

### Material principles

**Translucency:** Use translucent surfaces that allow selected background colors or imagery to contribute to the visual appearance.

**Depth:** Establish clear foreground, functional-control, and background layers.

**Fluidity:** Use smooth, restrained transitions between navigation states, dialogs, settings, and launcher focus states.

**Adaptivity:** Adjust material intensity, contrast, and surface appearance according to the background, theme, and device capabilities.

**Clarity:** Text, icons, focus states, and actions must remain readable against every supported background.

**Restraint:** Apply glass primarily to functional controls and navigation. Do not turn every content card, image, or section into a glass panel.

**Performance:** Use blur and transparency selectively. Provide solid or reduced-effect fallbacks for weaker hardware.

### Important platform distinction

Oriel is an Android-oriented project. Apple's Liquid Glass is a design reference, not an Android API dependency.

Use supported web technologies and Android-native rendering capabilities appropriate to the chosen stack. Do not pretend that Apple-specific APIs are available on Android.

The website may use CSS translucency, backdrop blur, layered gradients, subtle highlights, and fine borders. The Android launcher should use a platform-appropriate implementation with equivalent visual principles.

### Required design tokens

Create a centralized, documented design system for:

- Color palettes and semantic colors.
- Typography and font scales.
- Spacing and layout.
- Corner radii.
- Surface opacity and material strength, including the standard material thicknesses (ultra-thin, thin, regular, and thick).
- Label vibrancy levels (primary, secondary, tertiary, and quaternary) for text on materials.
- Blur intensity.
- Borders and highlights.
- Elevation and shadows.
- Motion duration and easing.
- Focus rings and selected states.
- Disabled, loading, success, warning, and error states.
- Light, dark, and automatic themes where supported.

Avoid scattering arbitrary color values, blur settings, and spacing values throughout the codebase.

### Required reusable components

Create reusable components appropriate to the chosen stack:

- Glass navigation bar.
- Glass buttons and icon buttons.
- Glass toolbar and utility controls.
- Dialogs and confirmation sheets.
- Popovers and dropdowns.
- Theme selector.
- Wallpaper selector.
- Focusable TV application cards.
- Selected and focused launcher states.
- Device status indicators.
- Setup step indicators.
- Compatibility badges.
- Loading skeletons.
- Empty states.
- Error and recovery panels.
- Toasts and notifications.
- Search and filtering controls.

Each component must have defined interaction states, accessible contrast, and graceful rendering fallbacks.

### Accessibility requirements

- Support keyboard and D-pad navigation.
- Make focus visually obvious.
- Respect reduced-motion settings where available.
- Provide a reduced-transparency or solid-surface mode where practical.
- Avoid text over complex imagery without sufficient contrast.
- Do not rely on color alone to communicate device status.
- Keep touch targets appropriate on mobile and pointer targets appropriate on desktop.
- Ensure every website control is keyboard accessible.

### Liquid Glass acceptance criteria

- The website and product interface use one coherent material system.
- Glass is used selectively for functional surfaces, not indiscriminately.
- The design remains readable in light and dark environments.
- The Android launcher remains responsive on resource-constrained TVs.
- Reduced-effect fallbacks are available where required.
- Focus, motion, contrast, and interaction states are tested.
- The visual design is implemented in the real application, not merely a static mockup.

---

# 5. Website Requirements

Build a production-quality, responsive public website that communicates the product clearly and helps visitors move from discovery to installation or contribution.

## 5.1 Landing page

The landing page is the primary marketing experience.

### Hero section

Create a cinematic hero featuring:

- The Oriel wordmark and original visual identity.
- A concise headline communicating the product's value.
- Supporting copy describing the open-source TV experience.
- Primary CTA: **Explore the Project**.
- Secondary CTA: **View Source Code**.
- A realistic interactive launcher preview.
- Subtle background depth and restrained motion.
- A responsive design that works on desktop and mobile.

Suggested headline:

**Your TV deserves a better home.**

Suggested supporting text:

A beautiful, customizable, privacy-first Smart TV experience built in the open.

Do not make unsupported claims about universal device compatibility, guaranteed performance improvements, or complete removal of advertisements inside streaming applications.

### Product demonstration

Include an interactive launcher demonstration with:

- Application cards.
- A favorites dock.
- Theme switching.
- Wallpaper switching.
- Focus and selection states.
- A settings preview.
- Simulated D-pad navigation.

Clearly identify this as a website demonstration if it does not run the actual Android launcher code.

### Feature sections

Show the main benefits through polished visual sections:

1. A cleaner home screen.
2. Personal themes and wallpapers.
3. Remote-first navigation.
4. Safe device customization.
5. Privacy-first operation.
6. Backup and recovery.
7. Open-source development.
8. Compatibility transparency.

### Compatibility explorer

Provide a searchable and filterable interface for supported devices and capabilities.

Show:

- Device or model name where documented.
- Operating system or version.
- Tested status.
- Available features.
- Known limitations.
- Last verification date where available.
- Link to the relevant instructions or report.

Never fabricate compatibility results. Clearly distinguish verified testing from community-reported or unverified information.

### Open-source section

Explain how users can:

- Browse the source code.
- Download published releases.
- Read documentation.
- Report bugs.
- Propose features.
- Contribute code or translations.
- Review security practices.

The repository and release links must be configurable rather than hard-coded throughout the website.

### Footer

Include links to:

- GitHub repository.
- Releases.
- Documentation.
- Contributing guide.
- Security policy.
- License.
- Privacy policy.
- Compatibility information.
- Changelog.

## 5.2 Required website routes

Implement routes appropriate to the selected framework:

- `/` — Landing page.
- `/features` — Feature overview.
- `/devices` — Compatibility explorer.
- `/docs` — Documentation landing page.
- `/docs/getting-started` — Installation and setup.
- `/docs/device-management` — Device management guide.
- `/docs/troubleshooting` — Troubleshooting.
- `/downloads` — Release information.
- `/changelog` — Version history.
- `/contributing` — Contribution guide.
- `/security` — Security policy.
- `/privacy` — Privacy information.
- `/license` — License details.
- `/404` — Not-found page.

Do not create empty routes simply to satisfy a checklist. Every published route must provide useful content or clearly indicate that the section is not yet available.

## 5.3 Website engineering

- Use the stack chosen in section 3.2.
- Use reusable layout and content components.
- Optimize images and fonts.
- Support responsive layouts and modern browsers.
- Add meaningful page titles, metadata, Open Graph tags, and a favicon.
- Include sitemap and robots configuration as appropriate.
- Avoid unnecessary client-side JavaScript.
- Use semantic HTML and accessible interactions.
- Include loading, error, empty, and not-found states.
- Verify production build output and route behavior.
- Do not embed secrets, private API keys, or signing credentials in client code.

---

# 6. Android TV Launcher Requirements

The launcher is the primary product experience.

It must be designed for a television viewed from a distance and controlled with a remote.

## 6.1 Home screen

Include:

- Customizable wallpaper or background.
- Time and date where supported.
- Favorites dock.
- Application grid.
- Clear selected and focused states.
- Optional application categories.
- Settings entry.
- Application search where feasible.
- Responsive layout for supported resolutions.

The interface should prioritize content and application access instead of decorative elements.

## 6.2 Application management

Provide:

- Automatic discovery of launchable applications.
- App ordering.
- Favorites.
- Hidden-app preferences without destructive removal.
- Application details where supported.
- Graceful handling of missing or unlaunchable applications.
- Consistent navigation after returning from an application.

Use platform-supported application discovery and launch APIs. Do not assume access to protected application data.

## 6.3 Remote navigation

Support:

- Up, Down, Left, Right.
- Select or OK.
- Back.
- Home behavior only where permitted by the platform and configured by the user.
- Focus restoration after dialogs and application returns.
- Predictable navigation boundaries.
- Clear focus indication.
- Shortcuts only where supported.

All essential flows must be usable without a mouse or touchscreen.

## 6.4 Themes and personalization

Provide:

- Light and dark themes where appropriate.
- Wallpaper selection.
- Local wallpaper import where supported.
- Accent colors.
- App-grid layout options.
- Dock customization.
- Clock visibility.
- Focus appearance settings.
- Optional ambient effects.
- Restore-defaults action.

Persist preferences locally and handle corrupted or missing settings safely.

## 6.5 Performance

The launcher must remain usable on resource-constrained hardware.

Requirements:

- Avoid unnecessary background services.
- Avoid continuous animations when idle.
- Use image loading and caching appropriately.
- Avoid full-screen blur effects on every frame.
- Avoid blocking the main thread for device operations.
- Keep navigation responsive during background tasks.
- Handle low memory and application lifecycle changes.
- Provide useful diagnostics without collecting unnecessary personal information.

Set quantitative performance targets once the first working launcher runs on a representative device and a baseline has been measured. Measure cold start, memory usage, navigation responsiveness, and stability rather than inventing benchmark claims.

---

# 7. Oriel Control Center

Control Center provides a guided interface for supported device inspection and customization.

It must not silently make destructive or irreversible changes.

## 7.1 Device connection

Where the device supports it, provide:

- Guided ADB setup.
- Connection instructions.
- Device discovery.
- Explicit device selection.
- Connection status.
- Capability detection.
- Supported-operation listing.
- Clear failure messages.
- Recovery instructions.

Do not assume that all TVs support wireless debugging, ADB access, or identical permission models.

## 7.2 Device information

Display only information necessary for the workflow, such as:

- Device model and manufacturer where available.
- Android version.
- Build information where accessible.
- Screen resolution.
- Available memory information where supported.
- Connection method and status.
- Supported operations.
- Compatibility warnings.

Clearly explain when a field cannot be read or verified.

## 7.3 Customization workflow

For each supported operation:

1. Explain what it does.
2. Show the target device.
3. Explain potential risks and limitations.
4. Preview the proposed changes.
5. Identify any changes that cannot be reliably reversed.
6. Require explicit user confirmation.
7. Execute only the approved operation.
8. Show the result.
9. Provide recovery guidance where applicable.

Maintain an operation history that records the action and outcome without unnecessarily storing sensitive device information.

## 7.4 Backup and recovery

Where technically supported, provide:

- Exportable configuration backups.
- Backup validation.
- Restore previews.
- Confirmation before restoring.
- Clear backup versioning.
- Recovery instructions.
- Handling for incompatible backup formats.

Do not claim to back up the complete operating system or protected application data unless the implementation demonstrably supports it.

## 7.5 Safety restrictions

- Never silently uninstall applications.
- Never silently disable system packages.
- Never execute arbitrary commands generated by an AI model.
- Never require root access for core launcher functionality.
- Never make firmware modifications part of the standard setup.
- Do not bypass device security restrictions.
- Use an explicit allowlist of supported operations.
- Validate command arguments and target device identifiers.
- Require confirmation before changing device state.
- Prefer reversible changes.
- Report partial failures and recovery steps honestly.

The product must distinguish between changing the home screen and removing advertisements embedded inside streaming applications. Do not promise that launcher customization eliminates in-app advertisements.

---

# 8. Optional AI Features

AI is an optional extension, not a requirement for core functionality.

Potential future capabilities include:

- Explaining device compatibility reports.
- Translating technical errors into plain language.
- Suggesting themes based on user-selected preferences.
- Helping users understand customization instructions.
- Generating troubleshooting checklists from sanitized diagnostic information.

Requirements:

- Core functionality works without AI.
- No AI account is mandatory.
- Users explicitly enable external AI integrations.
- Explain what information is sent to an external service.
- Never send device diagnostics or logs without consent.
- Never allow model output to bypass the operation allowlist.
- Validate all suggested actions through ordinary application logic.
- Keep API keys out of source control and client-side bundles.
- Provide a clear disable option.

Do not add AI merely to make the product appear innovative. Ship features that solve demonstrated user problems.

---

# 9. Open-Source Strategy

Oriel must be an actual open-source project, not just a free application with inaccessible source code.

## 9.1 Public repository

The project lives at `https://github.com/vishwavinoth/oriel-tv`. Keep the repository private until the name and trademark check in section 4.1 is complete, then make it public.

Planned repository structure:

```text
oriel-tv/
├── launcher/               # Android TV launcher
├── control-center/         # Desktop companion for supported device operations
├── shared/                 # Design tokens and shared domain models
├── website/                # Marketing and documentation website
├── docs/                   # User and developer documentation
│   └── adr/                # Architecture decision records
├── assets/                 # Original brand assets, icons, and wallpapers
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── PULL_REQUEST_TEMPLATE.md
├── PRD.md
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── PRIVACY.md
├── CHANGELOG.md
├── NOTICE
└── LICENSE
```

Tests live inside each module, following the build tool's conventions. Change the structure when the build tooling calls for it, and record the change in an ADR.

## 9.2 Licensing

Oriel TV is original work. Everything in the repository is written for this project and released under the **Apache License 2.0**. The full license text is in `LICENSE`, and the project's copyright notice is in `NOTICE`.

Why Apache-2.0:

- It is a widely recognized, OSI-approved open-source license, so people and companies can use and contribute to Oriel without legal friction.
- It includes an explicit patent grant from every contributor.
- Section 6 grants no rights to the project's trademarks, so others can reuse the code but not the Oriel name or logo.
- Android, AndroidX, Kotlin, and Jetpack Compose use the same license, so Oriel's main dependencies are compatible with it.

Rules:

1. Do not copy or adapt source code, text, artwork, or documentation from other projects into the repository. Studying how other products behave is fine; reproducing their implementation is not.
2. Add third-party libraries only as declared build dependencies, never copied into the source tree, and only when their licenses are compatible with Apache-2.0, such as Apache-2.0, MIT, or BSD.
3. Do not add GPL, AGPL, or other strong copyleft dependencies to the launcher or Control Center, because they would impose their license terms on Oriel.
4. Show the notices that dependency licenses require in an in-app "Open-source licenses" screen and in release artifacts, generated from the build's dependency list.
5. Contributions are accepted under Apache-2.0, as section 5 of the license provides. Require a Developer Certificate of Origin sign-off (`git commit -s`) on pull requests so the origin of each contribution is recorded.
6. Fonts, icons, wallpapers, and other media must be original or carry a license that permits redistribution. Record each one's source and license in `assets/README.md`.
7. The Oriel name and logo are not covered by the code license. Publish a short trademark policy describing their permitted use before the first public release.

## 9.3 Community infrastructure

Include:

- Issue templates for bugs and feature requests.
- Pull request templates.
- Contribution guidelines.
- Security reporting instructions.
- Code of conduct.
- Versioned releases and changelog.
- Build and test workflows.
- Device compatibility reports.
- Good first issues for contributors.
- A clear roadmap and known limitations.

## 9.4 Release quality

Each release should include, where appropriate:

- Version number.
- Changelog.
- Supported platform information.
- Installation instructions.
- Known limitations.
- Source code.
- Build verification.
- Checksums for downloadable artifacts.
- Signing and provenance information where configured.

Never publish a release as tested on hardware unless that testing actually occurred.

---

# 10. Architecture and Technical Requirements

Claude Code must choose architecture based on evidence: platform documentation, TV hardware constraints, and prototypes measured on emulators or real devices.

## 10.1 Foundation setup

Before feature work:

- Set up the build for the launcher, Control Center, and shared code.
- Set up the website project.
- Add formatting, linting, and static analysis.
- Add CI that builds every module and runs its tests on each pull request.
- Create one source of truth for design tokens that both the launcher and the website use.
- Build a minimal launcher that lists and opens installed apps, and run it on an Android TV emulator.
- Record stack and structure decisions as ADRs in `docs/adr/`.

Create a concise implementation plan, then proceed with the implementation.

Do not add frameworks, services, or abstractions before a feature needs them.

## 10.2 Engineering principles

- Prefer modular, maintainable code.
- Use explicit boundaries between presentation, domain logic, device operations, and persistence.
- Keep device commands isolated behind validated interfaces.
- Use typed interfaces where supported.
- Avoid duplicate implementations of shared behavior.
- Avoid unnecessary abstractions and microservices.
- Keep settings and device operations separate.
- Use local persistence for essential preferences.
- Handle errors and cancellation.
- Use dependency injection only where it improves testability and maintainability.
- Keep secrets out of source control.
- Document architectural decisions that affect future contributors.

## 10.3 Data and network behavior

The core launcher must not require a remote backend.

Any optional network feature must document:

- Purpose.
- Data collected or transmitted.
- Destination.
- Retention behavior, where known.
- User controls.
- Failure behavior when offline.

Avoid adding a database server or account system unless a specific, validated feature requires one.

---

# 11. Security and Privacy

Security and privacy are core product requirements.

- No advertising SDKs.
- No hidden analytics.
- No mandatory registration.
- No unnecessary personal data collection.
- No hard-coded credentials.
- No arbitrary shell execution from untrusted inputs.
- No unsafe deserialization of untrusted backup files.
- Validate file imports and exported configurations.
- Avoid leaking device identifiers into logs.
- Sanitize diagnostic output before users share it.
- Keep dependencies updated.
- Run dependency and static-analysis checks where supported.
- Publish a responsible vulnerability-reporting process.
- Provide a clear privacy policy describing actual behavior.

The privacy policy must reflect the implementation, not make unsupported claims.

---

# 12. Testing and Quality Assurance

Testing must cover both functionality and the actual user experience.

## 12.1 Automated testing

Implement tests for:

- Settings persistence.
- Theme switching.
- App discovery and launch failure.
- Focus navigation.
- Keyboard and D-pad behavior.
- Backup creation and validation.
- Restore confirmation.
- Device capability detection.
- Command allowlisting.
- Input validation.
- Permission failures.
- Connection loss.
- Offline operation.
- Error recovery.
- Website navigation.
- Responsive layouts.
- Accessibility-critical controls.

## 12.2 Visual quality

Verify the interface at representative:

- 1080p TV resolutions.
- 4K TV resolutions.
- Desktop browser sizes.
- Mobile browser sizes.

Test long application names, missing artwork, empty states, poor network conditions, reduced transparency, and low-performance devices.

## 12.3 Definition of done

A feature is not complete merely because it looks correct in a screenshot.

It must:

- Work in the actual application.
- Support the required navigation model.
- Have meaningful error states.
- Be accessible.
- Be tested at the appropriate level.
- Be documented.
- Respect security and privacy requirements.
- Avoid regressions in existing functionality.

---

# 13. Product Roadmap

## Phase 0 — Foundation

- Set up the repository with the license, notice, and contribution files.
- Choose and document the technology stack.
- Set up build, lint, test, and CI workflows.
- Define design tokens and component conventions.
- Create the brand and original assets.
- Complete the name and trademark check.

## Phase 1 — Premium website and launcher foundation

- Implement the landing page.
- Build the responsive website shell.
- Implement the Liquid Glass-inspired design system.
- Build the launcher home screen.
- Implement favorites and application grid.
- Implement D-pad navigation and focus states.
- Implement theme and wallpaper settings.
- Add documentation and open-source entry points.

## Phase 2 — Device Control Center

- Implement supported device discovery.
- Add compatibility checks.
- Add guided setup.
- Add operation previews and confirmations.
- Add supported customization workflows.
- Add backup and recovery.
- Add diagnostics and troubleshooting.

## Phase 3 — Community release

- Complete security review.
- Verify dependency licenses.
- Improve documentation.
- Add CI and release automation.
- Publish compatibility information.
- Prepare release notes.
- Test on available physical devices.
- Publish the first verified public release.

## Phase 4 — Future improvements

Consider these only after the core experience is stable:

- Advanced theme packs.
- Community-submitted themes.
- More device compatibility.
- Optional AI troubleshooting.
- Optional cross-device configuration export.
- Additional language support.
- A broader device-management ecosystem.

Do not let future features delay the delivery of a stable, functional MVP.

---

# 14. Success Metrics

Establish baselines before setting numerical improvement targets.

Track project health through:

- Successful clean builds.
- Automated test pass rate.
- Installation success on verified devices.
- Launcher startup and navigation performance.
- Memory consumption on representative hardware.
- Crash and error frequency where measurable without invasive telemetry.
- Documentation completeness.
- Issue resolution time.
- Community contributions.
- Release reliability.
- Compatibility-report coverage.

Do not introduce invasive analytics just to collect these metrics. Prefer automated CI data, public repository activity, opt-in reports, and reproducible local benchmarks.

---

# 15. Required Deliverables

The implementation should produce:

1. A new, well-structured repository containing only original work and permitted dependencies.
2. A working Android TV launcher.
3. A polished, responsive marketing website.
4. A cohesive Liquid Glass-inspired design system.
5. Theme and wallpaper customization.
6. Reliable D-pad navigation.
7. A guided device-management experience for supported operations.
8. Backup and recovery workflows where technically supported.
9. Compatibility and troubleshooting documentation.
10. A public open-source contribution structure.
11. Automated tests and CI.
12. A verified build and release process.
13. README, changelog, security, privacy, and licensing documentation.
14. A final implementation report listing completed work, tests, limitations, and remaining blockers.

---

# 16. Final Implementation Instructions for Claude Code

You are the senior engineer, product designer, and implementation agent responsible for building Oriel TV from an empty repository.

## Execution rules

1. Start by reading this PRD and the current state of the repository.
2. Understand existing Oriel code before modifying it.
3. Write all code, text, and assets for this project. Never copy or adapt them from other projects.
4. Identify the highest-impact improvements.
5. Establish the design system before implementing repeated UI components.
6. Treat Liquid Glass-inspired materials as a mandatory design requirement.
7. Implement the website and actual launcher experience, not only mockups.
8. Make core functionality local-first and privacy-preserving.
9. Never invent device compatibility or claim unperformed hardware testing.
10. Keep potentially destructive device operations explicit, validated, and confirmed.
11. Add tests as features are implemented.
12. Run the available test suites and production builds.
13. Fix regressions introduced by your changes.
14. Update documentation to match the real implementation.
15. Avoid unnecessary dependencies, services, abstractions, and framework migrations.
16. Do not expose secrets or execute unsafe generated commands.
17. Do not claim that the project is complete when essential flows are still broken.

## How to work

Do not stop after producing a plan or describing the proposed architecture.

After reading the PRD and the repository, create a concise task list and begin implementing the highest-priority work in the same session. Continue through implementation, testing, and documentation until the available context or environment genuinely prevents further progress.

If a feature cannot be implemented because of platform restrictions, missing credentials, unavailable hardware, or an existing blocker, document the exact limitation and implement the safest useful alternative.

At completion, report:

- What changed.
- Which features are working.
- Which files or modules were added or modified.
- Which tests and builds were run.
- Which tests passed or failed.
- Which device behaviors still require physical testing.
- Known limitations and security considerations.
- Exact commands for local development and production builds.
- The next most valuable tasks.

**Final product standard:** Oriel TV should feel like a carefully designed, premium Smart TV experience while remaining genuinely open source, transparent, lightweight, safe, and maintainable.