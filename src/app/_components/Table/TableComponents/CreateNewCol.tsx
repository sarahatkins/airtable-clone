import React, { useState, type Dispatch, type SetStateAction } from "react";
import {
  STATUS,
  type ColType,
  type RowType,
  type TableType,
} from "~/app/defaults";
import { api } from "~/trpc/react";
import {
  clearPendingColEditsForCol,
  getPendingColEditsForCol,
} from "./PendingEdits";

interface ColButtonProps {
  dbTable: TableType;
  setCols: Dispatch<SetStateAction<ColType[]>>;
  // setRows: Dispatch<SetStateAction<RowType[]>>;
}

const CreateNewColButton: React.FC<ColButtonProps> = ({ dbTable, setCols }) => {
  const utils = api.useUtils();
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnType, setNewColumnType] = useState<STATUS | null>();
  const [newColumnName, setNewColumnName] = useState("");
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      utils.table.getRowsByTable.invalidate({ tableId: dbTable.id });
    },
  });
  const createColMutation = api.table.createColumn.useMutation({
    onSuccess: (newCol) => {
      if(!newCol) return;
      console.log("Created new column", newCol);

      // Replace temp col (-1) with real one
      setCols((prev: ColType[]) =>
        prev.map((col) => (col.id === -1 ? { ...col, id: newCol.id } : col)),
      );

      // 🔁 Replay pending edits for that column
      const pending = getPendingColEditsForCol(-1);
      console.log(pending)
      pending.forEach((edit) => {
        setCellValue({
          tableId: edit.tableId,
          rowId: edit.rowId,
          columnId: newCol.id, // now the real colId
          value: edit.value,
        });
      });
      clearPendingColEditsForCol(-1);
    },
  });

  const openAddColumn = () => setIsAddColumnOpen(true);
  const closeAddColumn = () => {
    setIsAddColumnOpen(false);
    setNewColumnType(null);
    setNewColumnName("");
  };

  const handleAddNewColumn = () => {
    if (!newColumnName.trim() || !newColumnType) return;

    const newCol: ColType = {
      id: -1,
      name: newColumnName,
      type: newColumnType!,
      tableId: dbTable.id,
      orderIndex: 0,
      primary: false,
    };

    // Add column optimistically
    setCols((prev: ColType[]) => [...prev, newCol]);

    closeAddColumn();

    // Ask backend to create it
    createColMutation.mutate({
      tableId: dbTable.id,
      name: newColumnName,
      type: newColumnType,
    });
  };

  return (
    <>
      <button
        onClick={openAddColumn}
        className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
      >
        + Add field
      </button>
      {isAddColumnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded bg-white p-4">
            {!newColumnType ? (
              <>
                <h3 className="mb-2 font-semibold">Select field type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(STATUS) as STATUS[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewColumnType(type)}
                      className="rounded border p-2 hover:bg-gray-100"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 font-semibold">Enter field name</h3>
                <input
                  className="mb-2 w-full rounded border p-2"
                  placeholder="Field name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeAddColumn}
                    className="rounded border px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewColumn}
                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  >
                    Create field
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewColButton;
