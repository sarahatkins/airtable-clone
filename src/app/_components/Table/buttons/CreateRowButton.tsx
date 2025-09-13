import React, { type Dispatch, type SetStateAction } from "react";
import { DEFAULT_PENDING_KEY, type TableType } from "~/app/defaults";
import { api } from "~/trpc/react";
import {
  clearPendingEditsForRow,
  getPendingEditsForRow,
} from "../helper/PendingEdits";
import type { NormalizedRow } from "../DataGrid";
import { Plus } from "lucide-react";

interface ColButtonProps {
  style?: string;
  dbTable: TableType;
  setRows: Dispatch<SetStateAction<NormalizedRow[]>>;
}

const CreateRowButton: React.FC<ColButtonProps> = ({
  style,
  dbTable,
  setRows,
}) => {
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("New cell created!");
    },
  });

  const createRowMutation = api.table.createRow.useMutation({
    onSuccess: (newRow) => {
      if (!newRow) return;

      // normalize row
      setRows((prev) =>
        prev.map((row) => (row.id < 0 ? { ...row, id: newRow.id } : row)),
      );

      // Check for any pending edits on this row
      const pending = getPendingEditsForRow();
      pending.forEach((edit) => {
        setCellValue({
          tableId: edit.tableId ?? 0,
          rowId: newRow.id,
          columnId: edit.columnId,
          value: edit.value as string,
          type: edit.type,
        });
        clearPendingEditsForRow(edit.rowId);
      });
    },
  });

  const addNewRow = () => {
    // Update frontend state
    const normalizedRow: NormalizedRow = {
      id: DEFAULT_PENDING_KEY(),
      tableId: dbTable.id,
    };
    setRows((prev) => [...prev, normalizedRow]);

    // Persist to backend
    createRowMutation.mutate({ tableId: dbTable.id });
  };

  return (
    <>
      <button
        onClick={addNewRow}
        className={
          style ??
          `cursor-pointer text-gray w-full border-r border-b border-gray-200 bg-white px-1.5 py-2 text-start hover:bg-neutral-50`
        }
      >
        <Plus height={15} />
      </button>
    </>
  );
};

export default CreateRowButton;
