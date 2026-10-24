// Glyphs for the demo's fictional apps, drawn for Oriel on a 24-unit grid.

import type { GlyphName } from "@/lib/demo/apps";

const GLYPHS: Record<GlyphName, { d: string; fill?: boolean }> = {
  play: { d: "M9 6.8v10.4a.8.8 0 0 0 1.2.7l8.2-5.2a.8.8 0 0 0 0-1.4l-8.2-5.2a.8.8 0 0 0-1.2.7Z", fill: true },
  stack: { d: "M5 9h14v10H5zM7 6h10M9 3h6" },
  broadcast: { d: "M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" },
  note: { d: "M9 18V6l10-2v12M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM19 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" },
  photo: { d: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 16l5-5 4 4 3-3 6 6M16 8.5h.01" },
  mic: { d: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" },
  gamepad: { d: "M7 8h10a4 4 0 0 1 4 4v1.5a2.5 2.5 0 0 1-4.5 1.5L15 13H9l-1.5 2A2.5 2.5 0 0 1 3 13.5V12a4 4 0 0 1 4-4ZM8 10v3M6.5 11.5h3M15.5 11h.01M17.5 12.5h.01" },
  news: { d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM8 8h8M8 12h8M8 16h5" },
  weather: { d: "M9 5.5a3.5 3.5 0 1 0 0 7M8 19h9a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.5 1.5A3 3 0 0 0 8 19Z" },
  star: { d: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" },
  pulse: { d: "M3 12h4l2-5 4 10 2-5h6" },
  globe: { d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" },
};

export function AppGlyph({ name, className }: { name: GlyphName; className?: string }) {
  const glyph = GLYPHS[name];
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={glyph.fill ? "currentColor" : "none"}
      stroke={glyph.fill ? "none" : "currentColor"}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={glyph.d} />
    </svg>
  );
}
