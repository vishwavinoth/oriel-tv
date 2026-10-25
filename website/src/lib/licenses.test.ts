import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { checkLicenses, isAllowed, siteLibraries, type Lockfile } from "./licenses.ts";

test("SPDX expressions pass when any OR branch is fully allowed", () => {
  assert.equal(isAllowed("MIT"), true);
  assert.equal(isAllowed("(MIT OR GPL-3.0-only)"), true);
  assert.equal(isAllowed("Apache-2.0 AND MIT"), true);
  assert.equal(isAllowed("Apache-2.0 AND LGPL-3.0-or-later"), false);
  assert.equal(isAllowed("GPL-3.0-only"), false);
  assert.equal(isAllowed(undefined), false);
  // Mixed operators with parentheses need a person to read them.
  assert.equal(isAllowed("(MIT OR Apache-2.0) AND BSD-3-Clause"), false);
});

test("dev dependencies are skipped and build-only packages are exceptions, not violations", () => {
  const lock: Lockfile = {
    packages: {
      "": {},
      "node_modules/react": { version: "19.3.0", license: "MIT" },
      "node_modules/eslint-plugin-x": { version: "1.0.0", license: "GPL-3.0-only", dev: true },
      "node_modules/@img/sharp-libvips-linux-x64": { version: "1.0.0", license: "LGPL-3.0-or-later" },
      "node_modules/left-pad": { version: "1.0.0", license: "AGPL-3.0-only" },
    },
  };
  const result = checkLicenses(lock);
  assert.equal(result.checked, 3);
  assert.deepEqual(result.exceptions, ["@img/sharp-libvips-linux-x64 (LGPL-3.0-or-later)"]);
  assert.deepEqual(result.violations, ["left-pad@1.0.0: AGPL-3.0-only"]);
});

test("the website's real dependencies pass, and every shipped library has a known license", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8")) as Lockfile;
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as { dependencies: Record<string, string> };
  assert.deepEqual(checkLicenses(lock).violations, []);
  const libraries = siteLibraries(manifest, lock);
  assert.ok(libraries.some((library) => library.name === "react"));
  assert.ok(libraries.every((library) => isAllowed(library.license)));
});
