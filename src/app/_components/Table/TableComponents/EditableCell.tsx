import { useEffect, useState } from "react";

const EditableCell: React.FC<any> = ({ getValue, row, column, table }) => {
  const initialValue = getValue() ?? ""; // ensure not undefined
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  useEffect(() => {
    setValue(initialValue ?? "");
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
