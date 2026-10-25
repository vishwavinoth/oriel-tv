# Device management

Oriel Control Center guides supported device changes with explanations, previews, confirmations, and recovery steps. Download it from the [latest release](https://github.com/vishwavinoth/oriel-tv/releases/latest): the `.msi` for Windows or the `.deb` for Debian and Ubuntu, each with its own Java runtime, or the `.jar` for Apple silicon Macs (run it with `java -jar`, Java 17 or newer; there's no build for Intel Macs yet). It needs [Android platform tools](https://developer.android.com/tools/releases/platform-tools) installed. You can also run it from the repository with JDK 17 or newer:

```bash
./gradlew :control-center:run
```

It can install or update Oriel, make Oriel the home app, turn the built-in home screen off and back on, and export or restore a backup of which apps are turned off. Every operation shows its exact commands before you confirm it. It can also copy a device report to paste into a compatibility report or bug report; the report leaves out the TV's address, serial number, and list of apps. The rest of this guide explains the same steps by hand, and the risks behind them.

> **Warning:** The commands on this page change how your TV behaves. Nobody on the Oriel project has verified them on your model yet. Read every step first, and keep the restore command handy.

## How Oriel approaches device changes

Every device operation Oriel supports follows the same rules (PRD section 7, [ADR 0006](../adr/0006-control-center.md)):

1. Explain what the change does and which device it targets.
2. Explain the risks, and say plainly when a change can't be reliably undone.
3. Ask for confirmation before changing anything.
4. Run only operations from a fixed list, with checked arguments.
5. Show the result, and how to undo it.

Oriel never uninstalls apps silently, never requires root, never modifies firmware, and never runs commands written by an AI model.

## Connecting with ADB

1. Turn on developer options and debugging, as described in [Getting started](getting-started.md).
2. Connect from your computer with `adb connect`, using the TV's IP address.
3. Check the connection:

```bash
adb devices
```

When you're finished, disconnect and turn network debugging off again. It isn't encrypted, and it's reachable by anything on your network while it's on.

```bash
adb disconnect
```

## Making Oriel the home screen (advanced)

Google TV, and many Android TV devices, have no setting to choose a different home app. The only way is to turn off the built-in home screen for your user account. This doesn't uninstall it, and you can turn it back on at any time.

Do these steps in order:

1. Install Oriel and confirm it opens from your list of apps. If no home app is available, some TVs fall back to a setup screen or a factory test app.
2. Turn off the built-in home screen. On Google TV, it's usually:

```bash
adb shell pm disable-user --user 0 com.google.android.apps.tv.launcherx
```

   On Android TV without Google TV, it's usually `com.google.android.tvlauncher` instead.

3. Press **Home**. If the TV asks which app to use, choose **Oriel**.

To undo it, turn the built-in home screen back on:

```bash
adb shell pm enable com.google.android.apps.tv.launcherx
```

### Known risks

- On some models, turning off the built-in home screen affects setup screens, voice search, or casting from a phone.
- Firmware updates can turn the built-in home screen back on. Repeat the steps afterwards if you want to.
- Manufacturers customize their TVs heavily, so package names and behavior vary by model.

If you try this, a [device report](https://github.com/vishwavinoth/oriel-tv/issues/new?template=device_report.yml) helps other people with the same TV, including when something goes wrong.

## Seeing what's turned off

This lists every package that's currently disabled on the TV:

```bash
adb shell pm list packages -d
```
