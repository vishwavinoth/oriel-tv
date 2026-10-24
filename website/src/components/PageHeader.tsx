import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden pt-[calc(var(--header-height)+clamp(3rem,8vw,6.5rem))] pb-10">
      <div className="ambient" aria-hidden="true" />
      <div className="page-width-narrow rise grid gap-4">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-[clamp(2.1rem,4.6vw,var(--o-text-title1-size))] leading-(--o-text-title1-line) font-bold tracking-(--o-text-title1-tracking)">
          {title}
        </h1>
        {description && <p className="text-[clamp(1.0625rem,1.6vw,var(--o-text-body-large-size))] leading-(--o-text-body-large-line) text-fg-2">{description}</p>}
        {children && <div className="mt-2 flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  );
}
