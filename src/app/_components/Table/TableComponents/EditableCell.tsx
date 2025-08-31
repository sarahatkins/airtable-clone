import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { addPendingEdit } from "./PendingEdits";

interface EditableCellProps {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
}

const EditableCell: React.FC<EditableCellProps> = ({
  getValue,
  row,
  column,
  table,
}) => {
  const utils = api.useUtils();
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      utils.table.getRowsByTable.invalidate({ tableId: row.original.tableId });
    },
  });

  const initialValue = getValue() ?? "";
  const [value, setValue] = useState(initialValue);

  // Sync external value changes
  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);

    if (value !== initialValue) {
      const rowId = row.original.id;
      const colId = column.columnDef.meta?.col.id;

      // If still -1, store as pending
      if (rowId === -1 || colId === -1) {
        addPendingEdit({
          tableId: row.original.tableId,
          rowIndex: row.index,
          columnId: colId,
          value,
        });
        return;
      }
      console.log(rowId, colId)

      // Otherwise save immediately
      setCellValue({
        tableId: row.original.tableId,
        rowId,
        columnId: colId,
        value,
      });
    }
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-[85%] truncate rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
    />
  );
};

export default EditableCell;
