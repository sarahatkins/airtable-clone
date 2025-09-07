import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ViewNameModal from "../modals/ViewNameModal";

interface ButtonProps {
  tableId: number;
}

const CreateViewButton: React.FC<ButtonProps> = ({ tableId }) => {
  const [viewName, setViewName] = useState<string>("Grid");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (!showModal) setViewName("Grid");
  }, [showModal]);
  return (
    <div>
      <button
        className="flex w-full items-center rounded-md px-2 py-1.5 text-gray-700 hover:bg-gray-100"
        onClick={() => setShowModal(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create new...
      </button>
      <ViewNameModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tableId={tableId}
        currentName={viewName}
        isNewView={true}
      />
    </div>
  );
};

export default CreateViewButton;
