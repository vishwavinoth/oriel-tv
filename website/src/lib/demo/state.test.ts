import assert from "node:assert/strict";
import { test } from "node:test";
import {
  demoReducer,
  focusedItem,
  homeRows,
  initialDemoState,
  optionItems,
  type DemoAction,
  type DemoState,
  type RemoteKey,
} from "./state.ts";

const press = (state: DemoState, ...keys: RemoteKey[]) =>
  keys.reduce((current, key) => demoReducer(current, { type: "press", key } satisfies DemoAction), state);

test("starts on the first favorite", () => {
  const state = initialDemoState();
  assert.equal(focusedItem(state)?.id, "cinema");
});

test("arrow keys move focus and announce the focused app", () => {
  const state = press(initialDemoState(), "right", "right");
  assert.equal(focusedItem(state)?.id, "music");
  assert.equal(state.announcement, "Music, 3 of 5, Favorites");
});

test("hitting an edge doesn't move focus and records a bump", () => {
  const state = press(initialDemoState(), "left");
  assert.equal(focusedItem(state)?.id, "cinema");
  assert.equal(state.bump?.direction, "left");
});

test("closing Settings returns focus to the Settings button", () => {
  let state = press(initialDemoState(), "up");
  assert.equal(focusedItem(state)?.id, "search");
  state = press(state, "right", "ok");
  assert.equal(state.overlay.kind, "settings");
  state = press(state, "back");
  assert.equal(state.overlay.kind, "none");
  assert.equal(focusedItem(state)?.id, "settings");
});

test("Settings changes the theme, accent, and wallpaper", () => {
  let state = press(initialDemoState(), "up", "right", "ok");
  state = press(state, "right", "ok");
  assert.equal(state.prefs.theme, "light");
  state = press(state, "down", "right", "ok");
  assert.equal(state.prefs.accent, "amber");
  state = press(state, "down", "right", "right", "ok");
  assert.equal(state.prefs.wallpaper, "aurora");
});

test("entering a choice row lands on its current value", () => {
  let state = initialDemoState();
  state = demoReducer(state, { type: "setPreference", preference: { accent: "rose" } });
  state = press(state, "up", "right", "ok", "down");
  assert.equal(state.overlay.kind, "settings");
  if (state.overlay.kind === "settings") assert.deepEqual(state.overlay.focus, { rowId: "accent", index: 3 });
});

test("toggles flip and Restore defaults resets everything", () => {
  let state = press(initialDemoState(), "up", "right", "ok", "down", "down", "down", "ok");
  assert.equal(state.prefs.reduceTransparency, true);
  state = press(state, "down", "down", "down", "ok");
  assert.equal(state.prefs.reduceTransparency, false);
  assert.equal(state.prefs.theme, "dark");
});

test("opening an app and pressing Back restores focus to its tile", () => {
  let state = press(initialDemoState(), "right", "ok");
  assert.deepEqual(state.overlay, { kind: "app", appId: "series" });
  state = press(state, "back");
  assert.equal(state.overlay.kind, "none");
  assert.equal(focusedItem(state)?.id, "series");
});

test("Menu removes a favorite and focus stays in the dock", () => {
  let state = press(initialDemoState(), "right", "right", "right", "right", "menu");
  assert.equal(state.overlay.kind, "options");
  state = press(state, "ok");
  assert.deepEqual(state.favorites, ["cinema", "series", "music", "live"]);
  assert.equal(focusedItem(state)?.id, "live");
  assert.equal(state.toast, "Photos removed from Favorites.");
});

test("Menu moves a favorite to the right", () => {
  let state = press(initialDemoState(), "menu");
  const items = state.overlay.kind === "options" ? optionItems(state, "cinema", true).map((item) => item.action) : [];
  assert.deepEqual(items, ["unfavorite", "moveRight", "hide"]);
  state = press(state, "down", "ok");
  assert.deepEqual(state.favorites.slice(0, 2), ["series", "cinema"]);
  assert.equal(focusedItem(state)?.id, "cinema");
});

test("hiding an app removes it from the grid and the dock", () => {
  const state = press(initialDemoState(), "menu", "down", "down", "ok");
  assert.ok(state.hidden.includes("cinema"));
  const rows = homeRows(state);
  assert.ok(rows.every((row) => !row.items.includes("cinema")));
  assert.notEqual(focusedItem(state)?.id, "cinema");
});

test("removing every favorite skips the empty dock", () => {
  let state = initialDemoState();
  for (let i = 0; i < 5; i += 1) state = press(state, "menu", "ok");
  assert.deepEqual(state.favorites, []);
  assert.equal(focusedItem(state)?.row.label, "All apps");
  state = press(state, "up");
  assert.equal(focusedItem(state)?.id, "search");
});

test("Home closes overlays and returns to the first favorite", () => {
  let state = press(initialDemoState(), "down", "right", "ok");
  assert.equal(state.overlay.kind, "app");
  state = press(state, "home");
  assert.equal(state.overlay.kind, "none");
  assert.equal(focusedItem(state)?.id, "cinema");
});

test("toasts dismiss only their own id", () => {
  let state = press(initialDemoState(), "back");
  const { toastId } = state;
  state = demoReducer(state, { type: "dismissToast", id: toastId - 1 });
  assert.notEqual(state.toast, null);
  state = demoReducer(state, { type: "dismissToast", id: toastId });
  assert.equal(state.toast, null);
});
