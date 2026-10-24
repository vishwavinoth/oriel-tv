import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/MarkdownPage";

export const metadata: Metadata = {
  title: "Device management",
  description: "ADB basics for Android TV and Google TV, the advanced home-screen option, its risks, and how to undo it.",
  alternates: { canonical: "/docs/device-management/" },
};

export default function DeviceManagementPage() {
  return <MarkdownArticle file="docs/guides/device-management.md" />;
}
