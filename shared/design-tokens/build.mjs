#!/usr/bin/env node
// Generates the platform token files from tokens.json.
// Usage: node shared/design-tokens/build.mjs [--check]
//   --check  Write nothing; exit with an error if a committed file is out of date.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss, renderKotlin, renderTs } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const tokens = JSON.parse(readFileSync(resolve(here, 'tokens.json'), 'utf8'));

const outputs = [
  {
    path: resolve(root, 'website/src/styles/tokens.css'),
    content: renderCss(tokens),
  },
  {
    path: resolve(root, 'website/src/lib/tokens.generated.ts'),
    content: renderTs(tokens),
  },
  {
    path: resolve(root, 'launcher/src/main/java/tv/oriel/launcher/ui/theme/OrielTokens.kt'),
    content: renderKotlin(tokens),
  },
];

const check = process.argv.includes('--check');
let stale = 0;

for (const { path, content } of outputs) {
  const name = relative(root, path).replaceAll('\\', '/');
  const current = existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null;

  if (check) {
    if (current !== content) {
      console.error(`Out of date: ${name}`);
      stale += 1;
    }
    continue;
  }

  if (current === content) {
    console.log(`Unchanged: ${name}`);
    continue;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`Wrote: ${name}`);
}

if (stale > 0) {
  console.error('Run "npm run tokens" from the repository root and commit the result.');
  process.exit(1);
}
