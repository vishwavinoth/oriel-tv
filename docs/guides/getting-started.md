# Getting started

Oriel is in public preview: it's ready to try on an Android TV or Google TV device you own, but nobody has tested it on a physical TV yet. Please [report how it goes](https://github.com/vishwavinoth/oriel-tv/issues/new?template=device_report.yml), including when something doesn't work.

> **Before you start:** Oriel replaces the home screen and nothing else. It doesn't remove ads inside streaming apps, and it doesn't change other apps or system settings.

## What you need

- An Android TV or Google TV device running Android 5.0 or newer. On Android 6.0 and older, pressing Home asks which home app to use; choose Oriel. Check the [compatibility notes](https://oriel-tv.vercel.app/devices/) for your platform first.
- A computer on the same Wi-Fi network as the TV, with [Android platform tools](https://developer.android.com/tools/releases/platform-tools) installed, which include `adb`.
- Only if you build Oriel yourself: JDK 17 or newer and the Android SDK. Android Studio includes both.

## 1. Get the launcher

Download `oriel-launcher-<version>.apk` and `SHA256SUMS.txt` from the [latest release](https://github.com/vishwavinoth/oriel-tv/releases/latest). To check the download, put both files in one folder and run:

```bash
sha256sum -c SHA256SUMS.txt --ignore-missing
```

On Windows, run `certutil -hashfile oriel-launcher-<version>.apk SHA256` and compare the result with the APK's line in `SHA256SUMS.txt`.

Or build it yourself:

```bash
git clone https://github.com/vishwavinoth/oriel-tv.git
cd oriel-tv
./gradlew :launcher:assembleDebug
```

On Windows, use `gradlew.bat` instead of `./gradlew`. The APK is written to `launcher/build/outputs/apk/debug/launcher-debug.apk`.

## 2. Turn on developer options on the TV

1. Open **Settings**, then **System**, then **About**. On some TVs it's under **Device Preferences**.
2. Select **Android TV OS build** (or **Build**) seven times, until the TV says you're a developer.
3. Go back, open **Developer options**, and turn on **USB debugging**. Some devices call it **ADB debugging** or **Network debugging**.

## 3. Install Oriel

Find the TV's IP address in its network settings, then run:

```bash
adb connect 192.168.1.50:5555
adb install -r oriel-launcher-<version>.apk
```

Use the debug APK's path instead if you built it yourself. The first time you connect, the TV asks whether to allow debugging from your computer. Accept it. If a build you made yourself is already installed, uninstall it first (see [Uninstall](#uninstall)), because releases are signed with a different key.

> **Security:** Network debugging isn't encrypted, so anyone on your network could connect while it's on. Turn it off when you're done, as described in [Device management](device-management.md).

## 4. Open Oriel

Oriel appears in your TV's list of apps as **Oriel**. Open it there to try it before changing anything else.

## 5. Make it your home screen (optional)

- **Android TV:** press **Home**. If the TV asks which app to use, choose **Oriel**, then **Always**.
- **Google TV, and many Android TV devices:** there's no setting for this. [Device management](device-management.md) explains the advanced option, its risks, and how to undo it.
- **Fire TV:** not possible. Fire OS always returns to Amazon's home screen.

## Make it yours

- **Favorites:** press and hold **OK** on any app (or press **Menu**, if your remote has one) to add it to Favorites, move it, or hide it.
- **Settings:** select the settings button at the top right to choose a theme, accent color, wallpaper, and clock, and to turn on **Reduce transparency** or **Reduce motion**.
- **Restore defaults:** at the bottom of Settings. It brings back hidden apps and the default favorites.

## Uninstall

```bash
adb uninstall tv.oriel.launcher
```

You can also uninstall Oriel from the TV's app settings. Your Oriel settings are deleted along with it.
