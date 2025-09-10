import React, { type Dispatch, type SetStateAction } from "react";
import type { Row } from "@tanstack/react-table";
import type { NormalizedRow } from "../DataGrid";

interface IndexCellProps {
  row: Row<NormalizedRow>;
  hoveredRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
  setSelectedRows: Dispatch<SetStateAction<number[]>>;
  selectedRows: number[];
}

const IndexCell: React.FC<IndexCellProps> = ({
  row,
  hoveredRowId,
  setHoveredRowId,
  setSelectedRows,
  selectedRows,
}) => {
  const isSelected = selectedRows.includes(row.original.id);
  const isHovered = hoveredRowId === row.id.toString();

  const showCheckbox = isSelected || isHovered;

  return (
    <div
      key={row.id}
      className="flex items-center ml-3 text-xs text-gray-600"
      onMouseEnter={() => setHoveredRowId(row.id.toString())}
      onMouseLeave={() => setHoveredRowId(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedRows((prev) => [...prev, row.original.id]);
      }}
    >
      {showCheckbox ? (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            setSelectedRows((prev) =>
              e.target.checked
                ? [...prev, row.original.id]
                : prev.filter((id) => id !== row.original.id),
            );
          }}
        />
      ) : (
        <div className="select-none">{row.index + 1}</div>
      )}
    </div>
  );
};

export default IndexCell;
