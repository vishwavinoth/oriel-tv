import { DocsNav } from "@/components/NavLinks";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="page-width grid gap-[clamp(2rem,5vw,4rem)] pt-[calc(var(--header-height)+3rem)] pb-20 md:grid-cols-[220px_minmax(0,1fr)]">
      <DocsNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
