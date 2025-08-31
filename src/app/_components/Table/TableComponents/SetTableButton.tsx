import type { Table } from "drizzle-orm";
import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface ButtonProps {
  setSelectedTable: any;
  name: string;
  showRename?: boolean;
}

const SetTableButton: React.FC<ButtonProps> = ({
  name,
  setSelectedTable,
  showRename = false,
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(showRename);
  const modalRef = useRef<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEditModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleContextMenu = (event: any) => {
    event.preventDefault(); // prevent browser context menu
    setPosition({ x: event.clientX, y: event.clientY });
    setShowEditModal(true);
  };

  return (
    <div onContextMenu={handleContextMenu} onClick={setSelectedTable}>
      <button className="flex items-center rounded px-2 py-1 font-semibold text-gray-900 hover:bg-gray-100">
        {name}
        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
      </button>
      {showEditModal && (
        <div
          ref={modalRef}
          className="absolute z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          {/* Header */}
          <div className="mb-2 border-b pb-2">
            <p className="text-sm font-medium text-gray-500">
              Add a blank table
            </p>
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-gray-100">
              ➕ Create with AI
            </button>
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-gray-100">
              ✏️ Start from scratch
            </button>
          </div>

          {/* Sources */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">
              Add from other sources
            </p>
            {[
              "Airtable base",
              "CSV file",
              "Google Calendar",
              "Google Sheets",
              "Microsoft Excel",
              "Salesforce",
              "Smartsheet",
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {item}
              </button>
            ))}
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-blue-600 hover:bg-gray-100">
              25 more sources...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetTableButton;
