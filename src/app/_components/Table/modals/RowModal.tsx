import React, { useEffect, useRef, type Dispatch } from "react";
import { api } from "~/trpc/react";
import type { NormalizedRow } from "../DataGrid";

interface RowModalProps {
  x: number;
  y: number;
  rowId: number;
  isOpen: boolean;
  onClose: () => void;
  setRows: Dispatch<React.SetStateAction<NormalizedRow[]>>;
  selectedRows: number[];
  setRowSelection: Dispatch<React.SetStateAction<number[]>>;
}

const RowModal: React.FC<RowModalProps> = ({
  x,
  y,
  rowId,
  isOpen,
  onClose,
  setRows,
  selectedRows,
  setRowSelection,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const deleteRows = api.table.deleteRows.useMutation({
    onSuccess: async () => {
      console.log("deleted rows");
    },
  });
  const handleDelete = () => {
    console.log("handling..", selectedRows, rowId);
    setRows((prev) => prev.filter((r) => r.id != rowId));
    setRowSelection((prev) => prev.filter((id) => id != rowId));
    deleteRows.mutate({ rowIds: selectedRows });
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      ref={modalRef}
      // onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 w-48 rounded-md border border-gray-200 bg-white"
      style={{ top: y, left: x }}
    >
      <ul className="text-sm text-gray-700">
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          ↑ Insert record above
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          ↓ Insert record below
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Duplicate record
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Apply template
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Expand record
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Run field agent
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Add comment
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Copy record URL
        </li>
        <li className="cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
          Send record
        </li>
        <li
          className="cursor-pointer px-4 py-2 text-red-600 hover:bg-red-100"
          onClick={() => handleDelete()}
        >
          Delete selected record(s)
        </li>
      </ul>
    </div>
  );
};

export default RowModal;
