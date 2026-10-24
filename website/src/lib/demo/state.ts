// State and remote-key handling for the website's launcher demo. Kept free of React so it can be tested
// directly; LauncherDemo.tsx renders whatever this produces.

import { DEFAULT_FAVORITES, DEMO_APPS, GRID_COLUMNS, findApp } from "./apps.ts";
import { moveFocus, normalizeFocus, type Direction, type Focus, type FocusRow } from "./focus.ts";
import {
  accents,
  defaultAccent,
  defaultWallpaper,
  wallpapers,
  type AccentId,
  type WallpaperId,
} from "../tokens.generated.ts";

export type RemoteKey = Direction | "ok" | "back" | "menu" | "home";

export interface DemoPreferences {
  theme: "dark" | "light";
  accent: AccentId;
  wallpaper: WallpaperId;
  reduceTransparency: boolean;
  reduceMotion: boolean;
  showClock: boolean;
}

export const DEFAULT_PREFERENCES: DemoPreferences = {
  theme: "dark",
  accent: defaultAccent,
  wallpaper: defaultWallpaper,
  reduceTransparency: false,
  reduceMotion: false,
  showClock: true,
};

// ---------- Settings panel ----------

export type SettingId = "theme" | "accent" | "wallpaper" | "reduceTransparency" | "reduceMotion" | "showClock" | "restore";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingsRow {
  id: SettingId;
  label: string;
  kind: "choice" | "toggle" | "action";
  options: readonly SettingOption[];
}

export const SETTINGS_ROWS: readonly SettingsRow[] = [
  {
    id: "theme",
    label: "Theme",
    kind: "choice",
    options: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
    ],
  },
  { id: "accent", label: "Accent", kind: "choice", options: accents.map(({ id, label }) => ({ value: id, label })) },
  {
    id: "wallpaper",
    label: "Wallpaper",
    kind: "choice",
    options: wallpapers.map(({ id, label }) => ({ value: id, label })),
  },
  { id: "reduceTransparency", label: "Reduce transparency", kind: "toggle", options: [{ value: "toggle", label: "Reduce transparency" }] },
  { id: "reduceMotion", label: "Reduce motion", kind: "toggle", options: [{ value: "toggle", label: "Reduce motion" }] },
  { id: "showClock", label: "Show clock", kind: "toggle", options: [{ value: "toggle", label: "Show clock" }] },
  { id: "restore", label: "Restore defaults", kind: "action", options: [{ value: "restore", label: "Restore defaults" }] },
];

const settingsFocusRows: FocusRow[] = SETTINGS_ROWS.map((row) => ({ id: row.id, size: row.options.length, remember: true }));

/** For choice rows, entering the row lands on the option that's currently selected. */
function settingsMemory(prefs: DemoPreferences): Record<string, number> {
  const memory: Record<string, number> = {};
  for (const row of SETTINGS_ROWS) {
    if (row.kind !== "choice") continue;
    const current = String(prefs[row.id as "theme" | "accent" | "wallpaper"]);
    memory[row.id] = Math.max(0, row.options.findIndex((option) => option.value === current));
  }
  return memory;
}

// ---------- Control panel, as in the launcher (launcher/.../ui/ControlPanel.kt) ----------

export type ControlTileId =
  | "oriel"
  | "network"
  | "bluetooth"
  | "notifications"
  | "display"
  | "sound"
  | "screensaver"
  | "date"
  | "accessibility"
  | "apps"
  | "storage"
  | "about";

export type SystemTileId = Exclude<ControlTileId, "oriel">;

export const CONTROL_TILES: readonly { id: ControlTileId; label: string }[] = [
  { id: "oriel", label: "Oriel settings" },
  { id: "network", label: "Wi-Fi and network" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "notifications", label: "Notifications" },
  { id: "display", label: "Display and picture" },
  { id: "sound", label: "Sound" },
  { id: "screensaver", label: "Screen saver" },
  { id: "date", label: "Date and time" },
  { id: "accessibility", label: "Accessibility" },
  { id: "apps", label: "Apps" },
  { id: "storage", label: "Storage" },
  { id: "about", label: "About this TV" },
];

export const CONTROL_COLUMNS = 2;

export type Connection = "wifi" | "offline";

/** Fictional notifications for the simulated notifications screen. */
export const SAMPLE_NOTIFICATIONS: readonly { id: string; label: string; value: string }[] = [
  { id: "update", label: "System update ready", value: "Installs tonight" },
  { id: "remote", label: "Remote battery low", value: "20% left" },
  { id: "album", label: "Photos", value: "A new album was shared" },
];

export interface SystemRow {
  id: string;
  label: string;
  value?: string;
  kind: "toggle" | "item" | "action";
  on?: boolean;
}

/**
 * What the TV's own settings screens show in the demo. They stand in for screens Oriel opens but doesn't draw,
 * so apart from Wi-Fi and notifications, choosing a row leaves everything as it is.
 */
export function systemRows(state: Pick<DemoState, "connection" | "notifications">, tile: SystemTileId): SystemRow[] {
  const wifi = state.connection === "wifi";
  switch (tile) {
    case "network":
      return [
        { id: "wifi", label: "Wi-Fi", kind: "toggle", on: wifi },
        { id: "home", label: "Home network", value: wifi ? "Connected" : "Wi-Fi is off", kind: "item" },
        { id: "guest", label: "Guest network", value: wifi ? "Saved" : "Wi-Fi is off", kind: "item" },
        { id: "ethernet", label: "Ethernet", value: "No cable connected", kind: "item" },
      ];
    case "bluetooth":
      return [
        { id: "remote", label: "Oriel remote", value: "Connected", kind: "item" },
        { id: "speaker", label: "Living room speaker", value: "Paired", kind: "item" },
        { id: "pair", label: "Pair a new device", kind: "action" },
      ];
    case "notifications": {
      const items = SAMPLE_NOTIFICATIONS.filter((item) => state.notifications.includes(item.id));
      if (items.length === 0) return [{ id: "empty", label: "No notifications", value: "You’re all caught up", kind: "item" }];
      return [...items.map((item) => ({ ...item, kind: "item" as const })), { id: "clear", label: "Clear all", kind: "action" }];
    }
    case "display":
      return [
        { id: "resolution", label: "Resolution", value: "Automatic, 4K", kind: "item" },
        { id: "picture", label: "Picture mode", value: "Standard", kind: "item" },
        { id: "hdr", label: "HDR", value: "Automatic", kind: "item" },
        { id: "frame-rate", label: "Match frame rate", value: "Seamless only", kind: "item" },
      ];
    case "sound":
      return [
        { id: "mode", label: "Sound mode", value: "Standard", kind: "item" },
        { id: "output", label: "Speakers", value: "TV speakers", kind: "item" },
        { id: "volume", label: "Volume", value: "40", kind: "item" },
      ];
    case "screensaver":
      return [
        { id: "saver", label: "Screen saver", value: "Ambient", kind: "item" },
        { id: "start", label: "Start after", value: "15 minutes", kind: "item" },
        { id: "sleep", label: "Turn off screen after", value: "4 hours", kind: "item" },
      ];
    case "date":
      return [
        { id: "auto", label: "Automatic date and time", value: "On", kind: "item" },
        { id: "zone", label: "Time zone", value: "Set by your network", kind: "item" },
        { id: "24h", label: "24-hour time", value: "Off", kind: "item" },
      ];
    case "accessibility":
      return [
        { id: "captions", label: "Captions", value: "Off", kind: "item" },
        { id: "contrast", label: "High-contrast text", value: "Off", kind: "item" },
        { id: "speech", label: "Text to speech", value: "Default engine", kind: "item" },
      ];
    case "apps":
      return [
        { id: "all", label: "See all apps", value: `${DEMO_APPS.length} apps`, kind: "item" },
        { id: "permissions", label: "App permissions", kind: "item" },
        { id: "special", label: "Special app access", kind: "item" },
      ];
    case "storage":
      return [
        { id: "internal", label: "Internal storage", value: "9.2 GB free of 16 GB", kind: "item" },
        { id: "cache", label: "Cached data", value: "380 MB", kind: "item" },
      ];
    case "about":
      return [
        { id: "model", label: "Model", value: "Demo TV", kind: "item" },
        { id: "os", label: "Android TV OS", value: "14", kind: "item" },
        { id: "oriel", label: "Oriel", value: "Development build", kind: "item" },
      ];
  }
}

export function controlTileLabel(id: ControlTileId): string {
  return CONTROL_TILES.find((tile) => tile.id === id)?.label ?? id;
}

/** Moves within a grid read left to right, top to bottom. Returns null at an edge. */
export function moveInGrid(index: number, count: number, columns: number, key: Direction): number | null {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const lastRow = Math.floor((count - 1) / columns);
  switch (key) {
    case "left":
      return column > 0 ? index - 1 : null;
    case "right":
      return column < columns - 1 && index + 1 < count ? index + 1 : null;
    case "up":
      return row > 0 ? index - columns : null;
    case "down":
      if (index + columns < count) return index + columns;
      return row < lastRow ? count - 1 : null;
  }
}

// ---------- Home screen ----------

export const TOP_ITEMS = ["controls", "settings"] as const;

export interface HomeRow extends FocusRow {
  label: string;
  items: readonly string[];
}

export function visibleApps(state: Pick<DemoState, "hidden">): string[] {
  return DEMO_APPS.filter((app) => !state.hidden.includes(app.id)).map((app) => app.id);
}

export function homeRows(state: Pick<DemoState, "favorites" | "hidden">): HomeRow[] {
  const dock = state.favorites.filter((id) => !state.hidden.includes(id));
  const apps = visibleApps(state);
  const rows: HomeRow[] = [
    { id: "top", label: "Quick actions", items: TOP_ITEMS, size: TOP_ITEMS.length, remember: true },
    { id: "dock", label: "Favorites", items: dock, size: dock.length, remember: true },
  ];
  for (let start = 0; start < apps.length; start += GRID_COLUMNS) {
    const items = apps.slice(start, start + GRID_COLUMNS);
    rows.push({ id: `grid-${start / GRID_COLUMNS}`, label: "All apps", items, size: items.length });
  }
  return rows;
}

export function focusedItem(state: DemoState): { row: HomeRow; id: string } | null {
  const rows = homeRows(state);
  const focus = normalizeFocus(rows, state.focus);
  const row = rows.find((candidate) => candidate.id === focus.rowId);
  if (!row || row.size === 0) return null;
  return { row, id: row.items[focus.index] };
}

// ---------- Tile options (the Menu button) ----------

export type OptionAction = "favorite" | "unfavorite" | "moveLeft" | "moveRight" | "hide";

export interface OptionItem {
  action: OptionAction;
  label: string;
}

export function optionItems(state: Pick<DemoState, "favorites">, appId: string, fromDock: boolean): OptionItem[] {
  const items: OptionItem[] = [];
  const position = state.favorites.indexOf(appId);
  if (position === -1) items.push({ action: "favorite", label: "Add to Favorites" });
  else items.push({ action: "unfavorite", label: "Remove from Favorites" });
  if (fromDock && position > 0) items.push({ action: "moveLeft", label: "Move left" });
  if (fromDock && position !== -1 && position < state.favorites.length - 1) items.push({ action: "moveRight", label: "Move right" });
  items.push({ action: "hide", label: "Hide app" });
  return items;
}

// ---------- Guided walkthrough ----------

export type Milestone = "move" | "open-app" | "menu" | "control-panel" | "tv-setting" | "personalize" | "home";

export const TOUR_STEPS: readonly { id: Milestone; title: string; hint: string }[] = [
  { id: "move", title: "Move around", hint: "Use the arrow keys or the remote’s D-pad. Focus stops at the edges." },
  { id: "open-app", title: "Open an app", hint: "Press OK on any tile, then Back to return to the same tile." },
  { id: "menu", title: "Arrange your apps", hint: "Press Menu (M) on an app to add a favorite, move it, or hide it." },
  { id: "control-panel", title: "Open the control panel", hint: "Go up to the top row and choose the control panel." },
  { id: "tv-setting", title: "Open a TV setting", hint: "Choose Wi-Fi or Notifications. Try turning Wi-Fi off." },
  { id: "personalize", title: "Make it yours", hint: "In Settings, change the theme, accent, or wallpaper." },
  { id: "home", title: "Press Home", hint: "Home (H) closes everything and returns to your first favorite." },
];

// ---------- State ----------

export type Power = "off" | "booting" | "on";

export type Overlay =
  | { kind: "none" }
  | { kind: "settings"; focus: Focus }
  | { kind: "options"; appId: string; fromDock: boolean; index: number }
  | { kind: "app"; appId: string }
  | { kind: "controlPanel"; index: number }
  | { kind: "system"; tile: SystemTileId; index: number };

export interface DemoState {
  power: Power;
  prefs: DemoPreferences;
  favorites: string[];
  hidden: string[];
  focus: Focus;
  memory: Record<string, number>;
  overlay: Overlay;
  connection: Connection;
  notifications: string[];
  milestones: Milestone[];
  /** Read out by a polite live region after every change. */
  announcement: string;
  toast: string | null;
  toastId: number;
  /** Set when a move hits an edge; the id changes each time so the UI can replay its cue. */
  bump: { direction: Direction; id: number } | null;
}

export type DemoAction =
  | { type: "press"; key: RemoteKey }
  | { type: "activate"; target: Focus }
  | { type: "activateSetting"; target: Focus }
  | { type: "activateOption"; index: number }
  | { type: "activateControl"; index: number }
  | { type: "activateSystemRow"; index: number }
  | { type: "booted" }
  | { type: "setPreference"; preference: Partial<DemoPreferences> }
  | { type: "dismissToast"; id: number };

export function initialDemoState(options: { poweredOff?: boolean } = {}): DemoState {
  return {
    power: options.poweredOff ? "off" : "on",
    prefs: { ...DEFAULT_PREFERENCES },
    favorites: [...DEFAULT_FAVORITES],
    hidden: [],
    focus: { rowId: "dock", index: 0 },
    memory: {},
    overlay: { kind: "none" },
    connection: "wifi",
    notifications: SAMPLE_NOTIFICATIONS.map((item) => item.id),
    milestones: [],
    announcement: "",
    toast: null,
    toastId: 0,
    bump: null,
  };
}

function describeFocus(state: DemoState): string {
  const focused = focusedItem(state);
  if (!focused) return "No apps to show.";
  if (focused.row.id === "top") return focused.id === "controls" ? "Control panel button" : "Settings button";
  const app = findApp(focused.id);
  const index = focused.row.items.indexOf(focused.id);
  return `${app?.name ?? focused.id}, ${index + 1} of ${focused.row.size}, ${focused.row.label}`;
}

function mark(state: DemoState, milestone: Milestone): DemoState {
  return state.milestones.includes(milestone) ? state : { ...state, milestones: [...state.milestones, milestone] };
}

function withToast(state: DemoState, message: string): DemoState {
  return { ...state, toast: message, toastId: state.toastId + 1, announcement: message };
}

function bumped(state: DemoState, direction: Direction): DemoState {
  return { ...state, bump: { direction, id: (state.bump?.id ?? 0) + 1 } };
}

function settle(state: DemoState): DemoState {
  return { ...state, focus: normalizeFocus(homeRows(state), state.focus) };
}

function goHome(state: DemoState): DemoState {
  const next = settle({ ...state, overlay: { kind: "none" }, focus: { rowId: "dock", index: 0 }, bump: null });
  return mark({ ...next, announcement: `Home. ${describeFocus(next)}` }, "home");
}

function openSettings(state: DemoState): DemoState {
  const memory = settingsMemory(state.prefs);
  return { ...state, overlay: { kind: "settings", focus: { rowId: "theme", index: memory.theme } }, announcement: "Settings opened. Theme." };
}

function selectHomeItem(state: DemoState): DemoState {
  const focused = focusedItem(state);
  if (!focused) return state;
  if (focused.id === "controls") {
    return mark({ ...state, overlay: { kind: "controlPanel", index: 0 }, announcement: "Control panel opened. Oriel settings." }, "control-panel");
  }
  if (focused.id === "settings") return openSettings(state);
  const app = findApp(focused.id);
  return mark({ ...state, overlay: { kind: "app", appId: focused.id }, announcement: `${app?.name ?? "App"} is open. Press Back to return to Oriel.` }, "open-app");
}

function applySetting(state: DemoState, target: Focus): DemoState {
  const row = SETTINGS_ROWS.find((candidate) => candidate.id === target.rowId);
  if (!row) return state;
  const option = row.options[target.index];
  if (!option) return state;
  const overlay: Overlay = { kind: "settings", focus: target };

  if (row.kind === "action") {
    const reset = initialDemoState();
    return { ...state, prefs: reset.prefs, favorites: reset.favorites, hidden: reset.hidden, overlay, announcement: "Settings, favorites, and hidden apps restored to their defaults." };
  }
  if (row.kind === "toggle") {
    const key = row.id as "reduceTransparency" | "reduceMotion" | "showClock";
    const value = !state.prefs[key];
    return mark({ ...state, prefs: { ...state.prefs, [key]: value }, overlay, announcement: `${row.label} ${value ? "on" : "off"}.` }, "personalize");
  }
  const key = row.id as "theme" | "accent" | "wallpaper";
  return mark({ ...state, prefs: { ...state.prefs, [key]: option.value }, overlay, announcement: `${row.label}: ${option.label}.` }, "personalize");
}

function applyOption(state: DemoState, overlay: Extract<Overlay, { kind: "options" }>, index: number): DemoState {
  const item = optionItems(state, overlay.appId, overlay.fromDock)[index];
  if (!item) return state;
  const app = findApp(overlay.appId);
  const name = app?.name ?? "App";
  const favorites = [...state.favorites];
  const position = favorites.indexOf(overlay.appId);
  let next: DemoState = { ...state, overlay: { kind: "none" } };

  switch (item.action) {
    case "favorite":
      next = { ...next, favorites: [...favorites, overlay.appId] };
      return withToast(settle(next), `${name} added to Favorites.`);
    case "unfavorite":
      next = { ...next, favorites: favorites.filter((id) => id !== overlay.appId) };
      return withToast(settle(next), `${name} removed from Favorites.`);
    case "moveLeft":
    case "moveRight": {
      const offset = item.action === "moveLeft" ? -1 : 1;
      [favorites[position], favorites[position + offset]] = [favorites[position + offset], favorites[position]];
      const dock = favorites.filter((id) => !state.hidden.includes(id));
      next = { ...next, favorites, focus: { rowId: "dock", index: dock.indexOf(overlay.appId) } };
      return withToast(settle(next), `${name} moved ${item.action === "moveLeft" ? "left" : "right"}.`);
    }
    case "hide":
      next = { ...next, hidden: [...state.hidden, overlay.appId] };
      return withToast(settle(next), `${name} hidden. Restore defaults in Settings to bring it back.`);
  }
}

function activateControlTile(state: DemoState, index: number): DemoState {
  const tile = CONTROL_TILES[index];
  if (!tile) return state;
  if (tile.id === "oriel") return openSettings(state);
  return mark(
    { ...state, overlay: { kind: "system", tile: tile.id, index: 0 }, bump: null, announcement: `${tile.label}. This is the TV’s own settings screen.` },
    "tv-setting",
  );
}

function applySystemRow(state: DemoState, overlay: Extract<Overlay, { kind: "system" }>, index: number): DemoState {
  const row = systemRows(state, overlay.tile)[index];
  if (!row) return state;
  const at = { ...state, overlay: { ...overlay, index } };
  if (overlay.tile === "network" && row.id === "wifi") {
    const connection: Connection = state.connection === "wifi" ? "offline" : "wifi";
    return withToast(
      { ...at, connection },
      connection === "wifi" ? "Wi-Fi is on. Oriel’s top row shows the connection again." : "Wi-Fi is off. Oriel’s top row now shows Offline.",
    );
  }
  if (overlay.tile === "notifications" && row.id === "clear") {
    return withToast({ ...at, notifications: [], overlay: { ...overlay, index: 0 } }, "Notifications cleared.");
  }
  return withToast(at, `On a real TV, this opens ${row.label}. The demo leaves it as it is.`);
}

function pressOnHome(state: DemoState, key: RemoteKey): DemoState {
  switch (key) {
    case "up":
    case "down":
    case "left":
    case "right": {
      const rows = homeRows(state);
      const result = moveFocus(rows, state.focus, key, state.memory);
      if (!result.moved) return bumped(state, key);
      const memory = result.left ? { ...state.memory, [result.left.rowId]: result.left.index } : state.memory;
      const next = { ...state, focus: result.focus, memory, bump: null };
      return mark({ ...next, announcement: describeFocus(next) }, "move");
    }
    case "ok":
      return selectHomeItem(state);
    case "menu": {
      const focused = focusedItem(state);
      if (!focused || focused.row.id === "top") return withToast(state, "Press Menu on an app for its options.");
      const app = findApp(focused.id);
      return mark(
        { ...state, overlay: { kind: "options", appId: focused.id, fromDock: focused.row.id === "dock", index: 0 }, announcement: `Options for ${app?.name ?? "app"}.` },
        "menu",
      );
    }
    case "back":
      return withToast(state, "You're already on the home screen.");
    case "home":
      return goHome(state);
  }
}

function pressInSettings(state: DemoState, overlay: Extract<Overlay, { kind: "settings" }>, key: RemoteKey): DemoState {
  switch (key) {
    case "up":
    case "down":
    case "left":
    case "right": {
      const result = moveFocus(settingsFocusRows, overlay.focus, key, settingsMemory(state.prefs));
      if (!result.moved) return bumped(state, key);
      const row = SETTINGS_ROWS.find((candidate) => candidate.id === result.focus.rowId);
      const option = row?.options[result.focus.index];
      const label = row && row.kind === "choice" ? `${row.label}: ${option?.label}` : (row?.label ?? "");
      return { ...state, overlay: { kind: "settings", focus: result.focus }, bump: null, announcement: label };
    }
    case "ok":
      return applySetting(state, overlay.focus);
    case "back": {
      // Focus returns to the control that opened the panel (PRD section 6.3).
      const next = { ...state, overlay: { kind: "none" } as Overlay, focus: { rowId: "top", index: TOP_ITEMS.indexOf("settings") } };
      return { ...next, announcement: `Settings closed. ${describeFocus(next)}` };
    }
    case "home":
      return goHome(state);
    case "menu":
      return state;
  }
}

function pressInOptions(state: DemoState, overlay: Extract<Overlay, { kind: "options" }>, key: RemoteKey): DemoState {
  const count = optionItems(state, overlay.appId, overlay.fromDock).length;
  switch (key) {
    case "up":
    case "down": {
      const index = Math.min(count - 1, Math.max(0, overlay.index + (key === "up" ? -1 : 1)));
      if (index === overlay.index) return bumped(state, key);
      return { ...state, overlay: { ...overlay, index }, bump: null, announcement: optionItems(state, overlay.appId, overlay.fromDock)[index].label };
    }
    case "ok":
      return applyOption(state, overlay, overlay.index);
    case "back":
    case "menu": {
      const next = { ...state, overlay: { kind: "none" } as Overlay };
      return { ...next, announcement: `Options closed. ${describeFocus(next)}` };
    }
    case "home":
      return goHome(state);
    default:
      return state;
  }
}

function pressInApp(state: DemoState, overlay: Extract<Overlay, { kind: "app" }>, key: RemoteKey): DemoState {
  if (key === "home") return goHome(state);
  if (key !== "back") return { ...state, announcement: "This is a stand-in for the app. Press Back to return." };
  // Returning from an app restores focus to the tile that opened it.
  const next = { ...state, overlay: { kind: "none" } as Overlay };
  const app = findApp(overlay.appId);
  return { ...next, announcement: `Back in Oriel. ${app?.name ?? "The app"} is still focused.` };
}

function pressInControlPanel(state: DemoState, overlay: Extract<Overlay, { kind: "controlPanel" }>, key: RemoteKey): DemoState {
  switch (key) {
    case "up":
    case "down":
    case "left":
    case "right": {
      const index = moveInGrid(overlay.index, CONTROL_TILES.length, CONTROL_COLUMNS, key);
      if (index === null) return bumped(state, key);
      return { ...state, overlay: { kind: "controlPanel", index }, bump: null, announcement: CONTROL_TILES[index].label };
    }
    case "ok":
      return activateControlTile(state, overlay.index);
    case "back": {
      const next = { ...state, overlay: { kind: "none" } as Overlay, focus: { rowId: "top", index: TOP_ITEMS.indexOf("controls") } };
      return { ...next, announcement: `Control panel closed. ${describeFocus(next)}` };
    }
    case "home":
      return goHome(state);
    case "menu":
      return state;
  }
}

function pressInSystem(state: DemoState, overlay: Extract<Overlay, { kind: "system" }>, key: RemoteKey): DemoState {
  const rows = systemRows(state, overlay.tile);
  switch (key) {
    case "up":
    case "down": {
      const index = overlay.index + (key === "up" ? -1 : 1);
      if (index < 0 || index >= rows.length) return bumped(state, key);
      const row = rows[index];
      return { ...state, overlay: { ...overlay, index }, bump: null, announcement: row.value ? `${row.label}, ${row.value}` : row.label };
    }
    case "left":
    case "right":
      return bumped(state, key);
    case "ok":
      return applySystemRow(state, overlay, overlay.index);
    case "back": {
      // Back from the TV's screen returns to the control panel, on the tile that opened it.
      const index = CONTROL_TILES.findIndex((tile) => tile.id === overlay.tile);
      return { ...state, overlay: { kind: "controlPanel", index }, bump: null, announcement: `Back in the control panel. ${CONTROL_TILES[index].label}.` };
    }
    case "home":
      return goHome(state);
    case "menu":
      return state;
  }
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (state.power !== "on") {
    if (action.type === "booted" && state.power === "booting") {
      const next = { ...state, power: "on" as Power };
      return { ...next, announcement: `Oriel is ready. ${describeFocus(next)}` };
    }
    if (action.type === "press" && state.power === "off") {
      if (action.key === "ok" || action.key === "home") return { ...state, power: "booting", announcement: "Turning on the TV." };
      return { ...state, announcement: "The TV is off. Press OK to turn it on." };
    }
    return state;
  }

  switch (action.type) {
    case "press": {
      const { overlay } = state;
      if (overlay.kind === "settings") return pressInSettings(state, overlay, action.key);
      if (overlay.kind === "options") return pressInOptions(state, overlay, action.key);
      if (overlay.kind === "app") return pressInApp(state, overlay, action.key);
      if (overlay.kind === "controlPanel") return pressInControlPanel(state, overlay, action.key);
      if (overlay.kind === "system") return pressInSystem(state, overlay, action.key);
      return pressOnHome(state, action.key);
    }
    case "activate": {
      if (state.overlay.kind !== "none") return state;
      const focused = settle({ ...state, focus: action.target, bump: null });
      return selectHomeItem(focused);
    }
    case "activateSetting":
      if (state.overlay.kind !== "settings") return state;
      return applySetting(state, action.target);
    case "activateOption":
      if (state.overlay.kind !== "options") return state;
      return applyOption(state, state.overlay, action.index);
    case "activateControl":
      if (state.overlay.kind !== "controlPanel") return state;
      return activateControlTile({ ...state, overlay: { kind: "controlPanel", index: action.index } }, action.index);
    case "activateSystemRow":
      if (state.overlay.kind !== "system") return state;
      return applySystemRow(state, state.overlay, action.index);
    case "booted":
      return state;
    case "setPreference":
      return { ...state, prefs: { ...state.prefs, ...action.preference } };
    case "dismissToast":
      return action.id === state.toastId ? { ...state, toast: null } : state;
  }
}
