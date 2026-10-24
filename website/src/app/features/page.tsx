import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/data/features";

export const metadata: Metadata = {
  title: "Features",
  description: "What Oriel TV does today, and what it will never do.",
  alternates: { canonical: "/features/" },
};

const NEVER = [
  "Promise to remove ads inside streaming apps. Those belong to the apps.",
  "Uninstall or disable apps without asking and explaining first.",
  "Require root access or firmware changes.",
  "Run commands written by an AI model.",
  "Claim a device is tested when nobody has tested it.",
];

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="Everything Oriel does, and how honestly"
        description="Every feature below is in the current development build. Oriel hasn’t had its first release yet, and no TV has been verified."
      >
        <Button asChild>
          <Link href="/docs/getting-started/">Get started</Link>
        </Button>
        <Button asChild variant="quiet">
          <Link href="/devices/">Check compatibility</Link>
        </Button>
      </PageHeader>

      <div className="page-width-narrow grid gap-5 pb-16">
        {FEATURES.map((feature) => (
          <Reveal key={feature.id}>
            <article id={feature.id} className="grid gap-4 rounded-lg border border-border bg-surface p-6 sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-8">
              <span className="grid size-12 place-items-center rounded-sm bg-accent/15 text-accent">
                <feature.icon aria-hidden="true" className="size-6" />
              </span>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-title3">{feature.title}</h2>
                  <StatusPill tone={feature.status.tone}>{feature.status.label}</StatusPill>
                </div>
                <p className="text-body-lg text-fg-2">{feature.summary}</p>
                <ul className="grid gap-2">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-fg-2">
                      <Check aria-hidden="true" strokeWidth={2.4} className="mt-1 size-4 shrink-0 text-success" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <section className="page-width-narrow pb-20" aria-labelledby="never-title">
        <Reveal className="grid gap-4 rounded-lg border border-border bg-raised p-6 sm:p-8">
          <h2 id="never-title" className="text-title3">
            What Oriel will never do
          </h2>
          <ul className="grid gap-2">
            {NEVER.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-fg-2">
                <X aria-hidden="true" strokeWidth={2.4} className="mt-1 size-4 shrink-0 text-danger" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
