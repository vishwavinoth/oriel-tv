import { Check, PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Oriel TV releases, checksums, and how to build the launcher yourself until the first release.",
  alternates: { canonical: "/downloads/" },
};

const RELEASE_CONTENTS = [
  "A version number and changelog",
  "The supported platforms and known limitations",
  "Installation instructions",
  "The APK, with a SHA-256 checksum to verify it",
  "Signing and provenance details, once release signing is set up",
  "Only test results that actually happened",
];

const BUILD_STEPS = `git clone ${site.repoUrl}.git
cd oriel-tv
./gradlew :launcher:assembleDebug`;

export default function DownloadsPage() {
  return (
    <>
      <PageHeader eyebrow="Downloads" title="Releases" description="Oriel is in early development and hasn’t published a release yet.">
        <Button asChild variant="quiet">
          <a href={site.releasesUrl}>Releases on GitHub</a>
        </Button>
      </PageHeader>

      <div className="page-width-narrow grid gap-8 pb-20">
        <section aria-labelledby="none-title" className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <PackageOpen aria-hidden="true" className="size-8 text-fg-3" />
          <h2 id="none-title" className="text-title3">
            No release yet
          </h2>
          <p className="max-w-[52ch] text-fg-2">
            The first release will appear here and on GitHub once it’s built, tested, and documented. Until then, you can build the
            development version yourself.
          </p>
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
            What every release will include
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
