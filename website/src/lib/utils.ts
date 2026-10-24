import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge needs Oriel's font-size names, so it can tell `text-title1` (a size) from `text-fg` (a color).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "title1", "title2", "title3", "body-lg", "body", "callout", "caption"],
    },
  },
});

/** Joins class names and resolves conflicting Tailwind utilities, keeping the last one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
