import type { Metadata } from "next";
import { MarkdownPage } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Oriel TV and this website actually collect: nothing about you.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return <MarkdownPage file="PRIVACY.md" eyebrow="Project" />;
}
