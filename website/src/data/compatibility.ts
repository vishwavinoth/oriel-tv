// Compatibility data for the device explorer (PRD section 5.1). Never fabricate results: an entry is
// "verified" only when the project tested it on hardware, and "community" only when it comes from a
// device report. Everything else is an expectation based on how the platform works.

export type Support = "yes" | "partial" | "no" | "unknown";
export type Evidence = "verified" | "community" | "expected";

export interface Capability {
  support: Support;
  note: string;
}

export interface CompatibilityEntry {
  id: string;
  name: string;
  kind: "platform" | "device";
  family: "android" | "other";
  system: string;
  evidence: Evidence;
  capabilities: {
    runs: Capability;
    home: Capability;
    deviceTools: Capability;
  };
  limitations: readonly string[];
  /** ISO date of the test or report. Null for expectations, which nobody has tested. */
  checked: string | null;
  source: { label: string; href: string } | null;
}

export const CAPABILITY_LABELS = {
  runs: "Runs Oriel",
  home: "Works as the home screen",
  deviceTools: "Device tools (ADB)",
} as const;

export const EVIDENCE_LABELS: Record<Evidence, { label: string; description: string }> = {
  verified: {
    label: "Verified",
    description: "Tested by the project on this hardware and software version.",
  },
  community: {
    label: "Community report",
    description: "Reported by someone who tested it on their own device. Not checked by the project.",
  },
  expected: {
    label: "Expected",
    description: "Based on how the platform works. Nobody has tested Oriel here yet.",
  },
};

/** When the platform expectations below were last reviewed. */
export const LAST_REVIEWED = "2026-10-24";

const notAndroid = (name: string): CompatibilityEntry["capabilities"] => ({
  runs: { support: "no", note: `${name} isn’t Android, so Oriel can’t run on it.` },
  home: { support: "no", note: "Oriel can’t replace the home screen." },
  deviceTools: { support: "no", note: "Android device tools don’t apply." },
});

export const COMPATIBILITY: readonly CompatibilityEntry[] = [
  {
    id: "google-tv",
    name: "Google TV",
    kind: "platform",
    family: "android",
    system: "Google TV, based on Android TV 10 and newer",
    evidence: "expected",
    capabilities: {
      runs: { support: "yes", note: "Installs and opens like any other app." },
      home: {
        support: "partial",
        note: "Most devices have no setting to change the home app. The Home button keeps opening Google’s home screen unless that’s turned off with ADB.",
      },
      deviceTools: { support: "partial", note: "Developer options and ADB are available on most devices. Control Center can use them." },
    },
    limitations: [
      "Turning off the built-in home screen can affect setup screens, voice search, or casting on some models.",
      "Firmware updates can turn the built-in home screen back on.",
    ],
    checked: null,
    source: null,
  },
  {
    id: "android-tv",
    name: "Android TV",
    kind: "platform",
    family: "android",
    system: "Android TV 8 and newer, without Google TV",
    evidence: "expected",
    capabilities: {
      runs: { support: "yes", note: "Installs and opens like any other app." },
      home: {
        support: "partial",
        note: "Some devices ask which home app to use when you press Home. Many manufacturer builds don’t.",
      },
      deviceTools: { support: "partial", note: "Developer options and ADB are available on most devices. Control Center can use them." },
    },
    limitations: ["Manufacturers customize Android TV heavily, so behavior varies by model and software version."],
    checked: null,
    source: null,
  },
  {
    id: "fire-tv",
    name: "Fire TV",
    kind: "platform",
    family: "android",
    system: "Fire OS, which is based on Android",
    evidence: "expected",
    capabilities: {
      runs: { support: "yes", note: "Can be installed and opened as an app." },
      home: { support: "no", note: "Fire OS returns to Amazon’s home screen when you press Home." },
      deviceTools: { support: "partial", note: "ADB is available in developer options." },
    },
    limitations: ["Oriel can’t be the home screen on Fire TV."],
    checked: null,
    source: null,
  },
  {
    id: "tizen",
    name: "Samsung Tizen TVs",
    kind: "platform",
    family: "other",
    system: "Tizen",
    evidence: "expected",
    capabilities: notAndroid("Tizen"),
    limitations: ["A different platform. It would need a separate project."],
    checked: null,
    source: null,
  },
  {
    id: "webos",
    name: "LG webOS TVs",
    kind: "platform",
    family: "other",
    system: "webOS",
    evidence: "expected",
    capabilities: notAndroid("webOS"),
    limitations: ["A different platform. It would need a separate project."],
    checked: null,
    source: null,
  },
  {
    id: "roku",
    name: "Roku",
    kind: "platform",
    family: "other",
    system: "Roku OS",
    evidence: "expected",
    capabilities: notAndroid("Roku OS"),
    limitations: ["A different platform. It would need a separate project."],
    checked: null,
    source: null,
  },
];

/** Device reports from real hardware. None yet; see .github/ISSUE_TEMPLATE/device_report.yml. */
export const DEVICE_REPORTS: readonly CompatibilityEntry[] = [];
