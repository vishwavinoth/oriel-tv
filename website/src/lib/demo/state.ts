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

// ---------- Home screen ----------

export const TOP_ITEMS = ["search", "settings"] as const;

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

// ---------- State ----------

export type Overlay =
  | { kind: "none" }
  | { kind: "settings"; focus: Focus }
  | { kind: "options"; appId: string; fromDock: boolean; index: number }
  | { kind: "app"; appId: string };

export interface DemoState {
  prefs: DemoPreferences;
  favorites: string[];
  hidden: string[];
  focus: Focus;
  memory: Record<string, number>;
  overlay: Overlay;
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
  | { type: "setPreference"; preference: Partial<DemoPreferences> }
  | { type: "dismissToast"; id: number };

export function initialDemoState(): DemoState {
  return {
    prefs: { ...DEFAULT_PREFERENCES },
    favorites: [...DEFAULT_FAVORITES],
    hidden: [],
    focus: { rowId: "dock", index: 0 },
    memory: {},
    overlay: { kind: "none" },
    announcement: "",
    toast: null,
    toastId: 0,
    bump: null,
  };
}

function describeFocus(state: DemoState): string {
  const focused = focusedItem(state);
  if (!focused) return "No apps to show.";
  if (focused.row.id === "top") return focused.id === "search" ? "Search button" : "Settings button";
  const app = findApp(focused.id);
  const index = focused.row.items.indexOf(focused.id);
  return `${app?.name ?? focused.id}, ${index + 1} of ${focused.row.size}, ${focused.row.label}`;
}

function withToast(state: DemoState, message: string): DemoState {
  return { ...state, toast: message, toastId: state.toastId + 1, announcement: message };
}

function settle(state: DemoState): DemoState {
  return { ...state, focus: normalizeFocus(homeRows(state), state.focus) };
}

function goHome(state: DemoState): DemoState {
  const next = settle({ ...state, overlay: { kind: "none" }, focus: { rowId: "dock", index: 0 }, bump: null });
  return { ...next, announcement: `Home. ${describeFocus(next)}` };
}

function selectHomeItem(state: DemoState): DemoState {
  const focused = focusedItem(state);
  if (!focused) return state;
  if (focused.id === "search") return withToast(state, "Search opens here on a real TV. It isn't part of this demo.");
  if (focused.id === "settings") {
    const memory = settingsMemory(state.prefs);
    return { ...state, overlay: { kind: "settings", focus: { rowId: "theme", index: memory.theme } }, announcement: "Settings opened. Theme." };
  }
  const app = findApp(focused.id);
  return { ...state, overlay: { kind: "app", appId: focused.id }, announcement: `${app?.name ?? "App"} is open. Press Back to return to Oriel.` };
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
    return { ...state, prefs: { ...state.prefs, [key]: value }, overlay, announcement: `${row.label} ${value ? "on" : "off"}.` };
  }
  const key = row.id as "theme" | "accent" | "wallpaper";
  return { ...state, prefs: { ...state.prefs, [key]: option.value }, overlay, announcement: `${row.label}: ${option.label}.` };
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

function pressOnHome(state: DemoState, key: RemoteKey): DemoState {
  switch (key) {
    case "up":
    case "down":
    case "left":
    case "right": {
      const rows = homeRows(state);
      const result = moveFocus(rows, state.focus, key, state.memory);
      if (!result.moved) return { ...state, bump: { direction: key, id: (state.bump?.id ?? 0) + 1 } };
      const memory = result.left ? { ...state.memory, [result.left.rowId]: result.left.index } : state.memory;
      const next = { ...state, focus: result.focus, memory, bump: null };
      return { ...next, announcement: describeFocus(next) };
    }
    case "ok":
      return selectHomeItem(state);
    case "menu": {
      const focused = focusedItem(state);
      if (!focused || focused.row.id === "top") return withToast(state, "Press Menu on an app for its options.");
      const app = findApp(focused.id);
      return { ...state, overlay: { kind: "options", appId: focused.id, fromDock: focused.row.id === "dock", index: 0 }, announcement: `Options for ${app?.name ?? "app"}.` };
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
      if (!result.moved) return { ...state, bump: { direction: key, id: (state.bump?.id ?? 0) + 1 } };
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
      if (index === overlay.index) return { ...state, bump: { direction: key, id: (state.bump?.id ?? 0) + 1 } };
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

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "press": {
      const { overlay } = state;
      if (overlay.kind === "settings") return pressInSettings(state, overlay, action.key);
      if (overlay.kind === "options") return pressInOptions(state, overlay, action.key);
      if (overlay.kind === "app") return pressInApp(state, overlay, action.key);
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
    case "setPreference":
      return { ...state, prefs: { ...state.prefs, ...action.preference } };
    case "dismissToast":
      return action.id === state.toastId ? { ...state, toast: null } : state;
  }
}
