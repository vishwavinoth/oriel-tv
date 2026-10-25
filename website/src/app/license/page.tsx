import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { repoFileUrl } from "@/config/site";
import { loadRepoDoc, readRepoFile } from "@/lib/content";
import { siteLibraries } from "@/lib/licenses";

export const metadata: Metadata = {
  title: "License",
  description: "Oriel TV is original work licensed under the Apache License 2.0. The name and logo are covered separately.",
  alternates: { canonical: "/license/" },
};

export default function LicensePage() {
  const notice = readRepoFile("NOTICE").trim();
  const license = readRepoFile("LICENSE");
  const trademarks = loadRepoDoc("TRADEMARKS.md");
  const libraries = siteLibraries(
    JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")),
    JSON.parse(readFileSync(path.join(process.cwd(), "package-lock.json"), "utf8")),
  );

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

        <section aria-labelledby="libraries-title" className="grid gap-3">
          <h2 id="libraries-title" className="text-title3">
            Open-source libraries
          </h2>
          <p className="text-callout text-fg-2">
            Every dependency is checked against the licenses the project allows: Apache 2.0 and permissive licenses such as MIT, BSD, and
            ISC. The launcher and Control Center list their libraries in their own Open-source licenses screens. This website’s browser code
            comes from these libraries:
          </p>
          <ul className="grid gap-1.5 rounded-md border border-border bg-surface p-5 text-callout sm:grid-cols-2">
            {libraries.map((library) => (
              <li key={library.name}>
                <span className="font-semibold">{library.name}</span> <span className="text-fg-2">{library.version}</span>
                <span className="text-fg-2"> · {library.license}</span>
              </li>
            ))}
          </ul>
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
