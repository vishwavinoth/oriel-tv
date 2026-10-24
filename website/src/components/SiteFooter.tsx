import Link from "next/link";
import { site } from "@/config/site";
import { OrielMark } from "./OrielMark";

const GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/features/", label: "Features" },
      { href: "/devices/", label: "Compatibility" },
      { href: "/downloads/", label: "Downloads" },
      { href: "/changelog/", label: "Changelog" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/docs/", label: "Documentation" },
      { href: "/docs/getting-started/", label: "Getting started" },
      { href: "/docs/troubleshooting/", label: "Troubleshooting" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: site.repoUrl, label: "GitHub repository" },
      { href: site.releasesUrl, label: "Releases" },
      { href: "/contributing/", label: "Contributing" },
      { href: "/security/", label: "Security" },
      { href: "/privacy/", label: "Privacy" },
      { href: "/license/", label: "License" },
    ],
  },
];

const linkClass = "text-callout text-fg-2 no-underline hover:text-fg hover:underline hover:underline-offset-3";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-raised pt-16 pb-8">
      <div className="page-width grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="grid content-start gap-3 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-self-start text-[1.0625rem] font-bold no-underline">
            <OrielMark className="size-8 rounded-[9px]" />
            Oriel TV
          </Link>
          <p className="text-callout text-fg-2">{site.promise}</p>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="eyebrow mb-3">{group.title}</p>
            <ul className="grid gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="page-width mt-12 flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-caption text-fg-3">
        <p>{site.copyright}. Licensed under the Apache License 2.0.</p>
        <p>Oriel TV is an independent project and isn’t affiliated with Google, Apple, or any TV manufacturer.</p>
      </div>
    </footer>
  );
}
