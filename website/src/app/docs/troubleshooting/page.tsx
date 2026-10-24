import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description: "Fixes for common Oriel TV problems: the Home button, missing apps, focus, and glass effects.",
  alternates: { canonical: "/docs/troubleshooting/" },
};

export default function TroubleshootingPage() {
  return <MarkdownArticle file="docs/guides/troubleshooting.md" />;
}
