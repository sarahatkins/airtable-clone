import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface EditableCellProps {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
}

const EditableCell: React.FC<EditableCellProps> = ({ getValue, row, column, table }) => {
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
      setCellValue({
        tableId: row.original.tableId,
        rowId: row.original.id,
        columnId: column.columnDef.meta?.col.id,
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
