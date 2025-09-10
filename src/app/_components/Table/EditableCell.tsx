import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "~/trpc/react";
import { addPendingColEdit, addPendingRowEdit } from "./helper/PendingEdits";
import type { CellContext } from "@tanstack/react-table";
import type { CellValue, ColType } from "~/app/defaults";
import type { CellCoord, NormalizedRow } from "./DataGrid";

export interface TableMeta {
  updateData: (rowIndex: number, columnId: string, value: CellValue) => void;
}

interface ColMeta {
  col: ColType;
  colIndex: number;
}

const EditableCell = (ctx: CellContext<NormalizedRow, CellValue>) => {
  const { getValue, row, column, table } = ctx;
  const initialValue = getValue() ?? "";
  const [value, setValue] = useState<CellValue>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const columnIndex = (column.columnDef.meta as ColMeta)?.colIndex ?? 0;

  const focusedCell = (
    table.options.meta as TableMeta & {
      focusedCell: CellCoord | null;
      setFocusedCell: (coord: CellCoord) => void;
    }
  ).focusedCell;

  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("Cell saved successfully");
    },
  });

  // Sync external changes
  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const saveToDB = useCallback(
    (val: CellValue) => {
      const rowId = row.original.id;
      const linkedCol = column.columnDef.meta as ColMeta;
      const colId = linkedCol.col.id;

      // New row/column, store in pending
      if (rowId < 0) {
        addPendingRowEdit({
          tableId: row.original.tableId,
          rowId,
          columnId: colId,
          value: val,
          type: linkedCol.col.type,
        });
        return;
      }

      if (colId < 0) {
        addPendingColEdit({
          tableId: row.original.tableId,
          rowId,
          columnId: colId,
          value: val,
          type: linkedCol.col.type,
        });
        return;
      }

      // Otherwise save immediately
      setCellValue({
        tableId: row.original.tableId,
        rowId,
        columnId: colId,
        value: val ? val.toString() : "",
        type: linkedCol.col.type,
      });
    },
    [row.original, column.columnDef.meta, setCellValue],
  );

  const onBlur = () => {
    (table.options.meta as TableMeta).updateData(row.index, column.id, value);

    if (value !== initialValue) saveToDB(value);
  };

  useEffect(() => {
    if (focusedCell?.row === row.index && focusedCell?.col === columnIndex) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [focusedCell, row.index, columnIndex]);

  const onClick = () => {
    (
      table.options.meta as TableMeta & {
        setFocusedCell: (coord: CellCoord) => void;
      }
    ).setFocusedCell({ row: row.index, col: columnIndex });
  };

  return (
    <input
      ref={inputRef}
      type={
        (column.columnDef.meta as ColMeta)?.col?.type ===
        "number"
          ? "number"
          : "text"
      }
      value={value ? value.toString() : ""}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onBlur={onBlur}
      className="h-6.75 w-full cursor-default border border-transparent bg-transparent p-0.75 text-sm text-gray-900 focus:border-blue-500 focus:ring-5 focus:ring-blue-500 focus:outline-none"
    />
  );
};

export default EditableCell;
