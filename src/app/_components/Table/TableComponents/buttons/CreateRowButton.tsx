import React, { type Dispatch, type SetStateAction } from "react";
import {
  DEFAULT_PENDING_KEY,
  type ColType,
  type RowType,
  type TableType,
} from "~/app/defaults";
import { api } from "~/trpc/react";
import {
  clearPendingEditsForRow,
  getPendingEditsForRow,
} from "../../helper/PendingEdits";

interface ColButtonProps {
  dbTable: TableType;
  cols: ColType[];
  setRows: Dispatch<SetStateAction<RowType[]>>;
}

const CreateRowButton: React.FC<ColButtonProps> = ({
  cols,
  dbTable,
  setRows,
}) => {
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("New cell created!")
    },
  });

  const createRowMutation = api.table.createRow.useMutation({
    onSuccess: (newRow) => {
      if (!newRow) return;
      setRows((prev) =>
        prev.map((row) =>
          row.id === DEFAULT_PENDING_KEY ? { ...row, id: newRow.id } : row,
        ),
      );

      // Check for any pending edits on this row
      const pending = getPendingEditsForRow(DEFAULT_PENDING_KEY);
      pending.forEach((edit) => {
        setCellValue({
          tableId: edit.tableId,
          rowId: newRow.id,
          columnId: edit.columnId,
          value: edit.value,
        });
      });

      clearPendingEditsForRow(DEFAULT_PENDING_KEY);
    },
  });

  const addNewRow = () => {
    const newRow: RowType = {
      id: DEFAULT_PENDING_KEY,
      tableId: dbTable.id,
      createdAt: new Date(),
      ...cols.reduce((acc, col) => ({ ...acc, [col.name]: "" }), {}),
    };

    // Update frontend state
    setRows((prev) => [...prev, newRow]);

    // Persist to backend
    createRowMutation.mutate({ tableId: dbTable.id });
  };

  return (
    <>
      <button
        onClick={addNewRow}
        className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
      >
        + Add Row
      </button>
    </>
  );
};

export default CreateRowButton;
