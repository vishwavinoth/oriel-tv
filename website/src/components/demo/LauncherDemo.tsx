"use client";

// The interactive launcher demo on the home page. It shows how Oriel's TV home screen behaves, using the
// same design tokens, focus rules, and settings as the launcher, but it's a web recreation: it doesn't
// run the Android launcher's code (PRD section 5.1).

import {
  Accessibility,
  Bell,
  Bluetooth,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock as ClockIcon,
  Ellipsis,
  HardDrive,
  House,
  Info,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Power as PowerIcon,
  RotateCcw,
  SlidersHorizontal,
  ToggleRight,
  Undo2,
  Volume2,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { useEffect, useId, useReducer, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { OrielMark } from "@/components/OrielMark";
import { findApp } from "@/lib/demo/apps";
import { normalizeFocus, type Focus } from "@/lib/demo/focus";
import {
  CONTROL_TILES,
  controlTileLabel,
  demoReducer,
  focusedItem,
  homeRows,
  initialDemoState,
  optionItems,
  SETTINGS_ROWS,
  systemRows,
  TOUR_STEPS,
  type ControlTileId,
  type DemoAction,
  type DemoPreferences,
  type DemoState,
  type Milestone,
  type Power,
  type RemoteKey,
  type SystemTileId,
} from "@/lib/demo/state";
import { accents, wallpapers, type AccentId, type WallpaperId } from "@/lib/tokens.generated";
import { cn } from "@/lib/utils";
import { AppGlyph } from "./AppGlyph";
import styles from "./LauncherDemo.module.css";

type Dispatch = (action: DemoAction) => void;

const KEYS: Record<string, RemoteKey> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "ok",
  " ": "ok",
  Escape: "back",
  Backspace: "back",
  m: "menu",
  M: "menu",
  ContextMenu: "menu",
  h: "home",
  H: "home",
  Home: "home",
};

const EASE_OUT = [0, 0, 0, 1] as const;

// ---------- Clock ----------

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });

function subscribeToClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 10_000);
  return () => window.clearInterval(timer);
}

const readClock = () => {
  const now = new Date();
  return `${timeFormat.format(now)}|${dateFormat.format(now)}`;
};

// The clock renders only in the browser, so the static HTML never shows the build machine's time.
const readServerClock = () => "";

function Clock() {
  const value = useSyncExternalStore(subscribeToClock, readClock, readServerClock);
  if (!value) return null;
  const [time, date] = value.split("|");
  return (
    <>
      <span className={styles.time}>{time}</span>
      <span className={styles.date}>{date}</span>
    </>
  );
}

// ---------- Home screen ----------

const bumpName = (state: DemoState) => (state.bump ? `${state.bump.direction}-${state.bump.id % 2}` : undefined);

function Tile({ appId, focused, bump, onActivate }: { appId: string; focused: boolean; bump?: string; onActivate: () => void }) {
  const app = findApp(appId);
  if (!app) return null;
  return (
    <button
      type="button"
      tabIndex={-1}
      className={styles.tile}
      data-focused={focused}
      data-bump={focused ? bump : undefined}
      style={{ "--tile-a": app.colors[0], "--tile-b": app.colors[1] } as CSSProperties}
      aria-label={app.name}
      onClick={onActivate}
    >
      <AppGlyph name={app.glyph} />
    </button>
  );
}

const TOP_ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  controls: { Icon: ToggleRight, label: "Control panel" },
  settings: { Icon: SlidersHorizontal, label: "Settings" },
};

const TILE_ICONS: Record<ControlTileId, LucideIcon> = {
  oriel: SlidersHorizontal,
  network: Wifi,
  bluetooth: Bluetooth,
  notifications: Bell,
  display: Monitor,
  sound: Volume2,
  screensaver: Moon,
  date: ClockIcon,
  accessibility: Accessibility,
  apps: LayoutGrid,
  storage: HardDrive,
  about: Info,
};

const brightWallpaper = (prefs: DemoPreferences) => prefs.wallpaper === "mist" || prefs.wallpaper === "dawn";

function HomeScreen({ state, dispatch }: { state: DemoState; dispatch: Dispatch }) {
  const rows = homeRows(state);
  const focus = normalizeFocus(rows, state.focus);
  const focused = focusedItem(state);
  const bump = bumpName(state);
  const overlayOpen = state.overlay.kind !== "none";
  const isFocused = (rowId: string, index: number) => !overlayOpen && focus.rowId === rowId && focus.index === index;
  const activate = (rowId: string, index: number) => dispatch({ type: "activate", target: { rowId, index } });

  const top = rows[0];
  const dock = rows.find((row) => row.id === "dock");
  const grid = rows.filter((row) => row.id.startsWith("grid-"));
  const spotlight = focused && focused.row.id !== "top" ? findApp(focused.id) : undefined;

  return (
    <div className={styles.home} data-dimmed={overlayOpen}>
      <div className={styles.topRow}>
        <div className={styles.clock}>{state.prefs.showClock && <Clock />}</div>
        <div className={styles.topActions}>
          {/* Status, not a control, so focus skips it. Like the launcher, it shows only the kind of connection. */}
          <p className={cn(styles.status, "glass-clear", brightWallpaper(state.prefs) && "glass-dim")}>
            {state.connection === "wifi" ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
            {state.connection === "wifi" ? "Wi-Fi" : "Offline"}
          </p>
          {/* Quick actions are small controls over the wallpaper: clear glass, dimmed when the wallpaper is bright. */}
          <div className={cn(styles.controls, "glass-clear", brightWallpaper(state.prefs) && "glass-dim")}>
            {top.items.map((id, index) => {
              const { Icon, label } = TOP_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  tabIndex={-1}
                  className={styles.control}
                  data-focused={isFocused("top", index)}
                  data-bump={isFocused("top", index) ? bump : undefined}
                  aria-label={label}
                  onClick={() => activate("top", index)}
                >
                  <Icon aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.spotlight} aria-hidden="true">
        {spotlight ? (
          <>
            <p className={styles.spotlightCategory}>{spotlight.category}</p>
            <p className={styles.spotlightTitle}>{spotlight.name}</p>
            <p className={styles.spotlightBlurb}>{spotlight.blurb}</p>
            <p className={styles.spotlightHint}>
              <span>OK</span> to open <span>Menu</span> for options
            </p>
          </>
        ) : (
          <>
            <p className={styles.spotlightCategory}>Oriel</p>
            <p className={styles.spotlightTitle}>{focused?.id === "settings" ? "Settings" : "Control panel"}</p>
            <p className={styles.spotlightBlurb}>
              {focused?.id === "settings"
                ? "Theme, accent, wallpaper, and accessibility options."
                : "The connection, and shortcuts to the TV’s own Wi-Fi, Bluetooth, notification, and display settings."}
            </p>
          </>
        )}
      </div>

      <div>
        <p className={styles.rowLabel}>Favorites</p>
        {dock && dock.size > 0 ? (
          <div className={cn(styles.dock, "glass")}>
            {dock.items.map((id, index) => (
              <Tile key={id} appId={id} focused={isFocused("dock", index)} bump={bump} onActivate={() => activate("dock", index)} />
            ))}
          </div>
        ) : (
          <p className={styles.emptyDock}>No favorites. Press Menu on an app to add one.</p>
        )}
      </div>

      <div>
        <p className={styles.rowLabel}>All apps</p>
        <div className={styles.grid}>
          {grid.map((row) => (
            <div key={row.id} className={styles.gridRow}>
              {row.items.map((id, index) => (
                <Tile key={id} appId={id} focused={isFocused(row.id, index)} bump={bump} onActivate={() => activate(row.id, index)} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Overlays ----------

function SettingsPanel({ prefs, focus, bump, dispatch }: { prefs: DemoPreferences; focus: Focus; bump?: string; dispatch: Dispatch }) {
  return (
    <motion.div
      className={cn(styles.panel, "glass")}
      role="dialog"
      aria-label="Settings"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
    >
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}>Settings</p>
        <p className={styles.panelHint}>Back to close</p>
      </div>
      {SETTINGS_ROWS.map((row) => (
        <div key={row.id} className={styles.settingRow}>
          {row.kind === "choice" && <p className={styles.settingLabel}>{row.label}</p>}
          <div className={styles.settingOptions}>
            {row.options.map((option, index) => {
              const focused = focus.rowId === row.id && focus.index === index;
              const common = {
                type: "button" as const,
                tabIndex: -1,
                "data-focused": focused,
                "data-bump": focused ? bump : undefined,
                onClick: () => dispatch({ type: "activateSetting", target: { rowId: row.id, index } }),
              };
              if (row.kind === "toggle") {
                const on = prefs[row.id as "reduceTransparency" | "reduceMotion" | "showClock"];
                return (
                  <button key={option.value} {...common} className={styles.toggle} data-on={on} aria-pressed={on}>
                    <span>{row.label}</span>
                    <span className={styles.toggleTrack} aria-hidden="true" />
                  </button>
                );
              }
              if (row.kind === "action") {
                return (
                  <button key={option.value} {...common} className={styles.action}>
                    <RotateCcw aria-hidden="true" />
                    {option.label}
                  </button>
                );
              }
              const selected = prefs[row.id as "theme" | "accent" | "wallpaper"] === option.value;
              if (row.id === "accent" || row.id === "wallpaper") {
                const background =
                  row.id === "accent" ? accents.find((accent) => accent.id === option.value)?.[prefs.theme] : `var(--o-wallpaper-${option.value})`;
                return (
                  <button
                    key={option.value}
                    {...common}
                    className={cn(styles.swatch, row.id === "wallpaper" && styles.wallpaperSwatch)}
                    data-selected={selected}
                    aria-label={option.label}
                    aria-pressed={selected}
                    style={{ background }}
                  />
                );
              }
              return (
                <button key={option.value} {...common} className={styles.chip} data-selected={selected} aria-pressed={selected}>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function OptionsSheet({ state, dispatch }: { state: DemoState; dispatch: Dispatch }) {
  if (state.overlay.kind !== "options") return null;
  const { appId, fromDock, index } = state.overlay;
  const app = findApp(appId);
  return (
    <motion.div
      className={cn(styles.sheet, "glass")}
      role="menu"
      aria-label={`Options for ${app?.name ?? "app"}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
    >
      <p className={styles.sheetTitle}>{app?.name}</p>
      {optionItems(state, appId, fromDock).map((item, itemIndex) => (
        <button
          key={item.action}
          type="button"
          role="menuitem"
          tabIndex={-1}
          className={styles.sheetItem}
          data-focused={itemIndex === index}
          onClick={() => dispatch({ type: "activateOption", index: itemIndex })}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

function AppScreen({ appId, dispatch }: { appId: string; dispatch: Dispatch }) {
  const app = findApp(appId);
  if (!app) return null;
  return (
    <motion.div
      className={styles.appScreen}
      style={{ "--tile-a": app.colors[0], "--tile-b": app.colors[1] } as CSSProperties}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
    >
      <div className={styles.appIcon}>
        <AppGlyph name={app.glyph} />
      </div>
      <p className={styles.appName}>{app.name}</p>
      <p className={styles.appHint}>This is where {app.name} would open. Press Back to return to Oriel.</p>
      <button type="button" tabIndex={-1} className={cn(styles.appBack, "glass-clear")} onClick={() => dispatch({ type: "press", key: "back" })}>
        <Undo2 aria-hidden="true" />
        Back to Oriel
      </button>
    </motion.div>
  );
}

function ControlPanelView({ state, index, bump, dispatch }: { state: DemoState; index: number; bump?: string; dispatch: Dispatch }) {
  const online = state.connection === "wifi";
  return (
    <motion.div
      className={cn(styles.panel, styles.panelWide, "glass")}
      role="dialog"
      aria-label="Control panel"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
    >
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}>Control panel</p>
        <p className={styles.panelHint}>Back to close</p>
      </div>
      <div className={styles.connection}>
        {online ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
        <div>
          <p className={styles.connectionTitle}>{online ? "Wi-Fi" : "Offline"}</p>
          <p className={styles.connectionDetail}>{online ? "Connected over Wi-Fi." : "Not connected. Apps that need the internet won’t work."}</p>
        </div>
      </div>
      <p className={styles.settingLabel}>Opens your TV’s own settings</p>
      <div className={styles.tiles}>
        {CONTROL_TILES.map((tile, tileIndex) => {
          const Icon = TILE_ICONS[tile.id];
          const focused = tileIndex === index;
          return (
            <button
              key={tile.id}
              type="button"
              tabIndex={-1}
              className={styles.controlTile}
              data-focused={focused}
              data-bump={focused ? bump : undefined}
              onClick={() => dispatch({ type: "activateControl", index: tileIndex })}
            >
              <Icon aria-hidden="true" />
              {tile.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/** A stand-in for the TV's own settings screen, drawn plainly so it doesn't look like part of Oriel. */
function SystemScreen({ state, tile, index, bump, dispatch }: { state: DemoState; tile: SystemTileId; index: number; bump?: string; dispatch: Dispatch }) {
  const Icon = TILE_ICONS[tile];
  return (
    <motion.div
      className={styles.system}
      role="dialog"
      aria-label={`${controlTileLabel(tile)}, the TV’s settings`}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
    >
      <div className={styles.systemIntro}>
        <Icon aria-hidden="true" />
        <p className={styles.systemTitle}>{controlTileLabel(tile)}</p>
        <p className={styles.systemCaption}>The TV’s own settings, simulated. Oriel opens this screen; the TV draws it.</p>
      </div>
      <div className={styles.systemList}>
        {systemRows(state, tile).map((row, rowIndex) => {
          const focused = rowIndex === index;
          return (
            <button
              key={row.id}
              type="button"
              tabIndex={-1}
              className={styles.systemRow}
              data-focused={focused}
              data-bump={focused ? bump : undefined}
              data-kind={row.kind}
              aria-pressed={row.kind === "toggle" ? row.on : undefined}
              onClick={() => dispatch({ type: "activateSystemRow", index: rowIndex })}
            >
              <span>{row.label}</span>
              {row.kind === "toggle" ? (
                <span className={styles.toggleTrack} data-on={row.on} aria-hidden="true" />
              ) : (
                row.value && <span className={styles.systemValue}>{row.value}</span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function PowerScreen({ power, onPower }: { power: Power; onPower: () => void }) {
  return (
    <motion.div className={styles.power} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
      {power === "off" ? (
        <button type="button" tabIndex={-1} className={styles.powerButton} onClick={onPower}>
          <PowerIcon aria-hidden="true" />
          <span>Press OK to turn on the TV</span>
        </button>
      ) : (
        <motion.div className={styles.boot} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: EASE_OUT }}>
          <OrielMark className={styles.bootMark} />
          <p>Oriel</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function Walkthrough({ milestones }: { milestones: readonly Milestone[] }) {
  const titleId = useId();
  const done = TOUR_STEPS.filter((step) => milestones.includes(step.id)).length;
  const next = TOUR_STEPS.find((step) => !milestones.includes(step.id));
  return (
    <section aria-labelledby={titleId} className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={titleId} className="text-title3">
          Guided walkthrough
        </h2>
        <p className="text-callout text-fg-2">
          {done} of {TOUR_STEPS.length} done
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fg/10" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width] duration-(--o-duration-slow)" style={{ width: `${(done / TOUR_STEPS.length) * 100}%` }} />
      </div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {TOUR_STEPS.map((step, index) => {
          const complete = milestones.includes(step.id);
          return (
            <li key={step.id} className="flex gap-3">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-caption font-semibold",
                  complete ? "border-transparent bg-success text-background" : step === next ? "border-accent text-accent" : "border-border text-fg-2",
                )}
              >
                {complete ? <Check aria-label="Done" strokeWidth={3} className="size-4" /> : index + 1}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-callout text-fg-2">{step.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {done === TOUR_STEPS.length && (
        <p className="mt-5 font-semibold text-success" role="status">
          You’ve tried everything. Keep exploring, or see how Control Center makes changes safely below.
        </p>
      )}
    </section>
  );
}

// ---------- Controls outside the screen ----------

const DPAD: { key: RemoteKey; label: string; Icon: LucideIcon; position: string }[] = [
  { key: "up", label: "Up", Icon: ChevronUp, position: "col-start-2 row-start-1" },
  { key: "left", label: "Left", Icon: ChevronLeft, position: "col-start-1 row-start-2" },
  { key: "right", label: "Right", Icon: ChevronRight, position: "col-start-3 row-start-2" },
  { key: "down", label: "Down", Icon: ChevronDown, position: "col-start-2 row-start-3" },
];

const REMOTE_KEYS: { key: RemoteKey; label: string; Icon: LucideIcon }[] = [
  { key: "back", label: "Back", Icon: Undo2 },
  { key: "home", label: "Home", Icon: House },
  { key: "menu", label: "Menu", Icon: Ellipsis },
];

const dpadButton =
  "grid cursor-pointer place-items-center rounded-full text-fg transition-colors duration-(--o-duration-fast) hover:bg-fg/10 active:bg-fg/18";

function Remote({ onPress }: { onPress: (key: RemoteKey) => void }) {
  return (
    <div className="flex items-center gap-5" role="group" aria-label="Remote control">
      <div className="glass-clear grid size-34 grid-cols-[1fr_1.25fr_1fr] grid-rows-[1fr_1.25fr_1fr] rounded-full p-1.5">
        {DPAD.map(({ key, label, Icon, position }) => (
          <button key={key} type="button" aria-label={label} className={cn(dpadButton, position)} onClick={() => onPress(key)}>
            <Icon aria-hidden="true" className="size-5" />
          </button>
        ))}
        <button
          type="button"
          aria-label="OK"
          className={cn(dpadButton, "col-start-2 row-start-2 bg-fg/12 text-[13px] font-bold tracking-wide")}
          onClick={() => onPress("ok")}
        >
          OK
        </button>
      </div>
      <div className="grid gap-2">
        {REMOTE_KEYS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className="glass-clear inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-sm font-semibold transition-colors hover:border-fg/35"
            onClick={() => onPress(key)}
          >
            <Icon aria-hidden="true" className="size-4.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const swatchItem =
  "size-8 cursor-pointer rounded-full border-2 border-transparent bg-clip-padding shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] data-[state=on]:border-fg";

function QuickSettings({ prefs, dispatch }: { prefs: DemoPreferences; dispatch: Dispatch }) {
  const set = (preference: Partial<DemoPreferences>) => dispatch({ type: "setPreference", preference });
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow min-w-21">Theme</span>
        <ToggleGroup.Root
          type="single"
          aria-label="Demo theme"
          value={prefs.theme}
          onValueChange={(value) => value && set({ theme: value as DemoPreferences["theme"] })}
          className="inline-flex rounded-full border border-border bg-surface p-0.75"
        >
          {(["dark", "light"] as const).map((theme) => (
            <ToggleGroup.Item
              key={theme}
              value={theme}
              className="min-h-8 cursor-pointer rounded-full px-3.5 text-[13px] font-semibold text-fg-2 data-[state=on]:bg-fg data-[state=on]:text-background"
            >
              {theme === "dark" ? "Dark" : "Light"}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow min-w-21">Wallpaper</span>
        <ToggleGroup.Root
          type="single"
          aria-label="Demo wallpaper"
          value={prefs.wallpaper}
          onValueChange={(value) => value && set({ wallpaper: value as WallpaperId })}
          className="flex flex-wrap gap-2"
        >
          {wallpapers.map((wallpaper) => (
            <ToggleGroup.Item
              key={wallpaper.id}
              value={wallpaper.id}
              aria-label={wallpaper.label}
              title={wallpaper.label}
              className={cn(swatchItem, "w-12 rounded-[9px]")}
              style={{ background: `var(--o-wallpaper-${wallpaper.id})` }}
            />
          ))}
        </ToggleGroup.Root>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow min-w-21">Accent</span>
        <ToggleGroup.Root
          type="single"
          aria-label="Demo accent color"
          value={prefs.accent}
          onValueChange={(value) => value && set({ accent: value as AccentId })}
          className="flex flex-wrap gap-2"
        >
          {accents.map((accent) => (
            <ToggleGroup.Item
              key={accent.id}
              value={accent.id}
              aria-label={accent.label}
              title={accent.label}
              className={swatchItem}
              style={{ background: accent[prefs.theme] }}
            />
          ))}
        </ToggleGroup.Root>
      </div>
    </div>
  );
}

// ---------- The demo ----------

/**
 * `full` is the demo page's version: the TV starts switched off, a walkthrough tracks what you've tried, and the
 * demo can go fullscreen. The home page shows the TV already on.
 */
export function LauncherDemo({ full = false }: { full?: boolean }) {
  const [state, dispatch] = useReducer(demoReducer, { poweredOff: full }, initialDemoState);
  const helpId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const { prefs, overlay } = state;
  const focused = focusedItem(state);
  const focusedApp = focused && focused.row.id !== "top" ? findApp(focused.id) : undefined;

  useEffect(() => {
    if (!state.toast) return;
    const id = state.toastId;
    const timer = window.setTimeout(() => dispatch({ type: "dismissToast", id }), 2600);
    return () => window.clearTimeout(timer);
  }, [state.toast, state.toastId]);

  useEffect(() => {
    if (state.power !== "booting") return;
    const timer = window.setTimeout(() => dispatch({ type: "booted" }), prefs.reduceMotion ? 250 : 1700);
    return () => window.clearTimeout(timer);
  }, [state.power, prefs.reduceMotion]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null && document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.().then(() => screenRef.current?.focus());
  };

  const press = (key: RemoteKey) => dispatch({ type: "press", key });

  const powerOn = () => {
    press("ok");
    screenRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = KEYS[event.key];
    if (!key) return;
    event.preventDefault();
    press(key);
  };

  return (
    <div
      ref={rootRef}
      className={cn("grid gap-6", fullscreen && "content-center overflow-auto bg-background p-[clamp(1rem,3vw,2.5rem)]")}
    >
      {full && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-callout text-fg-2">
            {state.power === "on" ? "The TV is on. Click it, then use your keyboard or the remote below." : "Press OK, or click the TV, to turn it on."}
          </p>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="glass-clear inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-sm font-semibold"
          >
            {fullscreen ? <Minimize2 aria-hidden="true" className="size-4.5" /> : <Maximize2 aria-hidden="true" className="size-4.5" />}
            {fullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
      )}
      <div
        className={cn(styles.stage, fullscreen && "mx-auto w-full")}
        style={{ "--demo-wallpaper": `var(--o-wallpaper-${prefs.wallpaper})`, ...(fullscreen ? { maxWidth: "calc((100dvh - 15rem) * 16 / 9)" } : {}) } as CSSProperties}
      >
        <MotionConfig reducedMotion={prefs.reduceMotion ? "always" : "user"}>
          <div
            ref={screenRef}
            className={styles.screen}
            data-oriel-scope=""
            data-theme={prefs.theme}
            data-accent={prefs.accent}
            data-transparency={prefs.reduceTransparency ? "reduced" : undefined}
            data-motion={prefs.reduceMotion ? "reduced" : undefined}
            role="application"
            aria-roledescription="TV screen"
            aria-label="Oriel launcher demo"
            aria-describedby={helpId}
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            <div className={styles.wallpaper} aria-hidden="true" />
            <div className={styles.scrim} aria-hidden="true" />
            <HomeScreen state={state} dispatch={dispatch} />
            <AnimatePresence>
              {overlay.kind === "settings" && (
                <SettingsPanel key="settings" prefs={prefs} focus={overlay.focus} bump={bumpName(state)} dispatch={dispatch} />
              )}
              {overlay.kind === "options" && <OptionsSheet key="options" state={state} dispatch={dispatch} />}
              {overlay.kind === "app" && <AppScreen key="app" appId={overlay.appId} dispatch={dispatch} />}
              {overlay.kind === "controlPanel" && (
                <ControlPanelView key="control-panel" state={state} index={overlay.index} bump={bumpName(state)} dispatch={dispatch} />
              )}
              {overlay.kind === "system" && (
                <SystemScreen key={`system-${overlay.tile}`} state={state} tile={overlay.tile} index={overlay.index} bump={bumpName(state)} dispatch={dispatch} />
              )}
              {state.power !== "on" && <PowerScreen key="power" power={state.power} onPower={powerOn} />}
              {state.toast && (
                <motion.p
                  key={`toast-${state.toastId}`}
                  className={cn(styles.toast, "glass")}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  {state.toast}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </MotionConfig>
      </div>

      <p className="text-callout text-fg-2 md:hidden" aria-hidden="true">
        {focusedApp ? (
          <>
            <strong className="text-fg">{focusedApp.name}</strong> · {focusedApp.blurb}
          </>
        ) : (
          <strong className="text-fg">{focused?.id === "settings" ? "Settings" : "Control panel"}</strong>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:justify-between">
        <Remote onPress={press} />
        <QuickSettings prefs={prefs} dispatch={dispatch} />
      </div>

      {full && <Walkthrough milestones={state.milestones} />}

      <p id={helpId} className="max-w-190 text-callout text-fg-2">
        Click the screen, then use the arrow keys, Enter to open, Esc for Back, M for Menu, and H for Home. Or use the remote. This is
        a website demo of Oriel’s home screen; it doesn’t run the Android launcher’s code.
      </p>
      <p className="sr-only" aria-live="polite">
        {state.announcement}
      </p>
    </div>
  );
}
