import { Plus } from "lucide-react";
import { useDefaultTableSetup } from "../../CreateDefaultTable";
import { useEffect, useRef, useState } from "react";

interface ButtonProps {
  baseId: string;
}

const AddTableButton: React.FC<ButtonProps> = ({ baseId }) => {
  // Create default table
  const { newTable, finishedTableSetup, handleCreateTable } =
    useDefaultTableSetup(baseId);
  const [showModal, setShowModal] = useState<boolean>(false);
  const buttonRef = useRef<any>(null);
  const modalRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Click -> lil pop up -> create form scratch
  // New table loads with a pop-up that allows you to rename
  const handleAddTable = () => {
    handleCreateTable("Table x");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        onClick={() => setShowModal(!showModal)}
      >
        <Plus className="h-4 w-4" />
        Add or import
      </button>
      {showModal && (
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
            <button className="w-full rounded-md px-3 py-2 text-left hover:bg-gray-100" onClick={handleAddTable}>
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

export default AddTableButton;
