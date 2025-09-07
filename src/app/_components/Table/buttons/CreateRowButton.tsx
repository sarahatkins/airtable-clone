import React, { type Dispatch, type SetStateAction } from "react";
import {
  DEFAULT_PENDING_KEY,
  type TableType,
} from "~/app/defaults";
import { api } from "~/trpc/react";
import {
  clearPendingEditsForRow,
  getPendingEditsForRow,
} from "../helper/PendingEdits";
import type { NormalizedRow } from "../DataGrid";
import { Plus } from "lucide-react";

interface ColButtonProps {
  dbTable: TableType;
  setRows: Dispatch<SetStateAction<NormalizedRow[]>>;
}

const CreateRowButton: React.FC<ColButtonProps> = ({
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

      // normalize row
      setRows((prev) =>
        prev.map((row) =>
          row.id === DEFAULT_PENDING_KEY ? { ...row, id: newRow.id } : row,
        ),
      );

      // Check for any pending edits on this row
      const pending = getPendingEditsForRow(DEFAULT_PENDING_KEY);
      pending.forEach((edit) => {
        setCellValue({
          tableId: edit.tableId ?? 0,
          rowId: newRow.id,
          columnId: edit.columnId,
          value: edit.value as string,
        });
      });

      clearPendingEditsForRow(DEFAULT_PENDING_KEY);
    },
  });

  const addNewRow = () => {
    // Update frontend state
    const normalizedRow: NormalizedRow = {
      id: DEFAULT_PENDING_KEY,
      tableId: dbTable.id,
    }
    setRows((prev) => [...prev, normalizedRow]);

    // Persist to backend
    createRowMutation.mutate({ tableId: dbTable.id });
  };

  return (
    <>
      <button
        onClick={addNewRow}
        className="text-start w-full bg-white px-4.5 py-2 border-b border-r border-gray-200 text-gray hover:bg-neutral-50"
      >
        <Plus height={15}/>
      </button>
    </>
  );
};

export default CreateRowButton;
