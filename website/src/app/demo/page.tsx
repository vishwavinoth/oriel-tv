import type { Metadata } from "next";
import Link from "next/link";
import { ControlCenterDemo } from "@/components/demo/ControlCenterDemo";
import { LauncherDemo } from "@/components/demo/LauncherDemo";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Live demo",
  description:
    "Try Oriel in your browser: turn on the TV, move around with a remote, open the control panel, and see how Control Center changes a TV safely.",
  alternates: { canonical: "/demo/" },
};

export default function DemoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Live demo"
        title="Try Oriel in your browser"
        description="Turn on the TV, move around with your keyboard or the on-screen remote, open the control panel, and make it yours. Then see how Control Center changes a TV, one reviewed step at a time."
      >
        <Button asChild>
          <Link href="/docs/getting-started/">Install it on your TV</Link>
        </Button>
        <Button asChild variant="quiet">
          <Link href="/devices/">Check compatibility</Link>
        </Button>
      </PageHeader>

      <section className="page-width pb-16" aria-labelledby="tv-demo-title">
        <h2 id="tv-demo-title" className="sr-only">
          The Oriel launcher
        </h2>
        <LauncherDemo full />
      </section>

      <section className="page-width pb-16" aria-labelledby="cc-demo-title">
        <div className="mb-6 grid max-w-[62ch] gap-2">
          <p className="eyebrow">Control Center</p>
          <h2 id="cc-demo-title" className="text-title2">
            See every change before it happens
          </h2>
          <p className="text-body text-fg-2">
            Control Center runs on your computer and changes a TV only after you’ve read the plan and its exact commands. Connect the
            simulated TV, install Oriel, and make it the home screen.
          </p>
        </div>
        <ControlCenterDemo />
      </section>

      <section className="page-width-narrow pb-20">
        <p className="rounded-lg border border-border bg-surface p-5 text-callout text-fg-2">
          Both demos are web recreations built from the same design tokens, focus rules, and operation plans as the real apps. They don’t run
          the Android launcher or the desktop app, and they never connect to a TV. The TV settings screens stand in for your TV’s own, which
          differ between models.
        </p>
      </section>
    </>
  );
}
