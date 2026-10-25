#!/usr/bin/env node
// Fails when a production dependency of the website uses a license Oriel doesn't allow (PRD section 9.2).

import { readFileSync } from "node:fs";
import { BUILD_ONLY, checkLicenses } from "../src/lib/licenses.ts";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const { checked, violations, exceptions } = checkLicenses(lock);

if (violations.length > 0) {
  console.error("License check failed. These production packages use licenses Oriel doesn't allow:");
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}

console.log(`License check passed: ${checked} production packages, ${exceptions.length} used only while building:`);
for (const rule of BUILD_ONLY) console.log(`  ${rule.pattern.source} — ${rule.reason}`);
