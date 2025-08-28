import type { Column, Row, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const EditableCell: React.FC<any> = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  // When the input is blurred, update the table data
  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  // Sync external value changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-[85%] truncate rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
};

export default EditableCell;
