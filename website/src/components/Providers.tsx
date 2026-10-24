"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Tooltip } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Site-wide client context: the light/dark preference (stored in this browser only, following the system
 * by default), Motion's reduced-motion handling, and the tooltip delay.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" storageKey="oriel-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <Tooltip.Provider delayDuration={300}>{children}</Tooltip.Provider>
      </MotionConfig>
    </ThemeProvider>
  );
}
