import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="relative isolate grid min-h-[70vh] place-items-center overflow-hidden px-5 pt-[calc(var(--header-height)+4rem)] pb-20 text-center">
      <div className="ambient" aria-hidden="true" />
      <div className="rise grid justify-items-center gap-4">
        <p className="eyebrow">404</p>
        <h1 className="text-[clamp(2rem,5vw,var(--o-text-title1-size))] leading-tight font-bold tracking-tight">This page isn’t here</h1>
        <p className="max-w-[44ch] text-body-lg text-fg-2">It may have moved, or the link may be mistyped. The home page and the docs are good places to start.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="quiet">
            <Link href="/docs/">Read the docs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
