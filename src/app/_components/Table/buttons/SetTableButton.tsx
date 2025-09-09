import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Pencil,
  EyeOff,
  Settings,
  Copy,
  Calendar,
  Info,
  Lock,
  Trash,
  X,
  Upload,
} from "lucide-react";
import MenuItem from "../modals/MenuItem";
import TableRenameModal from "../modals/TableRenameModal";
import { api } from "~/trpc/react";
interface ButtonProps {
  setSelectedTable: () => void;
  name: string;
  tableId: number;
  selected: boolean;
  baseId: string;
  showRename?: boolean;
}

const SetTableButton: React.FC<ButtonProps> = ({
  name,
  tableId,
  baseId,
  showRename = false,
  selected,
  setSelectedTable,
}) => {
  const utils = api.useUtils();
  const [tableName, setTableName] = useState<string>(name ?? "");
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(showRename);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const deleteTable = api.table.deleteTable.useMutation({
    onSuccess: async (deleted) => {
      console.log("table delete", deleted);
      await utils.table.getTablesByBase.invalidate({ baseId });
      setShowEditModal(false);
    },
  });

  const handleDelete = () => {
    if (!selected) deleteTable.mutate({ tableId });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowEditModal(false);
        setShowRenameModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="scrollbar-hidden overflow-x-auto max-w-[75vw] ml-[-1] flex h-full items-center hover:bg-gray-100"
      onContextMenu={(e) => {
        e.preventDefault();
        setShowEditModal(true);
      }}
    >
      <button
        className={`flex ${selected ? "h-[33px] w-fit border-b-0" : "h-5 w-fit border-r border-gray-200"} cursor-pointer items-center rounded-t-sm border px-3 py-1.5 text-xs text-gray-900 transition-colors duration-150 ${
          selected
            ? "z-50 border-t border-r border-gray-200 bg-white"
            : "border border-transparent"
        }`}
        onClick={setSelectedTable}
      >
        {tableName}
        {selected && <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />}
      </button>

      {showEditModal && (
        <div
          ref={modalRef}
          className="absolute top-[100] z-50 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          {/* Header */}
          <ul className="text-sm text-gray-700">
            <MenuItem
              icon={<Upload className="h-4 w-4" />}
              label="Import data"
            />
            <li className="my-1 border-t border-gray-200" />
            <MenuItem
              icon={<Pencil className="h-4 w-4" />}
              label="Rename table"
              onClick={() => {
                setShowRenameModal(true);
                setShowEditModal(false);
              }}
            />
            <MenuItem
              icon={<EyeOff className="h-4 w-4" />}
              label="Hide table"
            />
            <MenuItem
              icon={<Settings className="h-4 w-4" />}
              label="Manage fields"
            />
            <MenuItem
              icon={<Copy className="h-4 w-4" />}
              label="Duplicate table"
            />
            <li className="my-1 border-t border-gray-200" />
            <MenuItem
              icon={<Calendar className="h-4 w-4" />}
              label="Configure date dependencies"
            />
            <li className="my-1 border-t border-gray-200" />
            <MenuItem
              icon={<Info className="h-4 w-4" />}
              label="Edit table description"
            />
            <MenuItem
              icon={<Lock className="h-4 w-4" />}
              label="Edit table permissions"
            />
            <li className="my-1 border-t border-gray-200" />
            <MenuItem icon={<X className="h-4 w-4" />} label="Clear data" />
            {!selected && (
              <MenuItem
                icon={<Trash className="h-4 w-4 text-red-600" />}
                label="Delete table"
                textColor="text-red-600"
                onClick={() => handleDelete()}
              />
            )}
          </ul>
        </div>
      )}

      <TableRenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentName={name}
        tableId={tableId}
        setGivenTableName={setTableName}
      />
    </div>
  );
};

export default SetTableButton;
