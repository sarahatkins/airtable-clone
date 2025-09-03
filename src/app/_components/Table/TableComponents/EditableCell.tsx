import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { addPendingColEdit, addPendingRowEdit } from "../helper/PendingEdits";

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
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("New cell created");
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
      if (rowId === -1) {
        addPendingRowEdit({
          tableId: row.original.tableId,
          rowIndex: rowId,
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
      console.log("ROW", row);
      console.log("TABLE", table);
      console.log("COL", column)
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
      className="w-full cursor-default border border-transparent bg-transparent px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-5 focus:ring-blue-500 focus:outline-none"
    />
  );
};

export default EditableCell;
