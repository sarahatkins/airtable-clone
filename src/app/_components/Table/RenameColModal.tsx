import { useState, type Dispatch, type SetStateAction } from "react";
import { api } from "~/trpc/react";

interface EditFieldModalProps {
  open: boolean;
  colId: number;
  onClose: () => void;
  currName: string;
  setModalName: Dispatch<SetStateAction<string>>;
}

const RenameColModal: React.FC<EditFieldModalProps> = ({
  open,
  colId,
  onClose,
  currName,
  setModalName,
}) => {
  const [newName, setNewName] = useState<string>(currName);
  const [type, setType] = useState<string>(currName);
  const renameColumn = api.table.renameColumn.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed base", renamed);
    },
  });

  const handleRename = () => {
    renameColumn.mutate({ newName, colId });
    setModalName(newName);
    onClose();
  };

  if (!open || !colId) return null;

  return (
    <div
      className="absolute z-60 ml-[-20] mt-3 w-[380px] rounded-lg border border-gray-200 bg-white shadow-xl p-5"
      onClick={(e) => e.stopPropagation()}
    >
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          className="mb-3 w-full rounded border px-3 py-1"
          onChange={(e) => setNewName(e.target.value)}
          value={newName}
        />

        <p className="mb-3 text-xs text-gray-600">
          This is the table’s primary field. The name is meant to be a short,
          unique representation of each record in your table.
        </p>

        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          className="mb-3 w-full rounded border px-3 py-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="text">Single line text</option>
          <option value="number">Number</option>
        </select>


        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => handleRename()}
            className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
    </div>
  );
};

export default RenameColModal;
