import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Getting started",
  description: "Build Oriel TV, install it on an Android TV or Google TV device, and make it your home screen.",
  alternates: { canonical: "/docs/getting-started/" },
};

export default function GettingStartedPage() {
  return <MarkdownArticle file="docs/guides/getting-started.md" />;
}
