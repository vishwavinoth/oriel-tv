// Fictional apps for the website's launcher demo. They're illustrations, not real products or brands.

export type GlyphName =
  | "play"
  | "stack"
  | "broadcast"
  | "note"
  | "photo"
  | "mic"
  | "gamepad"
  | "news"
  | "weather"
  | "star"
  | "pulse"
  | "globe";

export interface DemoApp {
  id: string;
  name: string;
  category: string;
  blurb: string;
  glyph: GlyphName;
  /** Gradient start and end for the app's tile. */
  colors: readonly [string, string];
}

export const DEMO_APPS: readonly DemoApp[] = [
  {
    id: "cinema",
    name: "Cinema",
    category: "Films",
    blurb: "Films from your own library and the services you choose.",
    glyph: "play",
    colors: ["#FF7A59", "#B23CFF"],
  },
  {
    id: "series",
    name: "Series",
    category: "TV shows",
    blurb: "Pick up where you left off, without the next episode starting on its own.",
    glyph: "stack",
    colors: ["#4F7BFF", "#22D3EE"],
  },
  {
    id: "live",
    name: "Live TV",
    category: "Channels",
    blurb: "Broadcast and streaming channels in one guide.",
    glyph: "broadcast",
    colors: ["#FF4D6D", "#FF9F43"],
  },
  {
    id: "music",
    name: "Music",
    category: "Audio",
    blurb: "Albums, playlists, and radio on the big speakers.",
    glyph: "note",
    colors: ["#A855F7", "#EC4899"],
  },
  {
    id: "photos",
    name: "Photos",
    category: "Memories",
    blurb: "Your albums as a slideshow on the big screen.",
    glyph: "photo",
    colors: ["#10B981", "#3B82F6"],
  },
  {
    id: "podcasts",
    name: "Podcasts",
    category: "Audio",
    blurb: "Shows and episodes, with chapters and playback speed.",
    glyph: "mic",
    colors: ["#8B5CF6", "#6366F1"],
  },
  {
    id: "games",
    name: "Games",
    category: "Play",
    blurb: "Controller-friendly games installed on this TV.",
    glyph: "gamepad",
    colors: ["#F43F5E", "#8B5CF6"],
  },
  {
    id: "news",
    name: "News",
    category: "Updates",
    blurb: "Headlines from the sources you pick.",
    glyph: "news",
    colors: ["#64748B", "#0EA5E9"],
  },
  {
    id: "weather",
    name: "Weather",
    category: "Forecast",
    blurb: "Today and the week ahead.",
    glyph: "weather",
    colors: ["#38BDF8", "#6366F1"],
  },
  {
    id: "kids",
    name: "Kids",
    category: "Family",
    blurb: "A calmer space with only the apps you allow.",
    glyph: "star",
    colors: ["#FBBF24", "#F97316"],
  },
  {
    id: "fitness",
    name: "Fitness",
    category: "Health",
    blurb: "Workouts you can follow with just a remote.",
    glyph: "pulse",
    colors: ["#22C55E", "#14B8A6"],
  },
  {
    id: "browser",
    name: "Browser",
    category: "Web",
    blurb: "The web, sized for the couch.",
    glyph: "globe",
    colors: ["#0EA5E9", "#2563EB"],
  },
];

export const DEFAULT_FAVORITES: readonly string[] = ["cinema", "series", "music", "live", "photos"];

export const GRID_COLUMNS = 6;

export function findApp(id: string): DemoApp | undefined {
  return DEMO_APPS.find((app) => app.id === id);
}
