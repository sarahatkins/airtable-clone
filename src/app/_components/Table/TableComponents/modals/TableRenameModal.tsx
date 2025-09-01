import React, { useEffect, useRef, useState } from "react";
import MenuItem from "./MenuItem";
import {
  Calendar,
  Copy,
  EyeOff,
  Info,
  Mail,
  Pencil,
  Plus,
  Settings,
  Trash,
  Upload,
  X,
} from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  onClose: any;
  tableId: number;
  currentName: string;
}

const TableRenameModal: React.FC<RenameModalProps> = ({
  currentName,
  isOpen,
  onClose,
  tableId,
}) => {
  const [tableName, setTableName] = useState(currentName);
  const [recordLabel, setRecordLabel] = useState("Record");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<any>(null);
  // Close on outside click
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-3.5 shadow-lg"
    >
      {/* Table Name Input */}
      <input
        ref={inputRef}
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        className="mb-4 w-full rounded border border-blue-500 px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      {/* Record Label Select */}
      <label className="mb-1 block text-sm text-gray-700">
        What should each record be called?
      </label>
      <select
        value={recordLabel}
        onChange={(e) => setRecordLabel(e.target.value)}
        className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      >
        <option value="Record">Record</option>
        <option value="Item">Item</option>
        <option value="Entry">Entry</option>
        <option value="Task">Task</option>
      </select>

      {/* Examples row */}
      <div className="mt-2 mb-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add record
        </div>
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          Send records
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 text-sm">
        <button
          onClick={onClose}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => console.log("clicked")}
          className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default TableRenameModal;
