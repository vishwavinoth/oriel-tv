import { ArrowRight, LifeBuoy, Rocket, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Install Oriel TV, understand device changes and their risks, and fix common problems.",
  alternates: { canonical: "/docs/" },
};

const GUIDES: { href: string; title: string; body: string; Icon: LucideIcon }[] = [
  {
    href: "/docs/getting-started/",
    title: "Getting started",
    body: "Build Oriel, install it on your TV, and make it your own.",
    Icon: Rocket,
  },
  {
    href: "/docs/device-management/",
    title: "Device management",
    body: "ADB basics, the advanced home-screen option, and how to undo it.",
    Icon: ShieldCheck,
  },
  {
    href: "/docs/troubleshooting/",
    title: "Troubleshooting",
    body: "What to do when Home, apps, focus, or glass don’t behave.",
    Icon: LifeBuoy,
  },
  {
    href: "/contributing/",
    title: "Contributing",
    body: "Set up the project, follow the rules, and open a pull request.",
    Icon: Users,
  },
];

export default function DocsIndexPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="eyebrow">Documentation</p>
        <h1 className="text-[clamp(2rem,4vw,var(--o-text-title1-size))] leading-(--o-text-title1-line) font-bold tracking-(--o-text-title1-tracking)">
          Oriel TV docs
        </h1>
        <p className="max-w-[60ch] text-body-lg text-fg-2">
          Oriel hasn’t published a release yet, so these guides describe the current development build. Every guide is a Markdown file in the
          repository, and improvements are welcome.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(({ href, title, body, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group grid h-full content-start gap-2 rounded-lg border border-border bg-surface p-6 no-underline transition-[transform,border-color,background-color] duration-(--o-duration-base) hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-hover"
            >
              <Icon aria-hidden="true" className="size-5 text-accent" />
              <span className="flex items-center gap-1.5 text-title3">
                {title}
                <ArrowRight aria-hidden="true" className="size-4.5 text-fg-3 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="text-fg-2">{body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
