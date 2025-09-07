import React, { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Row } from "@tanstack/react-table";
import type { NormalizedRow } from "../DataGrid";

interface IndexCellProps {
  row: Row<NormalizedRow>;
  hoveredRowId: string | null;
  rightClickedRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
  setRightClickedRowId: Dispatch<SetStateAction<string | null>>;
  setSelectedRows: Dispatch<SetStateAction<number[]>>;
}

const IndexCell: React.FC<IndexCellProps> = ({
  row,
  hoveredRowId,
  rightClickedRowId,
  setHoveredRowId,
  setRightClickedRowId,
  setSelectedRows,
}) => {
  const isSelected = row.getIsSelected();
  const isHovered = hoveredRowId === row.id.toString();
  const isRightClicked = rightClickedRowId === row.id.toString();

  const showCheckbox = isSelected || isHovered || isRightClicked;
  useEffect(() => {
    setSelectedRows((prev) => {
      const isAlreadySelected = prev.includes(row.original.id);

      if (isSelected && !isAlreadySelected) {
        // Add the id only if it's not already selected
        return [...prev, row.original.id];
      }

      if (!isSelected && isAlreadySelected) {
        // Remove the id only if it was selected before
        return prev.filter((id) => id !== row.original.id);
      }

      // No changes needed
      return prev;
    });
  }, [isSelected, row.original.id, setSelectedRows]);
  return (
    <div
      key={row.id}
      className="flex items-center justify-center"
      onMouseEnter={() => setHoveredRowId(row.id.toString())}
      onMouseLeave={() => setHoveredRowId(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setRightClickedRowId(row.id.toString());
      }}
    >
      {showCheckbox ? (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="select-none">{row.index + 1}</div>
      )}
    </div>
  );
};

export default IndexCell;
