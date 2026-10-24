import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_TV, ccReducer, deviceReport, initialCcState, operationOptions, type CcAction, type CcState } from "./controlCenter.ts";

const run = (state: CcState, ...actions: CcAction[]) => actions.reduce(ccReducer, state);
const ready = () => run(initialCcState(), { type: "connect" }, { type: "select" });

test("at first only installing is available, and every other operation says why", () => {
  const options = operationOptions(initialCcState().tv);
  assert.deepEqual(
    options.map((option) => ("plan" in option ? "available" : option.reason)),
    ["available", "Install Oriel first.", "Install Oriel first, so the TV always has a home screen.", "The built-in home screen is already on."],
  );
});

test("nothing runs until the operation is reviewed and confirmed", () => {
  let state = run(ready(), { type: "run" });
  assert.equal(state.running, null);
  state = run(state, { type: "review", id: "install" }, { type: "run" });
  assert.equal(state.running, null);
  state = run(state, { type: "confirm", value: true }, { type: "run" });
  assert.deepEqual(state.running, { id: "install", completed: 0 });
});

test("unavailable operations can't be reviewed", () => {
  const state = run(ready(), { type: "review", id: "turnOff" });
  assert.equal(state.review, null);
});

test("a finished install updates the TV, records history, and unlocks the next steps", () => {
  const state = run(ready(), { type: "review", id: "install" }, { type: "confirm", value: true }, { type: "run" }, { type: "tick" });
  assert.equal(state.tv.orielInstalled, true);
  assert.equal(state.result?.title, "Install or update Oriel");
  assert.deepEqual(state.history, [{ operation: "Install or update Oriel", outcome: "Succeeded" }]);
  assert.ok(operationOptions(state.tv).filter((option) => "plan" in option).length >= 3);
});

test("turning the built-in home screen off and on again round-trips", () => {
  const confirmAndRun = (id: "install" | "turnOff" | "turnOn"): CcAction[] => [
    { type: "review", id },
    { type: "confirm", value: true },
    { type: "run" },
    { type: "tick" },
  ];
  let state = run(ready(), ...confirmAndRun("install"), ...confirmAndRun("turnOff"));
  assert.equal(state.tv.builtInOff, true);
  assert.equal(state.tv.orielIsHome, true);
  state = run(state, ...confirmAndRun("turnOn"));
  assert.equal(state.tv.builtInOff, false);
  assert.equal(state.history.length, 3);
});

test("the device report leaves out the TV's address", () => {
  const report = deviceReport(initialCcState().tv);
  assert.ok(report.includes("Platform: Google TV"));
  assert.ok(!report.includes(DEMO_TV.address));
  assert.ok(!report.includes("192.168"));
});
