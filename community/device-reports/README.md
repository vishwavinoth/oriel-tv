# Device reports

Each JSON file in this folder records one person's test of Oriel on one TV. The website builds its [Community page](https://oriel-tv.vercel.app/community/) and the [Devices page](https://oriel-tv.vercel.app/devices/) from these files, so a report shows up on both once it's merged.

Only report a TV you tested yourself. A report is labeled as a community report, and nothing becomes "verified" unless the project tested it on its own hardware.

## Add a report

1. Test a build of Oriel on your own TV. If you use Control Center, its **Copy report** button gives you the model, the Android version, and Oriel's version.
2. Add a file named `<manufacturer>-<model>-<your-github-username>.json`, in lowercase with hyphens, such as `example-living-room-55-octo-cat.json`.
3. Fill in the fields below.
4. Check it with `cd website && npm test && npm run build`. If anything is wrong, the error names the file and the field.
5. Open a pull request.

If you'd rather not edit files, [open a device report issue](https://github.com/vishwavinoth/oriel-tv/issues/new?template=device_report.yml) and a maintainer will add the file for you.

## Fields

| Field | Required | Value |
| --- | --- | --- |
| `device` | Yes | The model name, as on the box or in the TV's About screen. Up to 80 characters. |
| `manufacturer` | Yes | Who made it. Up to 40 characters. |
| `platform` | Yes | `Google TV`, `Android TV`, `Fire TV`, or `Other Android-based TV`. |
| `androidVersion` | Yes | The Android version, such as `12`. |
| `orielVersion` | Yes | The Oriel version, such as `0.1.0`, or the commit you built. |
| `testedBy` | Yes | Your GitHub username. |
| `testedOn` | Yes | The date you tested, as `YYYY-MM-DD`. |
| `testedOnPhysicalDevice` | Yes | Must be `true`: you tested this on the TV described. |
| `worked` | Yes | The things that worked, from the list below. Leave out anything that didn't, or that you didn't try. |
| `problems` | No | Anything that didn't work, looked wrong, or felt slow, in plain text. Up to 1000 characters. |
| `verifiedByProject` | No | Maintainers only: `true` when the project tested this on its own hardware. |

Any other field is refused, so a typo fails the check instead of being ignored.

### What can go in `worked`

| Item | Meaning |
| --- | --- |
| `install` | Installing the launcher |
| `openFromAppList` | Opening it from the app list |
| `setAsHome` | Setting it as the default home screen |
| `showApps` | Showing and opening installed apps |
| `dpad` | D-pad navigation and focus |
| `favorites` | Favorites and hiding apps |
| `themes` | Themes, wallpapers, and theme packs |
| `controlPanel` | The control panel's shortcuts |
| `controlCenter` | Control Center's operations |

## Example

This is only an example. It isn't a real report, and it's not loaded because it isn't a `.json` file.

```json
{
  "device": "Living Room 55",
  "manufacturer": "Example",
  "platform": "Google TV",
  "androidVersion": "12",
  "orielVersion": "0.1.0",
  "testedBy": "octo-cat",
  "testedOn": "2026-11-02",
  "testedOnPhysicalDevice": true,
  "worked": ["install", "openFromAppList", "showApps", "dpad", "favorites", "themes"],
  "problems": "Pressing Home still opens the built-in home screen. Oriel works when opened from the app list."
}
```

## Privacy

Don't include serial numbers, network addresses, account names, or your list of apps. The format has no place for them, and Control Center's device report already leaves them out.
