import { loadRepoDoc } from "@/lib/content";
import { repoFileUrl } from "@/config/site";
import { Markdown } from "./Markdown";
import { PageHeader } from "./PageHeader";

interface MarkdownPageProps {
  file: string;
  eyebrow: string;
  description?: string;
}

/** A standalone page that renders a repository document, such as SECURITY.md. */
export function MarkdownPage({ file, eyebrow, description }: MarkdownPageProps) {
  const doc = loadRepoDoc(file);
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={doc.title} description={description} />
      <div className="page-width-narrow pb-20">
        <Markdown blocks={doc.blocks} resolveLink={doc.resolveLink} />
        <SourceNote file={file} />
      </div>
    </>
  );
}

/** A guide inside the docs layout, which supplies the page chrome. */
export function MarkdownArticle({ file }: { file: string }) {
  const doc = loadRepoDoc(file);
  return (
    <article>
      <div className="prose">
        <h1>{doc.title}</h1>
      </div>
      <Markdown blocks={doc.blocks} resolveLink={doc.resolveLink} />
      <SourceNote file={file} />
    </article>
  );
}

function SourceNote({ file }: { file: string }) {
  return (
    <p className="mt-12 text-callout text-fg-2">
      This page is generated from{" "}
      <a className="font-semibold text-accent underline underline-offset-3" href={repoFileUrl(file)}>
        {file}
      </a>{" "}
      in the repository. Suggest changes there.
    </p>
  );
}
