import type { Metadata } from "next";
import { MarkdownPage } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every notable change to Oriel TV, newest first.",
  alternates: { canonical: "/changelog/" },
};

export default function ChangelogPage() {
  return <MarkdownPage file="CHANGELOG.md" eyebrow="Project" />;
}
