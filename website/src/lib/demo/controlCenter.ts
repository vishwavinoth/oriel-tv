// A walkthrough of Oriel Control Center for the demo page. It follows the desktop app's plans
// (shared/device/.../Operations.kt) for one fictional TV, so it can show the review, confirm, run, and result
// steps without a real device. Kept free of React so it can be tested directly.

export const DEMO_TV = {
  label: "Living room TV",
  address: "192.168.1.50:5555",
  platform: "Google TV",
  android: "12 (API 31)",
  build: "STTL.240206.002",
  screen: "1920x1080",
  memory: "1968 MB",
} as const;

const ORIEL_PACKAGE = "tv.oriel.launcher";
const ORIEL_HOME = `${ORIEL_PACKAGE}/.MainActivity`;
const BUILT_IN_HOME = "com.google.android.apps.tv.launcherx";
const adb = (...words: string[]) => ["adb", "-s", DEMO_TV.address, ...words].join(" ");

export type OperationId = "install" | "setHome" | "turnOff" | "turnOn";

export interface TvState {
  orielInstalled: boolean;
  orielIsHome: boolean;
  builtInOff: boolean;
}

export interface Plan {
  id: OperationId;
  title: string;
  explanation: string[];
  risks: string[];
  reversibility: string;
  commands: string[];
  recovery: string[];
}

export type OperationOption = { id: OperationId; title: string } & ({ plan: Plan } | { reason: string });

const TITLES: Record<OperationId, string> = {
  install: "Install or update Oriel",
  setHome: "Make Oriel the home app",
  turnOff: "Turn off the built-in home screen",
  turnOn: "Turn the built-in home screen back on",
};

const unavailable = (id: OperationId, reason: string): OperationOption => ({ id, title: TITLES[id], reason });
const available = (plan: Omit<Plan, "title" | "reversibility">): OperationOption => ({
  id: plan.id,
  title: TITLES[plan.id],
  plan: { ...plan, title: TITLES[plan.id], reversibility: "Can be undone" },
});

export function operationOptions(tv: TvState): OperationOption[] {
  return [
    available({
      id: "install",
      explanation: [
        `Installs oriel-launcher.apk on ${DEMO_TV.label}. If Oriel is already installed, it’s updated and keeps its settings.`,
        "Nothing else on the TV changes. Oriel opens like any other app until you choose to make it the home app.",
      ],
      risks: ["If the APK is signed with a different key than the installed copy, the update fails and nothing changes."],
      commands: [adb("install", "-r", "oriel-launcher.apk")],
      recovery: [`To remove Oriel, uninstall it from the TV’s app settings, or run: adb uninstall ${ORIEL_PACKAGE}`],
    }),
    !tv.orielInstalled
      ? unavailable("setHome", "Install Oriel first.")
      : tv.orielIsHome
        ? unavailable("setHome", "Oriel is already the home app.")
        : available({
            id: "setHome",
            explanation: [
              `Asks Android to use Oriel when you press Home on ${DEMO_TV.label}. This is the gentlest option: nothing is turned off.`,
              "Many Google TV devices ignore this preference. If Home still opens the built-in screen afterwards, review “Turn off the built-in home screen”.",
            ],
            risks: ["Some devices reset this preference after an update or a restart."],
            commands: [adb("shell", "cmd", "package", "set-home-activity", ORIEL_HOME)],
            recovery: ["To go back, choose the built-in home app when the TV asks, or uninstall Oriel."],
          }),
    !tv.orielInstalled
      ? unavailable("turnOff", "Install Oriel first, so the TV always has a home screen.")
      : tv.builtInOff
        ? unavailable("turnOff", "No built-in home screen Oriel knows about is turned on.")
        : available({
            id: "turnOff",
            explanation: [
              `Turns off ${BUILT_IN_HOME} for the main user on ${DEMO_TV.label}, so pressing Home opens Oriel.`,
              "It isn’t uninstalled. It stays on the TV and can be turned back on at any time.",
            ],
            risks: [
              "On some models this affects setup screens, voice search, or casting from a phone.",
              "Firmware updates can turn the built-in home screen back on.",
              `Nobody on the Oriel project has verified this on ${DEMO_TV.label} yet.`,
            ],
            commands: [adb("shell", "pm", "disable-user", "--user", "0", BUILT_IN_HOME)],
            recovery: [`Use “Turn the built-in home screen back on” in Control Center, or run: adb shell pm enable ${BUILT_IN_HOME}`],
          }),
    !tv.builtInOff
      ? unavailable("turnOn", "The built-in home screen is already on.")
      : available({
          id: "turnOn",
          explanation: [`Turns ${BUILT_IN_HOME} back on, so ${DEMO_TV.label} works the way it did before.`],
          risks: ["Pressing Home may open the built-in screen again instead of Oriel."],
          commands: [adb("shell", "pm", "enable", BUILT_IN_HOME)],
          recovery: ["If Home still opens Oriel, uninstall Oriel or choose the built-in home app when the TV asks."],
        }),
  ];
}

export function planFor(tv: TvState, id: OperationId): Plan | null {
  const option = operationOptions(tv).find((candidate) => candidate.id === id);
  return option && "plan" in option ? option.plan : null;
}

/** The same fields, in the same order, as Control Center's device report (shared/device/.../DeviceReport.kt). */
export function deviceReport(tv: TvState): string {
  return [
    "Oriel device report",
    "",
    `- Device: ${DEMO_TV.label}`,
    `- Platform: ${DEMO_TV.platform}`,
    `- Android: ${DEMO_TV.android}, build ${DEMO_TV.build}`,
    `- Screen: ${DEMO_TV.screen}`,
    `- Memory: ${DEMO_TV.memory}`,
    "- Connection: network debugging",
    `- Oriel: ${tv.orielInstalled ? "installed, version 0.1.0-dev" : "not installed"}`,
    `- Home app: ${tv.orielIsHome ? ORIEL_PACKAGE : BUILT_IN_HOME}`,
    `- Built-in home screens: ${BUILT_IN_HOME} (${tv.builtInOff ? "off" : "on"})`,
    `- Apps turned off: ${tv.builtInOff ? 1 : 0}`,
    "",
    "Warnings:",
    "- This connection uses network debugging, which isn’t encrypted. Turn it off on the TV when you’re done.",
    "",
    "This report leaves out the device’s address, serial number, and list of installed apps.",
  ].join("\n");
}

// ---------- State ----------

export interface CcState {
  connected: boolean;
  selected: boolean;
  tv: TvState;
  review: OperationId | null;
  confirmed: boolean;
  running: { id: OperationId; completed: number } | null;
  result: { id: OperationId; title: string; commands: string[] } | null;
  history: { operation: string; outcome: string }[];
}

export type CcAction =
  | { type: "connect" }
  | { type: "select" }
  | { type: "review"; id: OperationId }
  | { type: "confirm"; value: boolean }
  | { type: "cancel" }
  | { type: "run" }
  | { type: "tick" }
  | { type: "closeResult" }
  | { type: "reset" };

export function initialCcState(): CcState {
  return {
    connected: false,
    selected: false,
    tv: { orielInstalled: false, orielIsHome: false, builtInOff: false },
    review: null,
    confirmed: false,
    running: null,
    result: null,
    history: [],
  };
}

function applied(tv: TvState, id: OperationId): TvState {
  switch (id) {
    case "install":
      return { ...tv, orielInstalled: true };
    case "setHome":
      return { ...tv, orielIsHome: true };
    case "turnOff":
      return { ...tv, builtInOff: true, orielIsHome: true };
    case "turnOn":
      return { ...tv, builtInOff: false };
  }
}

export function ccReducer(state: CcState, action: CcAction): CcState {
  switch (action.type) {
    case "connect":
      return { ...state, connected: true };
    case "select":
      return state.connected ? { ...state, selected: true } : state;
    case "review":
      // Only an available operation can be reviewed, and nothing runs until it's confirmed.
      if (!state.selected || state.running || !planFor(state.tv, action.id)) return state;
      return { ...state, review: action.id, confirmed: false, result: null };
    case "confirm":
      return state.review && !state.running ? { ...state, confirmed: action.value } : state;
    case "cancel":
      return state.running ? state : { ...state, review: null, confirmed: false };
    case "run":
      if (!state.review || !state.confirmed || state.running) return state;
      return { ...state, running: { id: state.review, completed: 0 } };
    case "tick": {
      if (!state.running) return state;
      const plan = planFor(state.tv, state.running.id);
      if (!plan) return { ...state, running: null };
      const completed = state.running.completed + 1;
      if (completed < plan.commands.length) return { ...state, running: { ...state.running, completed } };
      return {
        ...state,
        tv: applied(state.tv, plan.id),
        running: null,
        review: null,
        confirmed: false,
        result: { id: plan.id, title: plan.title, commands: plan.commands },
        history: [...state.history, { operation: plan.title, outcome: "Succeeded" }],
      };
    }
    case "closeResult":
      return { ...state, result: null };
    case "reset":
      return initialCcState();
  }
}
