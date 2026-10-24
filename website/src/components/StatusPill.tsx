import { cva } from "class-variance-authority";
import { Check, Info, Minus, Sparkles, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "success" | "partial" | "danger" | "neutral" | "info";

const ICONS: Record<Tone, LucideIcon> = { success: Check, partial: Minus, danger: X, neutral: Info, info: Sparkles };

const iconVariants = cva("size-3.5 shrink-0", {
  variants: {
    tone: {
      success: "text-success",
      partial: "text-warning",
      danger: "text-danger",
      neutral: "text-fg-3",
      info: "text-info",
    },
  },
});

/** A status label that pairs an icon with text, so meaning never depends on color alone. */
export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  const IconComponent = ICONS[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-raised py-1 pr-2.5 pl-2 text-caption leading-tight font-semibold whitespace-nowrap text-fg-2",
        className,
      )}
    >
      <IconComponent aria-hidden="true" strokeWidth={2.6} className={iconVariants({ tone })} />
      {children}
    </span>
  );
}
