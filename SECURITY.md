# Security Policy

## Reporting a vulnerability

Please report security problems privately. Don't open a public issue.

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the problem, how to reproduce it, and what an attacker could achieve.

Remove serial numbers, account names, and network details from any logs you attach.

You'll receive an acknowledgement within 7 days. Fixes for confirmed problems are released as soon as practical, and you'll be credited in the release notes unless you'd rather stay anonymous.

## Supported versions

Oriel TV hasn't published a release yet. Until it does, security fixes go to the `main` branch only. This section will list supported releases once they exist.

## Scope

In scope:

- The Oriel Launcher, Control Center, and shared code in this repository.
- The project website and its build.
- The design-token generator and CI workflows.

Out of scope:

- Problems in third-party apps that the launcher opens.
- Device firmware, Android itself, or manufacturer software.
- Weaknesses that require an attacker to already control the TV or the computer running Control Center.

## How Oriel is designed to stay safe

These are design commitments from the product requirements (PRD sections 7.5 and 11). If you find a place where the code breaks one of them, that's a security bug.

- The launcher doesn't request internet access and contains no analytics or advertising SDKs. It reads only whether the TV is on Wi-Fi, Ethernet, or offline.
- Device operations run only from a fixed allowlist, with validated arguments, after explicit confirmation.
- Text from an AI model or any other untrusted source is never executed as a command.
- Imported backups and settings are validated before use and never deserialized unsafely.
- Logs and diagnostics avoid device identifiers and are sanitized before sharing.

The latest review of these controls, with its findings, is in [docs/security-review.md](docs/security-review.md).
