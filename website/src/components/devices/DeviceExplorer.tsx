"use client";

import { Search } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { useId, useState } from "react";
import {
  CAPABILITY_LABELS,
  EVIDENCE_LABELS,
  type CompatibilityEntry,
  type Evidence,
  type Support,
} from "@/data/compatibility";
import { StatusPill, type Tone } from "../StatusPill";
import { Button } from "../ui/button";

const SUPPORT: Record<Support, { tone: Tone; label: string }> = {
  yes: { tone: "success", label: "Yes" },
  partial: { tone: "partial", label: "Partly" },
  no: { tone: "danger", label: "No" },
  unknown: { tone: "neutral", label: "Unknown" },
};

const EVIDENCE_TONE: Record<Evidence, Tone> = { verified: "success", community: "info", expected: "neutral" };

type EvidenceFilter = "all" | Evidence;
type FamilyFilter = "all" | CompatibilityEntry["family"];

const EVIDENCE_FILTERS: { value: EvidenceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "community", label: "Community" },
  { value: "expected", label: "Expected" },
];

const FAMILY_FILTERS: { value: FamilyFilter; label: string }[] = [
  { value: "all", label: "All platforms" },
  { value: "android", label: "Android-based" },
  { value: "other", label: "Other" },
];

const segmented = "inline-flex flex-wrap rounded-full bg-fg/7 p-0.75";
const segmentedItem =
  "min-h-9.5 cursor-pointer rounded-full px-3.5 text-callout font-semibold text-fg-2 transition-colors hover:text-fg data-[state=on]:bg-fg data-[state=on]:text-background";

function matches(entry: CompatibilityEntry, query: string): boolean {
  if (!query) return true;
  const haystack = [entry.name, entry.system, ...entry.limitations, ...Object.values(entry.capabilities).map((capability) => capability.note)]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

export function DeviceExplorer({ entries }: { entries: readonly CompatibilityEntry[] }) {
  const [query, setQuery] = useState("");
  const [evidence, setEvidence] = useState<EvidenceFilter>("all");
  const [family, setFamily] = useState<FamilyFilter>("all");
  const searchId = useId();

  const results = entries.filter(
    (entry) =>
      (evidence === "all" || entry.evidence === evidence) && (family === "all" || entry.family === family) && matches(entry, query.trim()),
  );

  return (
    <div className="grid gap-5">
      {/* Search and filters form one grouped glass toolbar (ADR 0004, rule 4). */}
      <div role="search" className="glass sticky top-[calc(var(--header-height)+0.5rem)] z-10 flex flex-wrap items-center gap-3 rounded-xl p-2">
        <label htmlFor={searchId} className="sr-only">
          Search devices and platforms
        </label>
        <div className="flex min-h-11 flex-[1_1_280px] items-center gap-2 rounded-[calc(var(--o-radius-xl)-0.5rem)] bg-fg/7 px-4 text-fg-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus">
          <Search aria-hidden="true" className="size-4.5 shrink-0" />
          <input
            id={searchId}
            type="search"
            placeholder="Search, for example “home screen” or “Fire TV”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-callout text-fg outline-none placeholder:text-fg-3"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ToggleGroup.Root
            type="single"
            aria-label="Filter by evidence"
            value={evidence}
            onValueChange={(value) => value && setEvidence(value as EvidenceFilter)}
            className={segmented}
          >
            {EVIDENCE_FILTERS.map((filter) => (
              <ToggleGroup.Item key={filter.value} value={filter.value} className={segmentedItem}>
                {filter.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
          <ToggleGroup.Root
            type="single"
            aria-label="Filter by platform"
            value={family}
            onValueChange={(value) => value && setFamily(value as FamilyFilter)}
            className={segmented}
          >
            {FAMILY_FILTERS.map((filter) => (
              <ToggleGroup.Item key={filter.value} value={filter.value} className={segmentedItem}>
                {filter.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </div>

      <p className="text-callout text-fg-2" role="status">
        Showing {results.length} of {entries.length}
      </p>

      {results.length === 0 ? (
        <div className="grid justify-items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <Search aria-hidden="true" className="size-7 text-fg-3" />
          <p className="max-w-130 text-fg-2">
            Nothing matches these filters.{" "}
            {evidence === "verified" || evidence === "community"
              ? "No device has been tested and reported yet."
              : "Try another search or clear the filters."}
          </p>
          <Button
            variant="quiet"
            onClick={() => {
              setQuery("");
              setEvidence("all");
              setFamily("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-5">
          {results.map((entry) => (
            <li key={entry.id} className="grid content-start gap-5 rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-title3">{entry.name}</h3>
                  <p className="mt-1 text-callout text-fg-2">{entry.system}</p>
                </div>
                <StatusPill tone={EVIDENCE_TONE[entry.evidence]}>{EVIDENCE_LABELS[entry.evidence].label}</StatusPill>
              </div>
              <dl className="grid gap-4">
                {(Object.keys(CAPABILITY_LABELS) as (keyof typeof CAPABILITY_LABELS)[]).map((key) => {
                  const capability = entry.capabilities[key];
                  return (
                    <div key={key}>
                      <dt className="mb-2 text-caption font-semibold tracking-wider text-fg-3 uppercase">{CAPABILITY_LABELS[key]}</dt>
                      <dd className="flex items-start gap-3 text-callout text-fg-2">
                        <StatusPill tone={SUPPORT[capability.support].tone}>{SUPPORT[capability.support].label}</StatusPill>
                        <span>{capability.note}</span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {entry.limitations.length > 0 && (
                <ul aria-label="Known limitations" className="grid list-disc gap-2 rounded-md bg-raised py-4 pr-4 pl-8 text-callout text-fg-2">
                  {entry.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              )}
              <p className="text-caption text-fg-3">
                {entry.checked ? `Checked ${entry.checked}` : "Not tested yet"}
                {entry.source && (
                  <>
                    {" · "}
                    <a className="font-semibold text-accent underline underline-offset-3" href={entry.source.href}>
                      {entry.source.label}
                    </a>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
