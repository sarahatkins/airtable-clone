import { Pencil, Plus } from "lucide-react";
import { useDefaultTableSetup } from "../../CreateDefaultTable";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { TableType } from "~/app/defaults";

interface ButtonProps {
  baseId: string;
  setSelectedTable: Dispatch<SetStateAction<TableType | null>>;
  setFinishedTableSetup: Dispatch<SetStateAction<boolean>>;
}

const AddTableButton: React.FC<ButtonProps> = ({
  baseId,
  setSelectedTable,
  setFinishedTableSetup,
}) => {
  // Create default table
  const { newTable, finishedTableSetup, handleCreateTable } =
    useDefaultTableSetup(baseId);
  const [showModal, setShowModal] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && buttonRef.current && modalRef &&
        !modalRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTable = () => {
    handleCreateTable("Table x");
    setFinishedTableSetup(false);
    setShowModal(false);
  };

  useEffect(() => {
    if (!newTable) return;
    setSelectedTable(newTable);
  }, [newTable]);

  useEffect(() => {
    if(finishedTableSetup) setFinishedTableSetup(true);
  }, [finishedTableSetup])

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        onClick={() => {
          setShowModal(!showModal);
        }}
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
            <button className="flex w-full items-center rounded-md px-3 py-2 text-left hover:bg-gray-100">
              <Pencil width={15} className="mr-2" /> Create with AI
            </button>
            <button
              className="flex w-full rounded-md px-3 py-2 text-left hover:bg-gray-100"
              onClick={handleAddTable}
            >
              <Plus width={15} className="mr-2" /> Start from scratch
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
