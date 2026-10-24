// Checks the website's npm dependencies against the licenses Oriel allows (PRD section 9.2) and lists the libraries
// the site ships. Shared by scripts/check-licenses.mjs, the License page, and the tests.

export const ALLOWED_LICENSES: ReadonlySet<string> = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "CC0-1.0",
  "Unlicense",
  "BlueOak-1.0.0",
]);

/** Packages used only while building the site. None of their code or data reaches visitors. */
export const BUILD_ONLY: readonly { pattern: RegExp; reason: string }[] = [
  {
    pattern: /^@img\/sharp-/,
    reason: "Prebuilt image tools Next.js can load while building. The site uses no image optimization, and nothing from them ships.",
  },
  { pattern: /^caniuse-lite$/, reason: "Browser support data (CC-BY-4.0) that build tools read. It isn't shipped to visitors." },
];

/**
 * Whether an SPDX expression is allowed: any OR branch whose AND terms are all allowed. Expressions that mix
 * parentheses with both operators are refused, so they get a human review instead of a guess.
 */
export function isAllowed(expression: string | undefined): boolean {
  if (!expression) return false;
  if (expression.includes("(") && / AND /.test(expression) && / OR /.test(expression)) return false;
  const flat = expression.replace(/[()]/g, " ").trim();
  return flat.split(/\s+OR\s+/).some((option) => option.split(/\s+AND\s+/).every((id) => ALLOWED_LICENSES.has(id.trim())));
}

interface LockPackage {
  version?: string;
  license?: string;
  dev?: boolean;
}

export interface Lockfile {
  packages: Record<string, LockPackage>;
}

export function checkLicenses(lock: Lockfile): { checked: number; violations: string[]; exceptions: string[] } {
  const violations: string[] = [];
  const exceptions: string[] = [];
  let checked = 0;
  for (const [key, pkg] of Object.entries(lock.packages)) {
    if (!key || pkg.dev) continue;
    checked += 1;
    if (isAllowed(pkg.license)) continue;
    const name = key.replace(/^.*node_modules\//, "");
    if (BUILD_ONLY.some((rule) => rule.pattern.test(name))) exceptions.push(`${name} (${pkg.license})`);
    else violations.push(`${name}@${pkg.version ?? "?"}: ${pkg.license ?? "no license declared"}`);
  }
  return { checked, violations, exceptions };
}

/** The site's direct runtime dependencies, which are what visitors' browsers download. */
export function siteLibraries(manifest: { dependencies?: Record<string, string> }, lock: Lockfile): { name: string; version: string; license: string }[] {
  return Object.keys(manifest.dependencies ?? {})
    .sort()
    .map((name) => {
      const pkg = lock.packages[`node_modules/${name}`] ?? {};
      return { name, version: pkg.version ?? "", license: pkg.license ?? "Unknown" };
    });
}
