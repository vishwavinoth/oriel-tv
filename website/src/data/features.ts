// The product's main benefits (PRD section 5.1), with an honest status for each.

import { Code, EyeOff, LayoutGrid, Move, Palette, RotateCcw, ShieldCheck, Tv, type LucideIcon } from "lucide-react";
import type { Tone } from "@/components/StatusPill";

export interface Feature {
  id: string;
  title: string;
  summary: string;
  points: readonly string[];
  icon: LucideIcon;
  status: { tone: Tone; label: string };
}

const IN_BUILD = { tone: "success", label: "In the current build" } as const;

export const FEATURES: readonly Feature[] = [
  {
    id: "home",
    title: "A cleaner home screen",
    summary: "Only your apps, in your order. No sponsored rows, no autoplaying trailers, no upsells.",
    points: [
      "A favorites dock for the apps you open most, above a grid of everything else.",
      "Reorder favorites and hide apps you never use, without uninstalling anything.",
      "The focused appâ€™s name and category appear large enough to read from the couch.",
    ],
    icon: Tv,
    status: IN_BUILD,
  },
  {
    id: "personal",
    title: "Personal themes and wallpapers",
    summary: "Light or dark, five accent colors, and six original wallpapers called atmospheres.",
    points: [
      "Every combination is checked for legible contrast before it ships.",
      "Glass surfaces adapt to the wallpaper behind them.",
      "Reduce transparency and reduce motion are built-in settings.",
    ],
    icon: Palette,
    status: IN_BUILD,
  },
  {
    id: "remote",
    title: "Remote-first navigation",
    summary: "Everything works with a D-pad, OK, and Back. No mouse, no touchscreen, no surprises.",
    points: [
      "Focus moves predictably and stops at the edges instead of wrapping around.",
      "When you return from an app or close a panel, focus is right where you left it.",
      "The Menu button opens options for the focused app.",
    ],
    icon: Move,
    status: IN_BUILD,
  },
  {
    id: "safe",
    title: "Safe device customization",
    summary: "Control Center, a desktop companion, guides supported changes on your TV and explains each one first.",
    points: [
      "Every operation shows what it does, what could go wrong, and how to undo it.",
      "Nothing changes until you confirm, and only allowlisted operations can run.",
      "Changes that canâ€™t be reversed reliably are marked before you approve them.",
    ],
    icon: ShieldCheck,
    status: IN_BUILD,
  },
  {
    id: "privacy",
    title: "Privacy-first operation",
    summary: "The launcher has no network permission. It canâ€™t send anything anywhere.",
    points: [
      "No accounts, analytics, ads, or tracking.",
      "Your settings live on the TV and are deleted when you uninstall Oriel.",
      "Any future network feature will be off by default and explain itself first.",
    ],
    icon: EyeOff,
    status: IN_BUILD,
  },
  {
    id: "backup",
    title: "Backup and recovery",
    summary: "Control Center saves which apps are turned off and which app is home, checks the file, and previews any restore.",
    points: [
      "Backups are validated before anything is restored.",
      "You see a preview of what a restore will change.",
      "Oriel wonâ€™t claim to back up anything it canâ€™t actually restore.",
    ],
    icon: RotateCcw,
    status: IN_BUILD,
  },
  {
    id: "open",
    title: "Open-source development",
    summary: "Every line is public, licensed under Apache 2.0, and written for this project.",
    points: [
      "Read the code, build it yourself, and check what it does.",
      "Contribute code, designs, translations, or device reports.",
      "Decisions are recorded in the repository, with the reasons behind them.",
    ],
    icon: Code,
    status: { tone: "success", label: "Apache 2.0" },
  },
  {
    id: "honest",
    title: "Compatibility transparency",
    summary: "Clear labels for whatâ€™s verified on real hardware and whatâ€™s only expected to work.",
    points: [
      "Device reports say who tested what, on which software version, and when.",
      "Platform limits are stated plainly, including where Oriel canâ€™t help.",
      "Nothing is marked as tested unless someone actually tested it.",
    ],
    icon: LayoutGrid,
    status: { tone: "success", label: "On this site" },
  },
];
