"use client";

import { Tooltip } from "radix-ui";
import type { ReactNode } from "react";

/** A short label shown on hover or keyboard focus. Tooltips are popovers, so they use regular glass. */
export function Hint({ label, children, side = "bottom" }: { label: string; children: ReactNode; side?: "top" | "bottom" }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={8} className="glass z-60 rounded-md px-3 py-1.5 text-caption font-semibold text-fg">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
