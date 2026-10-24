# Privacy

Oriel TV is built to work without collecting anything about you. This page describes what the software in this repository actually does today. It's updated whenever that behavior changes, and every change is noted in [CHANGELOG.md](CHANGELOG.md).

## Oriel Launcher

- **No network access.** The launcher doesn't request Android's `INTERNET` permission, so it can't send data anywhere.
- **No accounts, analytics, ads, or tracking.**
- **What it reads:** the list of installed apps that can be opened from a home screen, so it can show them. This list stays on the TV.
- **What it stores:** your favorites, hidden apps, app order, theme, accent color, wallpaper choice, and display settings. They're saved in the launcher's private storage on the TV and deleted when you uninstall it.

## Oriel Control Center

Control Center is available as a development build. It runs on your computer and talks only to the TV you connect, through Android's own `adb` tool.

- **What it reads from the TV:** the model, maker, Android version and build, screen size, memory, platform features, the list of installed and turned-off apps, which app is the home screen, and Oriel's version if it's installed. It doesn't keep the TV's serial number.
- **Device reports:** the report you can copy lists the model, maker, platform, Android version and build, screen size, memory, connection type, Oriel's version, the home app, whether built-in home screens are on, and how many apps are turned off. It leaves out the TV's address, serial number, and list of apps, and goes only where you paste it.
- **What it stores on your computer:** a history of the operations you ran (time, TV model, operation, and outcome) in `~/.oriel/control-center/history.jsonl`, and backup files only where you choose to save them.
- **What it sends elsewhere:** nothing. It has no analytics and makes no network requests other than adb's connection to your TV.

## Website

- No cookies, analytics, or third-party scripts.
- No web fonts or other files loaded from third-party servers.
- The site is static. The company hosting it may keep standard server logs, such as IP addresses and request times, under its own privacy policy.

## Optional features

Any future feature that uses the network, such as optional AI help, will be off by default. Before you turn it on, it will explain what it sends, where, and why (PRD sections 8 and 10.3).

## Questions

Open an issue, or see [SECURITY.md](SECURITY.md) if the question concerns a vulnerability.
