import { Check, ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { newIssueUrl, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Download the Oriel TV public preview, check it against its checksums, or build it yourself.",
  alternates: { canonical: "/downloads/" },
};

const RELEASE_CONTENTS = [
  "The launcher APK, for Android TV and Google TV on Android 5.0 or newer",
  "Control Center for Windows and Linux, and as a jar for Apple silicon Macs",
  "SHA-256 checksums and build provenance for every file",
  "The changelog, supported platforms, and known limitations",
  "Only test results that actually happened",
];

const BUILD_STEPS = `git clone ${site.repoUrl}.git
cd oriel-tv
./gradlew :launcher:assembleDebug`;

export default function DownloadsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Releases"
        description="Oriel is in public preview. Nobody has tested it on a physical TV yet, so expect rough edges, and tell us what you find."
      >
        <Button asChild>
          <a href={`${site.releasesUrl}/latest`}>Download from GitHub</a>
        </Button>
        <Button asChild variant="quiet">
          <a href={site.releasesUrl}>All releases</a>
        </Button>
      </PageHeader>

      <div className="page-width-narrow grid gap-8 pb-20">
        <section aria-labelledby="test-title" className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <ClipboardCheck aria-hidden="true" className="size-8 text-fg-3" />
          <h2 id="test-title" className="text-title3">
            Help test Oriel
          </h2>
          <p className="max-w-[52ch] text-fg-2">
            Try the preview on a TV you own, then report what worked and what didn’t. Reports appear on the{" "}
            <Link href="/community/#device-reports" className="font-semibold text-accent underline underline-offset-3">
              Community page
            </Link>{" "}
            and decide what gets fixed first.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href={newIssueUrl("device_report.yml")}>Report your TV</a>
            </Button>
            <Button asChild variant="quiet">
              <a href={newIssueUrl("bug_report.yml")}>Report a bug</a>
            </Button>
          </div>
        </section>

        <section aria-labelledby="build-title" className="grid gap-4">
          <h2 id="build-title" className="text-title3">
            Build it yourself
          </h2>
          <p className="text-fg-2">You need JDK 17 or newer and the Android SDK. The debug APK is written to launcher/build/outputs/apk/debug/.</p>
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-5 font-mono text-callout leading-relaxed">
            <code>{BUILD_STEPS}</code>
          </pre>
          <p className="text-fg-2">
            The{" "}
            <Link href="/docs/getting-started/" className="font-semibold text-accent underline underline-offset-3">
              getting started guide
            </Link>{" "}
            explains how to install it on your TV.
          </p>
        </section>

        <section aria-labelledby="contents-title" className="grid gap-4 rounded-lg border border-border bg-surface p-6">
          <h2 id="contents-title" className="text-title3">
            What every release includes
          </h2>
          <ul className="grid gap-2">
            {RELEASE_CONTENTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-fg-2">
                <Check aria-hidden="true" strokeWidth={2.4} className="mt-1 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
