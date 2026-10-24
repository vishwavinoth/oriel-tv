"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup } from "radix-ui";
import { useSyncExternalStore } from "react";
import { Hint } from "./ui/hint";

const OPTIONS = [
  { value: "system", label: "Match system theme", Icon: SunMoon },
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
] as const;

const noop = () => () => {};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known in the browser, so the server render selects nothing.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  return (
    <ToggleGroup.Root
      type="single"
      value={mounted ? (theme ?? "system") : ""}
      onValueChange={(value) => value && setTheme(value)}
      aria-label="Color theme"
      className="inline-flex rounded-full bg-fg/7 p-0.75"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <Hint key={value} label={label}>
          <ToggleGroup.Item
            value={value}
            aria-label={label}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 transition-colors duration-(--o-duration-fast) hover:text-fg data-[state=on]:bg-fg data-[state=on]:text-background"
          >
            <Icon aria-hidden="true" className="size-4" />
          </ToggleGroup.Item>
        </Hint>
      ))}
    </ToggleGroup.Root>
  );
}
