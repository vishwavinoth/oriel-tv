import type { Metadata } from "next";
import { MarkdownPage } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Contributing",
  description: "How to set up Oriel TV for development, the project’s rules, and how to open a pull request.",
  alternates: { canonical: "/contributing/" },
};

export default function ContributingPage() {
  return <MarkdownPage file="CONTRIBUTING.md" eyebrow="Project" />;
}
