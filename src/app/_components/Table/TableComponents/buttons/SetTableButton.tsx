import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

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
interface ButtonProps {
  tableId: number;
  setSelectedTable: () => void;
  name: string;
  showRename?: boolean;
}

const SetTableButton: React.FC<ButtonProps> = ({
  tableId,
  name,
  setSelectedTable,
  showRename = false,
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(showRename);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowEditModal(false);
        setShowRenameModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div onClick={setSelectedTable}>
      <button className="cursor-pointer flex items-center rounded px-2 py-1 font-semibold text-gray-900 hover:bg-gray-100">
        {name}
        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
      </button>
      {showEditModal && (
        <div
          ref={modalRef}
          className="absolute z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
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
            <MenuItem
              icon={<Trash className="h-4 w-4 text-red-600" />}
              label="Delete table"
              textColor="text-red-600"
            />
          </ul>
        </div>
      )}

      <TableRenameModal
        tableId={tableId}
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentName={name}
      />
    </div>
  );
};

export default SetTableButton;
