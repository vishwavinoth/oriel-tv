# Asset register

Every font, icon, image, and other media file used by Oriel must be listed here with its source and license (PRD section 9.2). Original work is licensed under the Apache License 2.0 with the rest of the project. The Oriel name and logo are also covered by [TRADEMARKS.md](../TRADEMARKS.md).

| Asset | Where it's used | Source | License |
|---|---|---|---|
| `assets/brand/oriel-mark.svg`: the Oriel mark, an arched bay window with six panes | Website (`website/src/components/OrielMark.tsx`, `website/src/app/icon.svg`), launcher icon and TV banner (`launcher/src/main/res/drawable/`) | Created for this project | Apache-2.0, trademark policy applies |
| Wallpapers ("atmospheres": Dusk, Lagoon, Aurora, Ember, Mist, Dawn) | Website and launcher, generated from `shared/design-tokens/tokens.json` | Created for this project as gradient definitions | Apache-2.0 |
| Launcher demo app glyphs (fictional apps) | `website/src/components/demo/AppGlyph.tsx` | Created for this project | Apache-2.0 |
| Launcher settings glyph | `launcher/src/main/java/tv/oriel/launcher/ui/HomeScreen.kt` | Created for this project | Apache-2.0 |
| Website interface icons | Throughout `website/src/` | [Lucide](https://lucide.dev), installed as the `lucide-react` npm dependency, not copied into the repository | ISC |

## Fonts

Oriel ships no font files. The website uses each visitor's system font stack, and the launcher uses the TV's system font.
