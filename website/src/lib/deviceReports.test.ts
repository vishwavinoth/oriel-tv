import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { loadDeviceReports, parseDeviceReport, toCompatibilityEntry } from "./deviceReports.ts";

const valid = {
  device: "Living Room 55",
  manufacturer: "Example",
  platform: "Google TV",
  androidVersion: "12",
  orielVersion: "0.1.0",
  testedBy: "octo-cat",
  testedOn: "2026-10-20",
  testedOnPhysicalDevice: true,
  worked: ["install", "showApps", "setAsHome"],
  problems: "The clock overlaps the status bar at 720p.",
};

test("a complete report parses", () => {
  const report = parseDeviceReport(valid, "example.json");
  assert.equal(report.device, "Living Room 55");
  assert.deepEqual(report.worked, ["install", "showApps", "setAsHome"]);
});

test("broken reports are refused with the file and field named", () => {
  const cases: [string, Record<string, unknown>, RegExp][] = [
    ["unknown field", { ...valid, serial: "ABC123" }, /unknown field "serial"/],
    ["not tested on a TV", { ...valid, testedOnPhysicalDevice: false }, /testedOnPhysicalDevice/],
    ["unknown platform", { ...valid, platform: "Roku" }, /"platform" must be one of/],
    ["unknown checklist item", { ...valid, worked: ["install", "teleport"] }, /unknown item "teleport"/],
    ["repeated checklist item", { ...valid, worked: ["install", "install"] }, /lists an item twice/],
    ["not a GitHub username", { ...valid, testedBy: "not a name" }, /GitHub username/],
    ["bad date", { ...valid, testedOn: "20 October" }, /"testedOn" must be a date/],
    ["future date", { ...valid, testedOn: "2999-01-01" }, /in the future/],
    ["bad version", { ...valid, orielVersion: "latest" }, /orielVersion/],
    ["missing field", { ...valid, device: undefined }, /"device" must be text/],
    ["too long", { ...valid, problems: "x".repeat(1001) }, /1000 characters or fewer/],
  ];
  for (const [name, report, message] of cases) {
    assert.throws(() => parseDeviceReport(report, "bad.json"), (error: Error) => error.message.startsWith("bad.json: ") && message.test(error.message), name);
  }
});

test("reports load from a folder, newest first, and invalid JSON names its file", () => {
  const folder = mkdtempSync(path.join(tmpdir(), "oriel-reports-"));
  writeFileSync(path.join(folder, "older.json"), JSON.stringify({ ...valid, testedOn: "2026-09-01" }));
  writeFileSync(path.join(folder, "newer.json"), JSON.stringify(valid));
  writeFileSync(path.join(folder, "README.md"), "Not a report.");
  assert.deepEqual(loadDeviceReports(folder).map((report) => report.file), ["newer.json", "older.json"]);
  writeFileSync(path.join(folder, "broken.json"), "{");
  assert.throws(() => loadDeviceReports(folder), /broken\.json: isn't valid JSON/);
});

test("a report becomes a community entry in the compatibility explorer", () => {
  const entry = toCompatibilityEntry({ file: "example.json", ...parseDeviceReport(valid, "example.json") }, "https://example.org/report");
  assert.equal(entry.evidence, "community");
  assert.equal(entry.capabilities.runs.support, "yes");
  assert.equal(entry.capabilities.home.support, "yes");
  assert.equal(entry.capabilities.deviceTools.support, "unknown");
  assert.deepEqual(entry.limitations, [valid.problems]);
  const verified = toCompatibilityEntry({ file: "v.json", ...parseDeviceReport({ ...valid, verifiedByProject: true }, "v.json") }, "#");
  assert.equal(verified.evidence, "verified");
});

test("the repository's reports are all valid", () => {
  assert.doesNotThrow(() => loadDeviceReports());
});
