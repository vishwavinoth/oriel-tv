import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import { DeviceExplorer } from "@/components/devices/DeviceExplorer";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill, type Tone } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { newIssueUrl } from "@/config/site";
import { COMPATIBILITY, DEVICE_REPORTS, EVIDENCE_LABELS, LAST_REVIEWED, type Evidence } from "@/data/compatibility";

export const metadata: Metadata = {
  title: "Devices",
  description: "Which TVs and platforms Oriel can run on, with verified results kept separate from expectations.",
  alternates: { canonical: "/devices/" },
};

const TONES: Record<Evidence, Tone> = { verified: "success", community: "info", expected: "neutral" };

export default function DevicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Compatibility"
        title="Devices and platforms"
        description="Verified results, community reports, and expectations are labeled separately. Nothing here is marked as tested unless someone actually tested it."
      />

      <div className="page-width grid gap-12 pb-20">
        <section aria-labelledby="legend-title" className="grid gap-4">
          <h2 id="legend-title" className="sr-only">
            What the labels mean
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {(Object.keys(EVIDENCE_LABELS) as Evidence[]).map((evidence) => (
              <li key={evidence} className="grid content-start gap-2 rounded-md border border-border bg-surface p-5">
                <StatusPill tone={TONES[evidence]} className="justify-self-start">
                  {EVIDENCE_LABELS[evidence].label}
                </StatusPill>
                <p className="text-callout text-fg-2">{EVIDENCE_LABELS[evidence].description}</p>
              </li>
            ))}
          </ul>
          <p className="text-caption text-fg-3">Platform expectations last reviewed {LAST_REVIEWED}.</p>
        </section>

        <section aria-labelledby="explorer-title" className="grid gap-5">
          <h2 id="explorer-title" className="text-title3">
            Explore compatibility
          </h2>
          <DeviceExplorer entries={[...DEVICE_REPORTS, ...COMPATIBILITY]} />
        </section>

        <section aria-labelledby="reports-title" className="grid justify-items-center gap-4 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <ClipboardCheck aria-hidden="true" className="size-8 text-fg-3" />
          <h2 id="reports-title" className="text-title3">
            {DEVICE_REPORTS.length === 0 ? "No device has been verified yet" : `${DEVICE_REPORTS.length} device reports`}
          </h2>
          <p className="max-w-[56ch] text-fg-2">
            Oriel is in early development. If you try a build on your own TV, a report helps everyone, including when something doesn’t work.
          </p>
          <Button asChild>
            <a href={newIssueUrl("device_report.yml")}>Report your device</a>
          </Button>
        </section>
      </div>
    </>
  );
}
