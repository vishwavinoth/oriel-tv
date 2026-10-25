# Translations

The Oriel Launcher is translated with Android string resources. English is the source, in `launcher/src/main/res/values/strings.xml`, and each language has its own `values-<language>/strings.xml`. The launcher follows the TV's language, and on Android 13 and newer people can also choose Oriel's language on its own in the system settings.

## Status

The first translations are drafts. They were written without a native speaker, so each needs a native speaker's review before it's part of a release. Every draft says so at the top of its file, and the tests fail if a language has no review status.

| Language | Folder | Direction | Status |
| --- | --- | --- | --- |
| Spanish | `values-es` | Left to right | Draft, needs native-speaker review |
| French | `values-fr` | Left to right | Draft, needs native-speaker review |
| German | `values-de` | Left to right | Draft, needs native-speaker review |
| Hindi | `values-hi` | Left to right | Draft, needs native-speaker review |
| Tamil | `values-ta` | Left to right | Draft, needs native-speaker review |
| Arabic | `values-ar` | Right to left | Draft, needs native-speaker review |

## Review a translation

1. Open the language's `strings.xml` next to the English one, and read every string in context. The comments in the English file explain the tricky ones.
2. Fix anything that reads unnaturally, uses the wrong word for a TV setting on your platform, or is too long for a button.
3. Replace the file's top comment with `<!-- <Language>. Reviewed by <your name or GitHub handle>, <YYYY-MM-DD>. -->`, update the table above, and open a pull request.

If you can, check it on a TV or an emulator: set the TV's language, or on Android 13 and newer run `adb shell cmd locale set-app-locales tv.oriel.launcher --locales <language>`.

## Add a language

1. Copy `values/strings.xml` to `values-<language>/strings.xml`. Use Android's folder names, such as `values-pt-rBR` for Brazilian Portuguese.
2. Translate every string. Lint fails the build if one is missing, and the tests check that every placeholder (`%1$s`, `%2$s`) is still there.
3. Mark the file as a draft or as reviewed, as above, and add a row to the table.

## Rules for translators

- Keep **Oriel**, **Android**, **Apache**, and **Gradle** as they are. Keep **OK**, the name of the remote's center button, as it appears on remotes in your language.
- "Move left" and "Move right" move an app toward the start or the end of the row. In a right-to-left language, the start is on the right, so translate them by direction on screen.
- Accent, wallpaper, and theme pack names come from the design tokens. Translate their meaning, not their spelling: "Aurora" is the northern lights, not the dawn.
- Don't use straight quotes or apostrophes (`'`, `"`): Android strings treat them as special characters. Use typographic ones (`’`, `“ ”`, `„ “`).
- Match the tone of the English: short, plain, and friendly, without exclamation marks.
