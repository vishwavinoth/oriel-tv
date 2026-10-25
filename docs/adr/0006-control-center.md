# ADR 0006: Control Center architecture and safety model

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

PRD section 7 asks for a guided, transparent way to make supported changes to a TV: explain each change, show the target device and the risks, preview it, require confirmation, run only that change, report the result honestly, and offer recovery. It must never run arbitrary commands, silently disable or uninstall apps, or require root.

## Decision

### Two modules

- **`shared/device`:** plain Kotlin with no UI, so every safety rule is unit tested without a device.
- **`control-center`:** a Compose Multiplatform desktop app that calls the user's installed Android platform tools (`adb`). It doesn't bundle or download adb.

### Safety model

1. **A closed allowlist.** `HostCommand` is a sealed class, and each subclass is one supported command. There is no type for a free-form command, so nothing else can be sent.
2. **Validation at construction.** `adb shell` passes its arguments through the TV's shell, so every package name, activity, serial, and host is checked against strict patterns before a command exists. Shell symbols, spaces, and quotes are rejected.
3. **No local shell.** Commands run as an argument list through `ProcessBuilder`, never through this computer's shell, each with a time limit.
4. **Plans before actions.** Every operation is an `OperationPlan`: explanation, risks, reversibility, the exact commands, and recovery steps. The UI shows all of it, and nothing runs until the person ticks a confirmation box.
5. **Never leave a TV without a home screen.** Turning off a built-in home screen is only offered when Oriel is installed, and backup restores skip it otherwise.
6. **Honest results.** Execution stops at the first failed step and reports what ran, what failed, and what didn't run. adb often exits with 0 even when the TV reports an error, so output is checked too.
7. **Minimal data.** Snapshots leave out the device serial number property. History stores the device model, operation, outcome, and time, on this computer only. Backups hold the list of turned-off apps and the home app, nothing else.
8. **Safe backups.** Backup files decode only into fixed data classes, unknown fields are rejected, and every value is validated before a restore can be planned.

### First operations

- Install or update Oriel.
- Make Oriel the home app with `cmd package set-home-activity` (nothing is turned off).
- Turn the built-in home screen off and back on with `pm disable-user` and `pm enable` (nothing is uninstalled).
- Export a backup, and restore one after previewing every change.
- Copy a device report for compatibility reports and troubleshooting. It's built from an allowlist of fields, so the address, serial number, and app list can't leak into it.

## Consequences

- Adding an operation means adding a `HostCommand` subclass and a plan, both of which need tests.
- Control Center depends on the user installing Android platform tools.
- Desktop panels use solid material colors instead of blur, which keeps text crisp (ADR 0005, reduced-transparency equivalent).
- Installers for Windows, macOS, and Linux are a later step. For now, Control Center runs with `./gradlew :control-center:run`.
