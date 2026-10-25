// Device reports from community/device-reports/*.json, read when the site is built. A report that doesn't match
// the format fails the build, so mistakes are caught in review instead of reaching the site. See that folder's README.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CompatibilityEntry } from "../data/compatibility.ts";

export const PLATFORMS = ["Google TV", "Android TV", "Fire TV", "Other Android-based TV"] as const;

/** What a tester can say worked, matching the device report issue template. */
export const WORKED = {
  install: "Installing the launcher",
  openFromAppList: "Opening it from the app list",
  setAsHome: "Setting it as the default home screen",
  showApps: "Showing and opening installed apps",
  dpad: "D-pad navigation and focus",
  favorites: "Favorites and hiding apps",
  themes: "Themes, wallpapers, and theme packs",
  controlPanel: "The control panel’s shortcuts",
  controlCenter: "Control Center’s operations",
} as const;

export type WorkedKey = keyof typeof WORKED;

export interface DeviceReport {
  device: string;
  manufacturer: string;
  platform: (typeof PLATFORMS)[number];
  androidVersion: string;
  orielVersion: string;
  testedBy: string;
  testedOn: string;
  testedOnPhysicalDevice: true;
  worked: WorkedKey[];
  problems?: string;
  verifiedByProject?: boolean;
}

export interface LoadedReport extends DeviceReport {
  /** The report's file name, used for its id and its link to the repository. */
  file: string;
}

const FIELDS = new Set([
  "device",
  "manufacturer",
  "platform",
  "androidVersion",
  "orielVersion",
  "testedBy",
  "testedOn",
  "testedOnPhysicalDevice",
  "worked",
  "problems",
  "verifiedByProject",
]);
const GITHUB_HANDLE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const ANDROID_VERSION = /^\d{1,2}(\.\d{1,2}){0,2}$/;
const ORIEL_VERSION = /^(\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?|[0-9a-f]{7,40})$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B-\u001F\u007F]/;

/** Checks one report and returns it typed. Every problem names the file and field, so it's easy to fix. */
export function parseDeviceReport(raw: unknown, source: string): DeviceReport {
  const fail = (message: string): never => {
    throw new Error(`${source}: ${message}`);
  };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return fail("a report must be a JSON object");
  const report = raw as Record<string, unknown>;
  for (const key of Object.keys(report)) if (!FIELDS.has(key)) fail(`unknown field "${key}"`);

  const text = (field: string, max: number, optional = false): string | undefined => {
    const value = report[field];
    if (value === undefined && optional) return undefined;
    if (typeof value !== "string" || value.trim() === "") return fail(`"${field}" must be text`);
    if (value.length > max) fail(`"${field}" must be ${max} characters or fewer`);
    if (CONTROL_CHARACTERS.test(value)) fail(`"${field}" contains control characters`);
    return value.trim();
  };

  const device = text("device", 80)!;
  const manufacturer = text("manufacturer", 40)!;
  const platform = report.platform;
  if (!PLATFORMS.includes(platform as DeviceReport["platform"])) fail(`"platform" must be one of: ${PLATFORMS.join(", ")}`);
  const androidVersion = text("androidVersion", 8)!;
  if (!ANDROID_VERSION.test(androidVersion)) fail(`"androidVersion" must look like 12 or 9.0`);
  const orielVersion = text("orielVersion", 40)!;
  if (!ORIEL_VERSION.test(orielVersion)) fail(`"orielVersion" must be a version like 0.1.0 or a commit hash`);
  const testedBy = text("testedBy", 39)!;
  if (!GITHUB_HANDLE.test(testedBy)) fail(`"testedBy" must be a GitHub username`);
  const testedOn = text("testedOn", 10)!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(testedOn) || Number.isNaN(Date.parse(`${testedOn}T00:00:00Z`))) fail(`"testedOn" must be a date like 2026-11-02`);
  if (testedOn > new Date().toISOString().slice(0, 10)) fail(`"testedOn" is in the future`);
  if (report.testedOnPhysicalDevice !== true) fail(`"testedOnPhysicalDevice" must be true: reports are only for TVs someone tested themselves`);

  const worked = report.worked;
  if (!Array.isArray(worked)) return fail(`"worked" must be a list`);
  for (const key of worked) if (!(typeof key === "string" && key in WORKED)) fail(`"worked" has an unknown item "${String(key)}"`);
  if (new Set(worked).size !== worked.length) fail(`"worked" lists an item twice`);

  const problems = text("problems", 1000, true);
  const verifiedByProject = report.verifiedByProject;
  if (verifiedByProject !== undefined && typeof verifiedByProject !== "boolean") fail(`"verifiedByProject" must be true or false`);

  return {
    device,
    manufacturer,
    platform: platform as DeviceReport["platform"],
    androidVersion,
    orielVersion,
    testedBy,
    testedOn,
    testedOnPhysicalDevice: true,
    worked: worked as WorkedKey[],
    ...(problems ? { problems } : {}),
    ...(typeof verifiedByProject === "boolean" ? { verifiedByProject } : {}),
  };
}

/** Every report in the folder, newest first. Server-only: it reads the file system during `next build`. */
export function loadDeviceReports(folder = path.resolve(process.cwd(), "..", "community", "device-reports")): LoadedReport[] {
  return readdirSync(folder)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(path.join(folder, file), "utf8"));
      } catch {
        throw new Error(`${file}: isn't valid JSON`);
      }
      return { file, ...parseDeviceReport(raw, file) };
    })
    .sort((a, b) => b.testedOn.localeCompare(a.testedOn) || a.file.localeCompare(b.file));
}

/** A report as an entry in the Devices page's compatibility explorer. */
export function toCompatibilityEntry(report: LoadedReport, sourceHref: string): CompatibilityEntry {
  const has = (key: WorkedKey) => report.worked.includes(key);
  const notReported = "Not reported as working. See the notes, if any.";
  return {
    id: `report-${report.file.replace(/\.json$/, "")}`,
    name: `${report.manufacturer} ${report.device}`,
    kind: "device",
    family: "android",
    system: `${report.platform}, Android ${report.androidVersion}`,
    evidence: report.verifiedByProject ? "verified" : "community",
    capabilities: {
      runs: has("install") && has("showApps")
        ? { support: "yes", note: `Installed Oriel ${report.orielVersion} and opened apps.` }
        : { support: has("install") ? "partial" : "unknown", note: has("install") ? "Installed, but opening apps wasn’t reported as working." : notReported },
      home: has("setAsHome") ? { support: "yes", note: "Worked as the default home screen." } : { support: "unknown", note: notReported },
      deviceTools: has("controlCenter") ? { support: "yes", note: "Control Center’s operations worked." } : { support: "unknown", note: notReported },
    },
    limitations: report.problems ? [report.problems] : [],
    checked: report.testedOn,
    source: { label: `Report by @${report.testedBy}`, href: sourceHref },
  };
}
