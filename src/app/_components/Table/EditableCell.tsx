import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { addPendingColEdit, addPendingRowEdit } from "./helper/PendingEdits";
import type { CellContext } from "@tanstack/react-table";
import type { CellValue, ColType } from "~/app/defaults";
import type { NormalizedRow } from "./DataGrid";
export interface TableMeta {
  updateData: (rowIndex: number, columnId: string, value: CellValue) => void;
}

interface ColMeta {
  col: ColType;
}
const EditableCell = (
  ctx: CellContext<NormalizedRow, CellValue>,
) => {
  const {getValue, row, column, table} = ctx;
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("New cell created");
    },
  });

  const initialValue: CellValue = getValue() ?? "";
  const [value, setValue] = useState<CellValue>(initialValue);

  // Sync external value changes
  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const onBlur = () => {
    (table.options.meta as TableMeta).updateData(row.index, column.id, value);

    if (value !== initialValue) {
      const rowId = row.original.id;
      const colId = (column.columnDef.meta as ColMeta).col.id;

      // If still -1, store as pending
      if (rowId === -1) {
        addPendingRowEdit({
          tableId: row.original.tableId,
          rowId,
          columnId: colId,
          value,
        });
        return;
      }
      if (colId === -1) {
        addPendingColEdit({
          tableId: row.original.tableId,
          rowId: rowId,
          columnId: colId,
          value,
        });

        return;
      }
      
      const stringifiedVal = value ? value.toString() : ""
      
      // Otherwise save immediately
      setCellValue({
        tableId: row.original.tableId,
        rowId,
        columnId: colId,
        value: stringifiedVal,
      });
    }
  };

  return (
    <input
      value={value ? value.toString() : ""}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full cursor-default border border-transparent bg-transparent px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-5 focus:ring-blue-500 focus:outline-none"
    />
  );
};

export default EditableCell;
