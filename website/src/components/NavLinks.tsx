"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const PRIMARY_NAV = [
  { href: "/features/", label: "Features" },
  { href: "/demo/", label: "Demo" },
  { href: "/devices/", label: "Devices" },
  { href: "/docs/", label: "Docs" },
  { href: "/downloads/", label: "Downloads" },
] as const;

const DOCS_NAV = [
  {
    title: "Guides",
    links: [
      { href: "/docs/", label: "Overview" },
      { href: "/docs/getting-started/", label: "Getting started" },
      { href: "/docs/device-management/", label: "Device management" },
      { href: "/docs/troubleshooting/", label: "Troubleshooting" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/contributing/", label: "Contributing" },
      { href: "/security/", label: "Security" },
      { href: "/privacy/", label: "Privacy" },
      { href: "/changelog/", label: "Changelog" },
      { href: "/license/", label: "License" },
    ],
  },
] as const;

/** Matches a nav link to the current page. Section links also match their child pages. */
export function isCurrent(pathname: string, href: string, exact = false): boolean {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return exact || href === "/docs/" ? path === href : path.startsWith(href);
}

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Documentation"
      className="grid gap-6 border-b border-border pb-6 md:sticky md:top-[calc(var(--header-height)+2rem)] md:self-start md:border-0 md:pb-0"
    >
      {DOCS_NAV.map((group) => (
        <div key={group.title}>
          <p className="eyebrow mb-2">{group.title}</p>
          <ul className="flex flex-wrap gap-0.5 md:grid">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(pathname, link.href, true) ? "page" : undefined}
                  className="block rounded-sm px-3 py-1.75 text-callout text-fg-2 no-underline hover:bg-surface hover:text-fg aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
