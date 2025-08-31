const pendingEdits = new Map<number, any[]>(); 
// key: tempRowId (-1), value: array of edits

export function addPendingRowEdit(edit: any) {
  const key = edit.rowIndex; // or use row.id if stable
  if (!pendingEdits.has(key)) {
    pendingEdits.set(key, []);
  }
  pendingEdits.get(key)!.push(edit);
}

export function getPendingEditsForRow(tempId: number) {
  return pendingEdits.get(tempId) || [];
}

export function clearPendingEditsForRow(tempId: number) {
  pendingEdits.delete(tempId);
}

// pendingEdits.ts
const pendingColEdits = new Map<number, any[]>();

export function addPendingColEdit(edit:  {
  tableId: number;
  rowId: number;
  columnId: number;
  value: any;
}) {
  const key = edit.columnId; // temporary colId (-1)
  if (!pendingColEdits.has(key)) {
    pendingColEdits.set(key, []);
  }
  pendingColEdits.get(key)!.push(edit);
  console.log(pendingColEdits)
}

export function getPendingColEditsForCol(tempId: number) {
  return pendingColEdits.get(tempId) || [];
}

export function clearPendingColEditsForCol(tempId: number) {
  pendingColEdits.delete(tempId);
}

