// Public identity and links for the website. Each URL can be overridden per deployment with a
// NEXT_PUBLIC_* environment variable, so forks and preview deployments don't need code changes.

const repoUrl = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/vishwavinoth/oriel-tv";

export const site = {
  name: "Oriel TV",
  shortName: "Oriel",
  tagline: "Your TV. Your atmosphere.",
  promise: "Beautiful by design. Open by nature.",
  description: "A beautiful, customizable, privacy-first Smart TV experience built in the open.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oriel-tv.vercel.app",
  repoUrl,
  releasesUrl: `${repoUrl}/releases`,
  issuesUrl: `${repoUrl}/issues`,
  securityReportUrl: `${repoUrl}/security/advisories/new`,
  copyright: `© ${new Date().getFullYear()} Vishwa R and the Oriel TV contributors`,
} as const;

export type IssueTemplate = "bug_report.yml" | "feature_request.yml" | "device_report.yml";

/** Opens a new issue with one of the forms in .github/ISSUE_TEMPLATE. */
export function newIssueUrl(template: IssueTemplate): string {
  return `${site.repoUrl}/issues/new?template=${template}`;
}

/** Links to a file on the default branch, for repository files the site doesn't render. */
export function repoFileUrl(path: string): string {
  return `${site.repoUrl}/blob/main/${path}`;
}
