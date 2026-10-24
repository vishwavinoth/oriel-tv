// Reads the repository's own documents at build time, so the website shows the same text people see on
// GitHub. Server-only: it uses the file system and runs during `next build`.

import { readFileSync } from "node:fs";
import path from "node:path";
import { site } from "@/config/site";
import { parseMarkdown, plainText, type Block } from "@/lib/markdown/parse";

const repoRoot = path.resolve(process.cwd(), "..");

/** Repository files the website renders as pages. Links between them stay on the site. */
const ROUTES: Record<string, string> = {
  "CHANGELOG.md": "/changelog/",
  "CONTRIBUTING.md": "/contributing/",
  "SECURITY.md": "/security/",
  "PRIVACY.md": "/privacy/",
  "TRADEMARKS.md": "/license/#trademarks",
  LICENSE: "/license/",
  NOTICE: "/license/",
  "docs/guides/getting-started.md": "/docs/getting-started/",
  "docs/guides/device-management.md": "/docs/device-management/",
  "docs/guides/troubleshooting.md": "/docs/troubleshooting/",
};

export function readRepoFile(relativePath: string): string {
  const file = path.join(repoRoot, relativePath);
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(
      `Couldn't read ${relativePath} from the repository root (${repoRoot}). The website build needs the whole ` +
        `repository, not only website/. On Vercel, keep "Include files outside the root directory" turned on.`,
      { cause: error },
    );
  }
}

/** Maps a link inside a repository document to a website route, or to the file on GitHub. */
export function resolveRepoLink(href: string, fromFile: string): string {
  // Documents link to website pages with full URLs, so the links also work on GitHub.
  if (href.startsWith(`${site.url}/`)) return href.slice(site.url.length);
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) return href;
  const [target, hash] = href.split("#");
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), target));
  const route = ROUTES[resolved];
  if (route) return hash && !route.includes("#") ? `${route}#${hash}` : route;
  return `${site.repoUrl}/blob/main/${resolved}${hash ? `#${hash}` : ""}`;
}

export interface RepoDoc {
  title: string;
  blocks: Block[];
  resolveLink: (href: string) => string;
}

/** Parses a Markdown file and lifts its first top-level heading out as the page title. */
export function loadRepoDoc(relativePath: string): RepoDoc {
  const blocks = parseMarkdown(readRepoFile(relativePath));
  const first = blocks[0];
  const title = first?.type === "heading" && first.level === 1 ? plainText(first.children) : relativePath;
  return {
    title,
    blocks: first?.type === "heading" && first.level === 1 ? blocks.slice(1) : blocks,
    resolveLink: (href) => resolveRepoLink(href, relativePath),
  };
}
