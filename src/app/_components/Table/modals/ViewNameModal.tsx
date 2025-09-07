import React, { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Mail, Plus } from "lucide-react";
import { api } from "~/trpc/react";

interface ViewNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  isNewView: boolean;
  currentName: string;
  viewId?: number;
  setButtonName?: Dispatch<SetStateAction<string>>
}

const ViewNameModal: React.FC<ViewNameModalProps> = ({
  currentName,
  isOpen,
  onClose,
  tableId,
  isNewView,
  viewId,
  setButtonName
}) => {
  const utils = api.useUtils();
  const [name, setName] = useState(currentName);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const renameView = api.table.renameView.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed view", renamed);
      onClose();
    },
  });
  
  const createView = api.table.createView.useMutation({
    onSuccess: async (newView) => {
      if (!newView) return;
      console.log("Created view", newView);
      await utils.table.getViewByTable.invalidate({ tableId: newView.tableId });
    },
  });
  
  const handleModificationClick = async () => {
    if (!name.trim()) return;
    if (isNewView) {
      createView.mutate({ tableId, name });
    }
    if (!isNewView && viewId){
      renameView.mutate({ viewId, newName: name });
      setButtonName && setButtonName(name)
    }
    
    onClose();
  };
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded border border-blue-500 px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

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
          onClick={() => handleModificationClick()}
          className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ViewNameModal;
