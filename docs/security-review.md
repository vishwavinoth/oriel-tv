# Security review

**Date:** 2026-10-25 · **Scope:** the launcher, Control Center and its device-safety core, the website, and the CI and release workflows, as of the `release-prep` branch · **Method:** reading every trust boundary in the code, plus the automated checks listed below. Repeat this review before each release, and record the changes here.

## What could go wrong

| Asset | Threat | Where it's handled |
| --- | --- | --- |
| The TV's state | A crafted value turns an adb command into an arbitrary shell command on the TV | Control Center's command allowlist and validation |
| The TV's state | A malicious or damaged backup file turns off the wrong apps | Backup decoding and validation, plus the restore preview |
| The person's computer | Control Center runs a command through the computer's shell | `ProcessBuilder` with an argument list; no shell anywhere |
| Privacy | Device identifiers leak into history, reports, or logs | History, backups, and device reports built from allowlisted fields |
| Privacy | The launcher sends data somewhere | No `INTERNET` permission |
| Visitors to the website | Injected scripts or framing | Content Security Policy and framing headers |
| Users of a release | A tampered download | Checksums, build provenance, and signing from secrets only |
| The project | A dependency under a license Oriel can't use, or with a known vulnerability | License checks in CI, `npm audit`, Dependabot |

## Controls verified

**Control Center and the device-safety core** (`shared/device`, ADR 0006)

- Every command is a subclass of the sealed `HostCommand`. There is no type for an arbitrary command, so nothing outside the allowlist can be built.
- Every value is validated when a command is created. Package and activity names allow only letters, digits, dots, and underscores. Serials, hosts, and ports have strict patterns, and numeric hosts must be valid IPv4 addresses. Quotes, spaces, and shell symbols can't reach `adb shell`.
- Commands run through `ProcessBuilder` with an argument list, with a timeout, and with output capped at 200,000 characters.
- Operations run only after a person reviews the plan, with its exact commands, and confirms it. Execution stops at the first failed step and reports what ran and what didn't.
- Backups decode only into fixed data classes. Unknown fields are rejected, every package name is validated, and files over 1 MB or with more than 5,000 packages are refused. Files are now size-checked before they're read (fixed in this review).
- History stores the model, operation, outcome, and time, never the serial. Device reports are built from an allowlist of fields that leaves out the address, serial number, and app list. Tests cover both.

**Launcher**

- No `INTERNET` permission. `ACCESS_NETWORK_STATE` reads only the connection type.
- The only exported component is the home activity, which has no custom intent handling. Apps open from components that the package manager reports, and control panel shortcuts open fixed system settings actions.
- `allowBackup="false"`, and the data extraction rules exclude everything.
- No WebView, no dynamic code loading, no reflection-based serialization.

**Website**

- The site is static, with no server code, forms, cookies, analytics, or third-party scripts or fonts.
- `vercel.json` sets a Content-Security-Policy (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, and a permissions policy that turns off camera, microphone, and location.
- `npm audit --omit=dev`: 0 known vulnerabilities on 2026-10-25.

**CI and releases**

- Workflows default to read-only permissions. Only the release job gets `contents: write` and attestation permissions.
- Signing secrets are passed only to the steps that need them. The key is decoded into the runner's temporary folder and deleted afterwards, and nothing about it is in the repository.
- Releases are drafts with SHA-256 checksums and build provenance, published only after a person reviews them.
- License checks (Licensee for Gradle, `npm run check:licenses` for the website) and Dependabot run on every change.

## Findings

| # | Finding | Severity | Status |
| --- | --- | --- | --- |
| 1 | Restoring a backup read the whole file into memory before checking its size, so choosing a huge file could exhaust memory. | Low | **Fixed:** `BackupCodec.read` checks the size on disk first, and a test covers it. |
| 2 | The CSP allows inline scripts, because Next.js's static export writes inline bootstrap scripts. | Low | **Accepted:** the site has no user content and no third-party scripts. Revisit with per-page script hashes if the site ever renders untrusted content. |
| 3 | Network debugging (adb over Wi-Fi) isn't encrypted, and anything on the network can reach it while it's on. | Medium | **Mitigated:** inherent to adb. Control Center and the guides warn about it and tell people to turn it off afterwards. |
| 4 | GitHub Actions are pinned by major version tag rather than by commit SHA. | Low | **Open:** pin to commit SHAs before the repository goes public. Dependabot will keep them current. |
| 5 | Gradle dependencies aren't scanned for known vulnerabilities, only for licenses. | Low | **Open:** turn on Dependabot security alerts (Settings → Code security) when the repository is public, or add a scanner. |
| 6 | Control Center uses the adb it finds through `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or `PATH`. | Low | **Accepted:** these are the person's own tools. Control Center doesn't bundle or download adb. |

## Automated checks run for this review

- Gradle: unit tests for the device-safety core, Control Center, and the launcher; Licensee for all three modules; Android lint.
- Website: `npm run check:licenses`, `npm audit --omit=dev`, ESLint, the TypeScript check, unit tests, the production build, and the route check.
