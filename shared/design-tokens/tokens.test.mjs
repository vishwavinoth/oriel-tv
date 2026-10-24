// Checks that the token palette stays legible (PRD section 4.3, ADR 0004) and that the
// generators emit what the website and launcher expect. Run: npm run test:tokens

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { composite, contrastRatio, parseColor, renderCss, renderKotlin, renderTs, toArgbHex } from './lib.mjs';

const tokens = JSON.parse(readFileSync(new URL('./tokens.json', import.meta.url), 'utf8'));
const THEMES = ['dark', 'light'];
const BACKDROPS = { white: parseColor('#FFFFFF'), black: parseColor('#000000') };

/** Paints translucent layers, bottom first, over an opaque backdrop. */
const flatten = (layers, backdrop) => layers.reduce((under, layer) => composite(parseColor(layer), under), backdrop);
const ratio = (fg, bg) => contrastRatio(parseColor(fg), typeof bg === 'string' ? parseColor(bg) : bg);

function assertContrast(actual, minimum, label) {
  assert.ok(actual >= minimum, `${label}: ${actual.toFixed(2)}:1 is below ${minimum}:1`);
}

test('parseColor reads hex and rgba values', () => {
  assert.deepEqual(parseColor('#07090F'), { r: 7, g: 9, b: 15, a: 1 });
  assert.deepEqual(parseColor('rgba(255, 255, 255, 0.5)'), { r: 255, g: 255, b: 255, a: 0.5 });
  assert.equal(toArgbHex(parseColor('rgba(0, 0, 0, 0.35)')), '59000000');
  assert.throws(() => parseColor('blue'));
});

test('contrastRatio matches known WCAG values', () => {
  assert.equal(contrastRatio(BACKDROPS.white, BACKDROPS.black), 21);
  assert.equal(contrastRatio(BACKDROPS.white, BACKDROPS.white), 1);
});

for (const theme of THEMES) {
  const color = tokens.color[theme];
  const glass = tokens.glass[theme];

  test(`${theme}: text meets 4.5:1 on every opaque surface`, () => {
    for (const text of ['textPrimary', 'textSecondary', 'textTertiary']) {
      for (const surface of ['background', 'backgroundRaised', 'surface', 'surfaceHover']) {
        assertContrast(ratio(color[text], color[surface]), 4.5, `${text} on ${surface}`);
      }
    }
  });

  test(`${theme}: every accent meets 4.5:1 with its on-accent text`, () => {
    for (const [id, accent] of Object.entries(tokens.accent.options)) {
      assertContrast(ratio(color.onAccent, accent[theme]), 4.5, `onAccent on ${id}`);
    }
  });

  test(`${theme}: focus ring and status colors meet 3:1 on the background`, () => {
    for (const name of ['focusRing', 'success', 'warning', 'danger', 'info']) {
      assertContrast(ratio(color[name], color.background), 3, `${name} on background`);
    }
  });

  test(`${theme}: text on regular glass stays legible over any backdrop`, () => {
    for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
      const surface = flatten([glass.regular], backdrop);
      assertContrast(ratio(color.textPrimary, surface), 4.5, `textPrimary on regular glass over ${backdropName}`);
      assertContrast(ratio(color.textSecondary, surface), 3, `textSecondary on regular glass over ${backdropName}`);
    }
  });

  test(`${theme}: content on clear glass stays legible over a scrimmed wallpaper`, () => {
    for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
      const surface = flatten([glass.scrim, glass.dim, glass.clear], backdrop);
      assertContrast(ratio(color.textPrimary, surface), 4.5, `textPrimary on clear glass over ${backdropName}`);
    }
  });

  test(`${theme}: large text on the wallpaper scrim stays at 3:1 over any backdrop`, () => {
    // The clock and section titles sit directly on the wallpaper, always at large-text sizes.
    for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
      const surface = flatten([glass.scrim], backdrop);
      assertContrast(ratio(color.textPrimary, surface), 3, `textPrimary on scrim over ${backdropName}`);
    }
  });

  // Apple HIG, Materials: thicker materials give more contrast, thinner ones keep more context.
  // Regular and thick carry body text; thin carries large text; ultra-thin sits over the scrimmed
  // wallpaper. Quaternary labels are never used on thin or ultra-thin materials (ADR 0005).
  test(`${theme}: regular and thick materials carry body text over any backdrop`, () => {
    const material = tokens.material[theme];
    for (const thickness of ['regular', 'thick']) {
      for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
        const surface = flatten([material[thickness]], backdrop);
        assertContrast(ratio(color.textPrimary, surface), 4.5, `textPrimary on ${thickness} material over ${backdropName}`);
        assertContrast(ratio(color.textSecondary, surface), 3, `textSecondary on ${thickness} material over ${backdropName}`);
      }
    }
  });

  test(`${theme}: thin material carries large text over any backdrop`, () => {
    for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
      const surface = flatten([tokens.material[theme].thin], backdrop);
      assertContrast(ratio(color.textPrimary, surface), 3, `textPrimary on thin material over ${backdropName}`);
    }
  });

  test(`${theme}: ultra-thin material stays legible over the scrimmed wallpaper`, () => {
    for (const [backdropName, backdrop] of Object.entries(BACKDROPS)) {
      const surface = flatten([glass.scrim, tokens.material[theme].ultraThin], backdrop);
      assertContrast(ratio(color.textPrimary, surface), 3, `textPrimary on ultra-thin material over ${backdropName}`);
    }
  });

  test(`${theme}: materials get thicker in order`, () => {
    const alphas = ['ultraThin', 'thin', 'regular', 'thick'].map((name) => parseColor(tokens.material[theme][name]).a);
    assert.deepEqual([...alphas].sort((a, b) => a - b), alphas, 'opacity increases from ultra-thin to thick');
    const blurs = ['ultraThin', 'thin', 'regular', 'thick'].map((name) => tokens.material.blur[name]);
    assert.deepEqual([...blurs].sort((a, b) => a - b), blurs, 'blur increases from ultra-thin to thick');
  });

  test(`${theme}: the solid fallback keeps text at 4.5:1`, () => {
    for (const text of ['textPrimary', 'textSecondary']) {
      assertContrast(ratio(color[text], glass.solid), 4.5, `${text} on solid glass`);
    }
  });
}

test('every accent defines both theme variants', () => {
  assert.ok(tokens.accent.options[tokens.accent.default], 'default accent exists');
  for (const [id, accent] of Object.entries(tokens.accent.options)) {
    assert.ok(accent.label && accent.dark && accent.light, `${id} is complete`);
  }
});

test('every wallpaper is complete and the default exists', () => {
  assert.ok(tokens.wallpaper.options[tokens.wallpaper.default], 'default wallpaper exists');
  for (const [id, wallpaper] of Object.entries(tokens.wallpaper.options)) {
    assert.ok(['dark', 'light'].includes(wallpaper.tone), `${id} has a tone`);
    assert.doesNotThrow(() => parseColor(wallpaper.base), `${id} base color`);
    assert.ok(wallpaper.glows.length > 0, `${id} has glows`);
    for (const glow of wallpaper.glows) {
      assert.doesNotThrow(() => parseColor(glow.color));
      for (const key of ['x', 'y', 'radius']) {
        assert.ok(glow[key] >= 0 && glow[key] <= 1, `${id} glow ${key} is between 0 and 1`);
      }
    }
  }
});

test('renderCss includes themes and accessibility overrides', () => {
  const css = renderCss(tokens);
  assert.match(css, /--o-color-text-primary: var\(--o-raw-color-text-primary\);/);
  assert.match(css, /@media \(prefers-color-scheme: light\)/);
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\)[\s\S]*--o-glass-regular: var\(--o-glass-solid\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*--o-focus-scale: 1;/);
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\)[\s\S]*--o-material-thin: var\(--o-glass-solid\);/);
  assert.match(css, /--o-material-ultra-thin: var\(--o-raw-material-ultra-thin\);/);
  assert.match(css, /:root\[data-accent="amber"\]/);
  assert.match(css, /--o-wallpaper-dusk: radial-gradient\(75% 75% at 82% 92%/);
});

test('renderCss scopes themes so a preview can differ from the page', () => {
  const css = renderCss(tokens);
  const lightScope = css.indexOf('[data-oriel-scope][data-theme="light"] {');
  const reducedScope = css.indexOf('[data-oriel-scope][data-transparency="reduced"] {');
  assert.ok(lightScope > 0, 'light scope exists');
  assert.ok(reducedScope > lightScope, 'reduced transparency overrides come after the scoped themes');
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\) \{\n {2}\[data-oriel-scope\]\[data-theme\] \{/);
});

test('renderTs lists every accent and wallpaper', () => {
  const ts = renderTs(tokens);
  for (const id of [...Object.keys(tokens.accent.options), ...Object.keys(tokens.wallpaper.options)]) {
    assert.match(ts, new RegExp(`"id": "${id}"`));
  }
  assert.match(ts, /export const defaultWallpaper: WallpaperId = "dusk";/);
});

test('renderKotlin emits ARGB color literals and every accent', () => {
  const kotlin = renderKotlin(tokens);
  assert.match(kotlin, /val Background = Color\(0xFF07090F\)/);
  assert.match(kotlin, /val Dim = Color\(0x59000000\)/);
  for (const id of [...Object.keys(tokens.accent.options), ...Object.keys(tokens.wallpaper.options)]) {
    assert.match(kotlin, new RegExp(`id = "${id}"`));
  }
  assert.doesNotMatch(kotlin, /NaN|undefined/);
});
