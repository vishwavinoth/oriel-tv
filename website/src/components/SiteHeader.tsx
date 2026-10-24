"use client";

import { ChevronRight, ExternalLink, GitBranch, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, isCurrent } from "./NavLinks";
import { OrielMark } from "./OrielMark";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Hint } from "./ui/hint";

const iconButton =
  "grid size-11 cursor-pointer place-items-center rounded-full bg-fg/7 text-fg transition-colors duration-(--o-duration-fast) hover:bg-fg/14";

/**
 * The site header floats in the glass layer above the page (ADR 0004). Its controls are grouped in one
 * glass bar and use tinted fills, not glass of their own. The mobile menu replaces the bar while open,
 * so glass never stacks on glass.
 */
export function SiteHeader() {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so following a link closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50">
      <div
        className={cn(
          "glass pointer-events-auto mx-auto flex h-16 w-[min(100%-1.5rem,1180px)] items-center gap-4 rounded-full py-1.5 pr-1.5 pl-4",
          menuOpen && "invisible",
        )}
      >
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-full text-[1.0625rem] font-bold tracking-[-0.015em] no-underline">
          <OrielMark className="size-7.5 rounded-lg" />
          <span>Oriel</span>
          <span className="sr-only"> TV home</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="rounded-full px-3.5 py-2 text-callout font-medium text-fg-2 no-underline transition-colors duration-(--o-duration-fast) hover:bg-fg/8 hover:text-fg aria-[current=page]:bg-fg/11 aria-[current=page]:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <ThemeSwitcher />
          <Hint label="Source code on GitHub">
            <a href={site.repoUrl} aria-label="Source code on GitHub" className={cn(iconButton, "hidden md:grid")}>
              <GitBranch aria-hidden="true" className="size-4.5" />
            </a>
          </Hint>

          <Dialog.Root open={menuOpen} onOpenChange={(open) => setOpenOn(open ? pathname : null)}>
            <Dialog.Trigger asChild>
              <button type="button" aria-label="Open menu" className={cn(iconButton, "md:hidden")}>
                <Menu aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
              <Dialog.Content aria-describedby={undefined} className="glass fixed inset-x-3 top-3 z-50 rounded-[32px] p-2 focus:outline-none">
                <div className="flex items-center justify-between py-1 pr-0.5 pl-4">
                  <Dialog.Title className="flex items-center gap-2.5 font-bold">
                    <OrielMark className="size-7.5 rounded-lg" />
                    Oriel
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" aria-label="Close menu" className={iconButton}>
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <nav aria-label="Main" className="mt-2">
                  <ul className="grid gap-0.5">
                    {PRIMARY_NAV.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                          className="flex min-h-13 items-center justify-between rounded-3xl px-5 font-semibold no-underline hover:bg-fg/9 aria-[current=page]:bg-fg/9"
                        >
                          {item.label}
                          <ChevronRight aria-hidden="true" className="size-4.5 text-fg-3" />
                        </Link>
                      </li>
                    ))}
                    <li>
                      <a href={site.repoUrl} className="flex min-h-13 items-center justify-between rounded-3xl px-5 font-semibold no-underline hover:bg-fg/9">
                        Source code
                        <ExternalLink aria-hidden="true" className="size-4 text-fg-3" />
                      </a>
                    </li>
                  </ul>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
