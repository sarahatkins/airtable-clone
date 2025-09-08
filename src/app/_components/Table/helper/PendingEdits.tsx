import type { CellNoId } from "~/app/defaults";

const pendingEdits = new Map<number, CellNoId[]>();

// key: tempRowId (-1), value: array of edits
export function addPendingRowEdit(edit: CellNoId) {
  const key = edit.rowId;
  if (!pendingEdits.has(key)) {
    pendingEdits.set(key, []);
  }
  pendingEdits.get(key)!.push(edit);
}

export function getPendingEditsForRow() {
  return [...pendingEdits.entries()]
    .filter(([id]) => id < 0)
    .flatMap(([_, edits]) => edits);
}

export function clearPendingEditsForRow(tempId: number) {
  pendingEdits.delete(tempId);
}

// pendingEdits.ts
const pendingColEdits = new Map<number, CellNoId[]>();

export function addPendingColEdit(edit: CellNoId) {
  const key = edit.columnId;
  if (!pendingColEdits.has(key)) {
    pendingColEdits.set(key, []);
  }
  pendingColEdits.get(key)!.push(edit);
}

export function getPendingColEditsForCol() {
  return [...pendingColEdits.entries()]
    .filter(([id]) => id < 0)
    .flatMap(([_, edits]) => edits);
}

export function clearPendingColEditsForCol(tempId: number) {
  pendingColEdits.delete(tempId);
}
