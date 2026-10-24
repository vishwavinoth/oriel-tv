# Troubleshooting

If your problem isn't here, [open a bug report](https://github.com/vishwavinoth/oriel-tv/issues/new?template=bug_report.yml) with your TV model and software version.

## The Home button still opens the old home screen

Most Google TV devices, and many Android TV devices, have no setting to change the home app. Oriel still works when you open it from your list of apps. [Device management](device-management.md) explains the advanced option and its risks.

## An app is missing from Oriel

Oriel shows every app that can be opened from a home screen, including TV apps and phone apps that were installed on the TV. If an app is missing:

- Check whether you hid it. **Settings → Restore defaults** brings hidden apps back.
- Some system services have no screen to open, so they never appear in any launcher.
- Return to Oriel after installing or removing an app; the list refreshes when the launcher comes back to the front.

## Focus moved somewhere unexpected

Focus should stay where you left it after you close Settings or return from an app. If it doesn't, please report it with the steps that led there; that's a bug.

## The glass looks flat or solid

That's expected in these cases:

- **Reduce transparency** is on in Oriel's Settings.
- The TV runs Android 11 or older. Real blur needs Android 12, so older TVs get a tinted translucent surface instead, which keeps navigation fast.

## Animations feel slow, or I'd rather not have them

Turn on **Reduce motion** in Oriel's Settings. It removes scaling and fading animations.

## After a firmware update, things changed back

Firmware updates can re-enable the built-in home screen or other packages you turned off. Repeat the steps in [Device management](device-management.md) if you want to.

## Casting or voice search stopped working

If you turned off the built-in home screen, turn it back on with the restore command in [Device management](device-management.md), and check whether the problem goes away. Then report what you found.

## How do I remove Oriel completely?

```bash
adb uninstall tv.oriel.launcher
```

If you turned off the built-in home screen, turn it back on first.
