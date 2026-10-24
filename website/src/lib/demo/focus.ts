// Remote-control focus movement for the launcher demo (PRD section 6.3).
// Rows are horizontal; Left and Right move within a row and stop at its edges, Up and Down move between
// rows. Rows marked `remember` return to the item that was focused when focus last left them.

export type Direction = "up" | "down" | "left" | "right";

export interface FocusRow {
  id: string;
  size: number;
  /** Return to the last focused item when focus comes back to this row. */
  remember?: boolean;
}

export interface Focus {
  rowId: string;
  index: number;
}

export interface MoveResult {
  focus: Focus;
  /** False when the move hit an edge, so the UI can show a gentle "can't go further" cue. */
  moved: boolean;
  /** The row focus left, and where, when the move changed rows. */
  left?: Focus;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Puts focus on a real item after rows change, such as when the last favorite is removed. */
export function normalizeFocus(rows: readonly FocusRow[], focus: Focus): Focus {
  const usable = rows.filter((row) => row.size > 0);
  if (usable.length === 0) return focus;

  const current = usable.find((row) => row.id === focus.rowId);
  if (current) return { rowId: current.id, index: clamp(focus.index, 0, current.size - 1) };

  // The row is gone or empty: move to the next usable row in the original order, else the previous one.
  const position = rows.findIndex((row) => row.id === focus.rowId);
  if (position !== -1) {
    const after = rows.slice(position + 1).find((row) => row.size > 0);
    const before = rows
      .slice(0, position)
      .reverse()
      .find((row) => row.size > 0);
    const target = after ?? before;
    if (target) return { rowId: target.id, index: clamp(focus.index, 0, target.size - 1) };
  }
  return { rowId: usable[0].id, index: 0 };
}

export function moveFocus(
  rows: readonly FocusRow[],
  focus: Focus,
  direction: Direction,
  memory: Readonly<Record<string, number>> = {},
): MoveResult {
  const usable = rows.filter((row) => row.size > 0);
  if (usable.length === 0) return { focus, moved: false };

  const start = normalizeFocus(rows, focus);
  const rowIndex = usable.findIndex((row) => row.id === start.rowId);
  const row = usable[rowIndex];

  if (direction === "left" || direction === "right") {
    const step = direction === "left" ? -1 : 1;
    const index = clamp(start.index + step, 0, row.size - 1);
    return { focus: { rowId: row.id, index }, moved: index !== start.index };
  }

  const targetIndex = rowIndex + (direction === "up" ? -1 : 1);
  if (targetIndex < 0 || targetIndex >= usable.length) return { focus: start, moved: false };

  const target = usable[targetIndex];
  const remembered = target.remember ? memory[target.id] : undefined;
  const index = clamp(remembered ?? start.index, 0, target.size - 1);
  return { focus: { rowId: target.id, index }, moved: true, left: start };
}
