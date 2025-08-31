const pendingEdits = new Map<number, any[]>(); 
// key: tempRowId (-1), value: array of edits

export function addPendingEdit(edit: any) {
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
