import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { BaseType } from "~/app/defaults";
import { api } from "~/trpc/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  base: BaseType;
  setBaseName: Dispatch<SetStateAction<string>>;
}
const EditBaseModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  base,
  setBaseName,
}) => {
  const [guideOpen, setGuideOpen] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [newBaseName, setNewBaseName] = useState<string>(base.name);
  const renameBase = api.base.renameBase.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed base", renamed);
    },
  });

  const handleRename = () => {
    if (!newBaseName.trim()) return;

    renameBase.mutate({ id: base.id, name: newBaseName });
    setBaseName(newBaseName);

    onClose();
  };

  if (!isOpen) return;
  return (
    <div className="absolute left-[-45] z-50 mt-2 w-[450px] rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <div className="p-1 pb-5 flex items-center justify-between border-b border-gray-200">
        {/* Header */}
        <input
          type="text"
          defaultValue={newBaseName}
          onChange={(e) => setNewBaseName(e.target.value)}
          onBlur={() => {
            handleRename();
          }}
          className="focus:bg-gray-100 hover:bg-gray-100 focus:outline-none focus:ring-2 w-full focus:ring-blue-200 rounded px-2 py-1 text-2xl font-medium text-gray-700 transition-discrete"
        />
        <button
          onClick={onClose}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Appearance Section */}
      <button
        onClick={() => setAppearanceOpen(!appearanceOpen)}
        className="flex w-full items-center border-b border-gray-200 py-2 text-left text-lg font-medium"
      >
        {appearanceOpen ? (
          <ChevronUpIcon className="mt-1 h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="mt-1 h-4 w-4 text-gray-500" />
        )}
        <span className="ml-1">Appearance</span>
      </button>

      {appearanceOpen && (
        <div className="p-2 text-sm text-gray-700">
          Appearance settings content...
        </div>
      )}

      {/* Base Guide Section */}
      <button
        onClick={() => setGuideOpen(!guideOpen)}
        className="flex w-full items-center border-b border-gray-200 py-2 text-left text-lg font-medium"
      >
        {guideOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
        <span className="ml-1">Base guide</span>
      </button>
      {guideOpen && (
        <div className="space-y-3 px-1 pt-2 text-sm text-gray-700">
          <p>
            Use this space to share the goals and details of your base with your
            team.
          </p>
          <p>Start by outlining your goal.</p>
          <p>Next, share details about key information in your base:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>This table contains…</li>
            <li>This view shows…</li>
            <li>This link contains…</li>
          </ul>
          <p>
            Teammates will see this guide when they first open the base and can
            find it anytime by clicking the down arrow on the top of their
            screen.
          </p>
        </div>
      )}
    </div>
  );
};

export default EditBaseModal;
