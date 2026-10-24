#!/usr/bin/env node
// Checks the static export in out/ after `npm run build`: every required route exists (PRD section 5.2),
// every page has a title and a single h1, and every internal link points at a file that exists.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out/", import.meta.url));

const REQUIRED = [
  "/",
  "/features/",
  "/devices/",
  "/docs/",
  "/docs/getting-started/",
  "/docs/device-management/",
  "/docs/troubleshooting/",
  "/downloads/",
  "/changelog/",
  "/contributing/",
  "/security/",
  "/privacy/",
  "/license/",
];
const EXTRA_FILES = ["404.html", "sitemap.xml", "robots.txt"];

const errors = [];
const fileFor = (route) => join(out, route, "index.html");

if (!existsSync(out)) {
  console.error("out/ doesn't exist. Run `npm run build` first.");
  process.exit(1);
}

for (const route of REQUIRED) {
  const file = fileFor(route);
  if (!existsSync(file)) {
    errors.push(`Missing route ${route}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
  if (!title.includes("Oriel")) errors.push(`${route}: title "${title}" doesn't mention Oriel`);
  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) errors.push(`${route}: expected one <h1>, found ${h1s}`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${route}: missing a meta description`);
}

for (const name of EXTRA_FILES) {
  if (!existsSync(join(out, name))) errors.push(`Missing ${name}`);
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== "_next") yield* htmlFiles(path);
    } else if (entry.endsWith(".html")) {
      yield path;
    }
  }
}

let checkedLinks = 0;
for (const file of htmlFiles(out)) {
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)) {
    if (href.startsWith("/_next/")) continue;
    checkedLinks += 1;
    const target = href.endsWith("/") ? join(out, href, "index.html") : join(out, href);
    if (!existsSync(target)) errors.push(`${relative(out, file)} links to ${href}, which doesn't exist`);
  }
}

if (errors.length > 0) {
  console.error(`Route check failed:\n- ${[...new Set(errors)].join("\n- ")}`);
  process.exit(1);
}
console.log(`Route check passed: ${REQUIRED.length} routes, ${EXTRA_FILES.length} files, ${checkedLinks} internal links.`);
