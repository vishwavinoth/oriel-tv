import { Check, ClipboardCheck, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { newIssueUrl, repoFileUrl } from "@/config/site";
import { loadDeviceReports, WORKED, type WorkedKey } from "@/lib/deviceReports";
import { accents, themePacks, wallpapers } from "@/lib/tokens.generated";

export const metadata: Metadata = {
  title: "Community",
  description: "Theme packs and device reports from the people who use Oriel, built from files anyone can add to the repository.",
  alternates: { canonical: "/community/" },
};

const textLink = "font-semibold text-accent underline-offset-3 hover:underline";

const labelOf = (list: readonly { id: string; label: string }[], id: string) => list.find((item) => item.id === id)?.label ?? id;

export default function CommunityPage() {
  const reports = loadDeviceReports();

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Made and tested by the people who use Oriel"
        description="Theme packs and device reports, built from files in the repository. Anyone can add one with a pull request, and every one is checked before it appears here."
      >
        <Button asChild>
          <a href={newIssueUrl("device_report.yml")}>Report your TV</a>
        </Button>
        <Button asChild variant="quiet">
          <Link href="/contributing/">How to contribute</Link>
        </Button>
      </PageHeader>

      <div className="page-width grid gap-16 pb-20">
        <section id="theme-packs" aria-labelledby="packs-title" className="grid scroll-mt-28 gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="grid gap-1">
              <h2 id="packs-title" className="text-title2">
                Theme packs
              </h2>
              <p className="text-fg-2">A theme, an accent, and a wallpaper, applied together from the top of Settings.</p>
            </div>
            <p className="text-callout text-fg-2">{themePacks.length} packs</p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {themePacks.map((pack) => {
              const accent = accents.find((candidate) => candidate.id === pack.accent);
              const author = "author" in pack && typeof pack.author === "string" ? pack.author : undefined;
              return (
                <li key={pack.id} className="grid content-start overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="relative aspect-video" style={{ background: `var(--o-wallpaper-${pack.wallpaper})` }} aria-hidden="true">
                    <span className="absolute bottom-3 left-3 rounded-full bg-[rgba(0,0,0,0.55)] px-2.5 py-1 text-caption font-semibold text-[#ffffff]">
                      {pack.theme === "dark" ? "Dark" : "Light"}
                    </span>
                    <span
                      className="absolute right-3 bottom-3 size-5 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.75)]"
                      style={{ background: accent?.[pack.theme] }}
                    />
                  </div>
                  <div className="grid gap-2 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[1.125rem] font-semibold">{pack.label}</h3>
                      <p className="text-caption text-fg-2">
                        {author ? (
                          <a href={`https://github.com/${author}`} className={textLink}>
                            @{author}
                          </a>
                        ) : (
                          "Built in"
                        )}
                      </p>
                    </div>
                    <p className="text-callout text-fg-2">{pack.description}</p>
                    <p className="text-caption text-fg-3">
                      {labelOf(accents, pack.accent)} accent · {labelOf(wallpapers, pack.wallpaper)} wallpaper
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="text-callout text-fg-2">
            Try them in the{" "}
            <Link href="/demo/" className={textLink}>
              live demo
            </Link>
            , or{" "}
            <a href={repoFileUrl("CONTRIBUTING.md#submit-a-theme-pack")} className={textLink}>
              propose your own
            </a>
            . Every pack is checked for legible contrast before it&apos;s merged.
          </p>
        </section>

        <section id="device-reports" aria-labelledby="reports-title" className="grid scroll-mt-28 gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="grid gap-1">
              <h2 id="reports-title" className="text-title2">
                Device reports
              </h2>
              <p className="text-fg-2">How Oriel worked on real TVs, written by the people who tested them.</p>
            </div>
            <p className="text-callout text-fg-2">{reports.length === 1 ? "1 report" : `${reports.length} reports`}</p>
          </div>

          {reports.length === 0 ? (
            <div className="grid justify-items-center gap-4 rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <ClipboardCheck aria-hidden="true" className="size-8 text-fg-3" />
              <h3 className="text-title3">No device reports yet</h3>
              <p className="max-w-[58ch] text-fg-2">
                Nobody has reported testing Oriel on a TV yet. The first report helps everyone, including one where something doesn&apos;t
                work.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <a href={newIssueUrl("device_report.yml")}>Report your TV</a>
                </Button>
                <Button asChild variant="quiet">
                  <a href={repoFileUrl("community/device-reports/README.md")}>Add a report file</a>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid gap-5 lg:grid-cols-2">
              {reports.map((report) => (
                <li key={report.file} className="grid content-start gap-4 rounded-lg border border-border bg-surface p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-0.5">
                      <h3 className="text-[1.125rem] font-semibold">
                        {report.manufacturer} {report.device}
                      </h3>
                      <p className="text-callout text-fg-2">
                        {report.platform} · Android {report.androidVersion} · Oriel {report.orielVersion}
                      </p>
                    </div>
                    <StatusPill tone={report.verifiedByProject ? "success" : "info"}>
                      {report.verifiedByProject ? "Verified" : "Community report"}
                    </StatusPill>
                  </div>
                  <ul className="grid gap-1.5 text-callout sm:grid-cols-2">
                    {(Object.keys(WORKED) as WorkedKey[]).map((key) => {
                      const worked = report.worked.includes(key);
                      return (
                        <li key={key} className={worked ? "flex items-start gap-2" : "flex items-start gap-2 text-fg-3"}>
                          {worked ? (
                            <Check aria-hidden="true" strokeWidth={2.4} className="mt-0.5 size-4 shrink-0 text-success" />
                          ) : (
                            <Minus aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                          )}
                          <span>
                            {WORKED[key]}
                            <span className="sr-only">{worked ? ": worked" : ": not reported"}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {report.problems && (
                    <p className="text-callout text-fg-2">
                      <span className="font-semibold text-fg">Problems: </span>
                      {report.problems}
                    </p>
                  )}
                  <p className="text-caption text-fg-3">
                    Tested by{" "}
                    <a href={`https://github.com/${report.testedBy}`} className={textLink}>
                      @{report.testedBy}
                    </a>{" "}
                    on {report.testedOn} ·{" "}
                    <a href={repoFileUrl(`community/device-reports/${report.file}`)} className={textLink}>
                      View the report
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}

          <p className="text-callout text-fg-2">
            Reports also appear on the{" "}
            <Link href="/devices/" className={textLink}>
              Devices page
            </Link>
            . Nothing is marked as verified unless the project tested it on its own hardware.
          </p>
        </section>
      </div>
    </>
  );
}
