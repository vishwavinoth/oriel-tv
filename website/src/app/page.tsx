import {
  ArrowRight,
  BookOpen,
  Bug,
  Check,
  Code,
  Download,
  ExternalLink,
  GitBranch,
  Lightbulb,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LauncherDemo } from "@/components/demo/LauncherDemo";
import { Reveal } from "@/components/motion/Reveal";
import { StatusPill, type Tone } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { newIssueUrl, site } from "@/config/site";
import { COMPATIBILITY, type Support } from "@/data/compatibility";
import { FEATURES } from "@/data/features";

const STEPS = [
  {
    title: "Install Oriel",
    body: "Build the launcher, or download it once releases are published, and install it on your TV with ADB.",
  },
  {
    title: "Make it your home",
    body: "On TVs that allow it, press Home and choose Oriel. Where they don’t, open it from your apps, or follow the advanced guide.",
  },
  {
    title: "Make it yours",
    body: "Pick favorites, hide apps you never use, and choose a theme, accent, and wallpaper.",
  },
];

const PRIVACY_FACTS = [
  "No network permission, so the launcher can’t send data anywhere",
  "No accounts, analytics, advertising, or tracking",
  "Settings stay on the TV and leave with the app when you uninstall it",
  "The website uses no cookies, analytics, or third-party scripts",
];

const OPEN_SOURCE: { title: string; body: string; href: string; Icon: LucideIcon }[] = [
  { title: "Browse the source", body: "Every line, Apache 2.0.", href: site.repoUrl, Icon: Code },
  { title: "Download releases", body: "Builds with checksums, once published.", href: "/downloads/", Icon: Download },
  { title: "Read the docs", body: "Setup, device notes, and fixes.", href: "/docs/", Icon: BookOpen },
  { title: "Report a bug", body: "Tell us what went wrong.", href: newIssueUrl("bug_report.yml"), Icon: Bug },
  { title: "Propose a feature", body: "Describe the problem it solves.", href: newIssueUrl("feature_request.yml"), Icon: Lightbulb },
  { title: "Contribute", body: "Code, design, translations, reports.", href: "/contributing/", Icon: Users },
  { title: "Review security", body: "How to report a vulnerability.", href: "/security/", Icon: ShieldCheck },
];

const HOME_SUPPORT: Record<Support, { tone: Tone; label: string }> = {
  yes: { tone: "success", label: "Home screen" },
  partial: { tone: "partial", label: "Home screen with extra steps" },
  no: { tone: "danger", label: "No home screen" },
  unknown: { tone: "neutral", label: "Unknown" },
};

function SectionHeader({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <Reveal className="mb-10 grid max-w-180 gap-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className="text-[clamp(1.6rem,3.2vw,var(--o-text-title2-size))] leading-(--o-text-title2-line) font-semibold tracking-(--o-text-title2-tracking)"
      >
        {title}
      </h2>
      {children && <p className="text-body-lg text-fg-2">{children}</p>}
    </Reveal>
  );
}

function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-[calc(var(--header-height)+clamp(3.5rem,9vw,7.5rem))] pb-16" aria-labelledby="hero-title">
        <div className="ambient" aria-hidden="true" />
        <div className="page-width rise grid justify-items-center gap-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-raised/70 px-3.5 py-1.5 text-caption font-semibold text-fg-2">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            Open source · Android TV and Google TV · Early development
          </p>
          <h1
            id="hero-title"
            className="max-w-[14ch] text-[clamp(2.75rem,7.4vw,var(--o-text-display-size))] leading-(--o-text-display-line) font-bold tracking-(--o-text-display-tracking)"
          >
            Your TV deserves a better home.
          </h1>
          <p className="max-w-[46ch] text-[clamp(1.0625rem,1.7vw,var(--o-text-body-large-size))] leading-(--o-text-body-large-line) text-fg-2">
            {site.description} Oriel shows only your apps, arranged your way, and the launcher never sends anything anywhere.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/features/">
                Explore the Project
                <ArrowRight aria-hidden="true" className="size-4.5" />
              </Link>
            </Button>
            <Button asChild variant="glass">
              <a href={site.repoUrl}>
                View Source Code
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="page-width rise mt-14 [animation-delay:150ms]">
          <LauncherDemo />
        </div>
      </section>

      <section className="py-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="features-title">
        <div className="page-width">
          <SectionHeader id="features-title" eyebrow="What Oriel does" title="A calmer home screen that stays out of your way">
            Eight promises shape every decision. All of them are in the current development build, which hasn’t been verified on a TV yet.
          </SectionHeader>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <li key={feature.id}>
                <Reveal delay={(index % 4) * 0.06} className="grid h-full content-start gap-3 rounded-lg border border-border bg-surface p-6">
                  <span className="grid size-11 place-items-center rounded-sm bg-accent/15 text-accent">
                    <feature.icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="text-[1.1875rem] leading-snug font-semibold">{feature.title}</h3>
                  <p className="text-callout text-fg-2">{feature.summary}</p>
                  <StatusPill tone={feature.status.tone} className="mt-1 justify-self-start">
                    {feature.status.label}
                  </StatusPill>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href="/features/" className="inline-flex items-center gap-1.5 font-semibold text-accent no-underline hover:underline">
              See every feature in detail
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-raised py-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="steps-title">
        <div className="page-width">
          <SectionHeader id="steps-title" eyebrow="How it works" title="Three steps from the box to your own home screen" />
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 0.08} className="grid h-full content-start gap-3 rounded-lg border border-border bg-surface p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-fg text-callout font-bold text-background" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="text-title3">{step.title}</h3>
                  <p className="text-fg-2">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-callout text-fg-2">
            Oriel changes the home screen only. It can’t remove ads inside streaming apps; those belong to the apps themselves.{" "}
            <Link href="/docs/getting-started/" className="font-semibold text-accent underline underline-offset-3">
              Read the getting started guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="privacy-title">
        <div className="page-width grid items-center gap-10 lg:grid-cols-2">
          <Reveal className="grid gap-4">
            <p className="eyebrow">Privacy by design</p>
            <h2
              id="privacy-title"
              className="text-[clamp(1.6rem,3.2vw,var(--o-text-title2-size))] leading-(--o-text-title2-line) font-semibold tracking-(--o-text-title2-tracking)"
            >
              Nothing leaves your TV
            </h2>
            <p className="text-body-lg text-fg-2">
              Oriel is local-first. It works without an account or a cloud service, and its privacy policy describes what the code actually does.
            </p>
            <p>
              <Link href="/privacy/" className="inline-flex items-center gap-1.5 font-semibold text-accent no-underline hover:underline">
                Read the privacy policy
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="grid gap-3">
              {PRIVACY_FACTS.map((fact) => (
                <li key={fact} className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
                  <Check aria-hidden="true" strokeWidth={2.6} className="mt-0.5 size-4.5 shrink-0 text-success" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-raised py-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="compat-title">
        <div className="page-width">
          <SectionHeader id="compat-title" eyebrow="Honest compatibility" title="What to expect on each platform">
            These are expectations from how each platform works, not test results. No device has been verified yet, and the device list says
            so.
          </SectionHeader>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPATIBILITY.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
                <div>
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-callout text-fg-2">{entry.system}</p>
                </div>
                <StatusPill tone={HOME_SUPPORT[entry.capabilities.home.support].tone} className="self-start">
                  {HOME_SUPPORT[entry.capabilities.home.support].label}
                </StatusPill>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href="/devices/" className="inline-flex items-center gap-1.5 font-semibold text-accent no-underline hover:underline">
              Explore compatibility details
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="open-title">
        <div className="page-width">
          <SectionHeader id="open-title" eyebrow="Built in the open" title="Beautiful by design. Open by nature.">
            Oriel is a community project with no subscriptions or accounts. Here’s how to take part.
          </SectionHeader>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OPEN_SOURCE.map((item) => (
              <li key={item.title}>
                <SmartLink
                  href={item.href}
                  className="group grid h-full content-start gap-2 rounded-lg border border-border bg-surface p-5 no-underline transition-[transform,border-color,background-color] duration-(--o-duration-base) hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-hover"
                >
                  <item.Icon aria-hidden="true" className="size-5 text-accent" />
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-callout text-fg-2">{item.body}</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-[clamp(4rem,9vw,7.5rem)]" aria-labelledby="cta-title">
        <Reveal className="page-width relative isolate grid justify-items-center gap-5 overflow-hidden rounded-xl border border-border px-6 py-16 text-center">
          <div className="ambient top-0! h-full!" aria-hidden="true" />
          <h2 id="cta-title" className="max-w-[20ch] text-[clamp(1.6rem,3.6vw,var(--o-text-title1-size))] leading-tight font-bold tracking-tight">
            Help build a better home for every TV
          </h2>
          <p className="max-w-[48ch] text-fg-2">Star the repository, try a build on your own TV, or report how Oriel runs on your device.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href={site.repoUrl}>
                <GitBranch aria-hidden="true" className="size-4.5" />
                Open the repository
              </a>
            </Button>
            <Button asChild variant="glass">
              <a href={newIssueUrl("device_report.yml")}>Report your device</a>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
