import assert from "node:assert/strict";
import { test } from "node:test";
import { moveFocus, normalizeFocus, type FocusRow } from "./focus.ts";

const rows: FocusRow[] = [
  { id: "top", size: 2, remember: true },
  { id: "dock", size: 5, remember: true },
  { id: "grid-0", size: 6 },
  { id: "grid-1", size: 4 },
];

test("left and right stop at the edges of a row", () => {
  const atStart = moveFocus(rows, { rowId: "dock", index: 0 }, "left");
  assert.deepEqual(atStart.focus, { rowId: "dock", index: 0 });
  assert.equal(atStart.moved, false);

  const atEnd = moveFocus(rows, { rowId: "dock", index: 4 }, "right");
  assert.deepEqual(atEnd.focus, { rowId: "dock", index: 4 });
  assert.equal(atEnd.moved, false);

  assert.deepEqual(moveFocus(rows, { rowId: "dock", index: 1 }, "right").focus, { rowId: "dock", index: 2 });
});

test("up and down keep the column and clamp to shorter rows", () => {
  assert.deepEqual(moveFocus(rows, { rowId: "grid-0", index: 3 }, "down").focus, { rowId: "grid-1", index: 3 });
  assert.deepEqual(moveFocus(rows, { rowId: "grid-0", index: 5 }, "down").focus, { rowId: "grid-1", index: 3 });
  assert.deepEqual(moveFocus(rows, { rowId: "dock", index: 4 }, "up").focus, { rowId: "top", index: 1 });
});

test("moving past the first or last row does nothing", () => {
  const up = moveFocus(rows, { rowId: "top", index: 0 }, "up");
  assert.equal(up.moved, false);
  assert.deepEqual(up.focus, { rowId: "top", index: 0 });
  assert.equal(moveFocus(rows, { rowId: "grid-1", index: 0 }, "down").moved, false);
});

test("remembered rows restore the item focused when focus left them", () => {
  const memory = { dock: 3 };
  assert.deepEqual(moveFocus(rows, { rowId: "top", index: 0 }, "down", memory).focus, { rowId: "dock", index: 3 });
  // Grid rows keep column alignment instead.
  assert.deepEqual(moveFocus(rows, { rowId: "grid-1", index: 1 }, "up", { "grid-0": 5 }).focus, {
    rowId: "grid-0",
    index: 1,
  });
});

test("a vertical move reports where focus left from", () => {
  const result = moveFocus(rows, { rowId: "dock", index: 2 }, "down");
  assert.deepEqual(result.left, { rowId: "dock", index: 2 });
});

test("empty rows are skipped", () => {
  const withEmptyDock: FocusRow[] = [rows[0], { id: "dock", size: 0 }, rows[2]];
  assert.deepEqual(moveFocus(withEmptyDock, { rowId: "top", index: 0 }, "down").focus, { rowId: "grid-0", index: 0 });
});

test("normalizeFocus recovers when a row disappears or shrinks", () => {
  const withEmptyDock: FocusRow[] = [rows[0], { id: "dock", size: 0 }, rows[2]];
  assert.deepEqual(normalizeFocus(withEmptyDock, { rowId: "dock", index: 2 }), { rowId: "grid-0", index: 2 });
  assert.deepEqual(normalizeFocus(rows, { rowId: "grid-1", index: 9 }), { rowId: "grid-1", index: 3 });
  assert.deepEqual(normalizeFocus(rows, { rowId: "missing", index: 1 }), { rowId: "top", index: 0 });
});
