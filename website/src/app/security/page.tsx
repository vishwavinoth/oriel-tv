import type { Metadata } from "next";
import { MarkdownPage } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Security",
  description: "How to report a vulnerability in Oriel TV, and the safety commitments the code must keep.",
  alternates: { canonical: "/security/" },
};

export default function SecurityPage() {
  return <MarkdownPage file="SECURITY.md" eyebrow="Project" />;
}
