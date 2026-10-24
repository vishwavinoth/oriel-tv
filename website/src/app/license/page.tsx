import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { repoFileUrl } from "@/config/site";
import { loadRepoDoc, readRepoFile } from "@/lib/content";

export const metadata: Metadata = {
  title: "License",
  description: "Oriel TV is original work licensed under the Apache License 2.0. The name and logo are covered separately.",
  alternates: { canonical: "/license/" },
};

export default function LicensePage() {
  const notice = readRepoFile("NOTICE").trim();
  const license = readRepoFile("LICENSE");
  const trademarks = loadRepoDoc("TRADEMARKS.md");

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title="License"
        description="Oriel TV is original work, released under the Apache License 2.0. You can use, change, and share the code, including commercially, as long as you keep the license and notices."
      />
      <div className="page-width-narrow grid gap-10 pb-20">
        <section aria-labelledby="notice-title" className="grid gap-3">
          <h2 id="notice-title" className="text-title3">
            Notice
          </h2>
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-5 font-mono text-callout leading-relaxed whitespace-pre-wrap">
            {notice}
          </pre>
        </section>

        <section aria-labelledby="trademarks" className="grid gap-3">
          <h2 id="trademarks" className="text-title2">
            {trademarks.title}
          </h2>
          <Markdown blocks={trademarks.blocks} resolveLink={trademarks.resolveLink} />
        </section>

        <section aria-labelledby="license-title" className="grid gap-3">
          <h2 id="license-title" className="text-title3">
            Full license text
          </h2>
          <details className="rounded-md border border-border bg-surface">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Apache License, Version 2.0</summary>
            <pre className="max-h-[70vh] overflow-auto border-t border-border p-5 font-mono text-caption leading-relaxed whitespace-pre-wrap text-fg-2">
              {license}
            </pre>
          </details>
          <p className="text-callout text-fg-2">
            Also available as{" "}
            <a className="font-semibold text-accent underline underline-offset-3" href={repoFileUrl("LICENSE")}>
              LICENSE
            </a>{" "}
            in the repository.
          </p>
        </section>
      </div>
    </>
  );
}
