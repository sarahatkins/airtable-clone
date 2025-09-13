import {
  ChevronRightIcon,
  ChevronUpIcon,
  Copy,
  Slack,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [newBaseName, setNewBaseName] = useState<string>(base.name);
  const [showOptions, setShowOptions] = useState(false);
  const renameBase = api.base.renameBase.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed base", renamed);
    },
  });

  const deleteBase = api.base.deleteBase.useMutation({
    onSuccess: async (deleted) => {
      if (!deleted) return;
      console.log("deleted base", deleted);
    },
  });

  const handleRename = useCallback(() => {
    if (!newBaseName.trim()) return;

    renameBase.mutate({ id: base.id, name: newBaseName });
    setBaseName(newBaseName);

    onClose();
  }, [newBaseName, setBaseName, base.id, renameBase, onClose]);

  const handleDelete = () => {
    deleteBase.mutate({ id: base.id });
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
        if (newBaseName != base.name) {
          handleRename();
        }
        onClose();
      } else if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false); // closes dropdown but not modal
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, setShowOptions, base.name, newBaseName, handleRename]);

  if (!isOpen) return;
  return (
    <div
      ref={modalRef}
      className="absolute left-[-45] z-80 mt-2 w-[380px] rounded-md border border-gray-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-1 pb-3">
        {/* Header */}
        <input
          type="text"
          defaultValue={newBaseName}
          onInput={(e) => {
            setNewBaseName(e.currentTarget.value);
          }}
          onBlur={() => {
            handleRename();
          }}
          className="w-full rounded px-2 py-2 text-xl text-gray-700 transition-discrete hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <button
          onClick={() => setShowOptions(true)}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <div className="cursor-pointer text-xl font-bold">⋯</div>
        </button>
      </div>

      {/* Appearance Section */}
      <button
        onClick={() => setAppearanceOpen(!appearanceOpen)}
        className="flex w-full cursor-pointer items-center py-3 text-left text-lg font-medium"
      >
        {appearanceOpen ? (
          <ChevronUpIcon className="mt-1 h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="mt-1 h-4 w-4 text-gray-500" />
        )}
        <span className="ml-1 py-2 text-sm">Appearance</span>
      </button>

      {appearanceOpen && (
        <div className="p-2 text-xs text-gray-700">
          Appearance settings content...
        </div>
      )}

      {/* Base Guide Section */}
      <button
        onClick={() => setGuideOpen(!guideOpen)}
        className="flex w-full cursor-pointer items-center border-t border-gray-200 py-2 text-left text-lg font-medium"
      >
        {guideOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
        <span className="ml-1 py-2 text-sm">Base guide</span>
      </button>
      {guideOpen && (
        <div className="space-y-3 px-1 pt-2 text-xs text-gray-700">
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

      {showOptions && (
        <div
          ref={optionsRef}
          className="absolute top-12 right-[-200] z-100 w-60 rounded-md border border-gray-200 bg-white p-2 py-2 shadow-xl"
        >
          <button className="flex w-full items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
            <Copy width={15} className="mr-2" />
            Duplicate base
          </button>
          <button className="flex w-full items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
            <Slack width={15} className="mr-2" />
            Slack notifications
          </button>
          <button
            onClick={() => handleDelete()}
            className="flex w-full cursor-pointer items-center px-4 py-2 text-xs text-red-700 hover:bg-gray-100"
          >
            <Trash width={15} className="mr-2" color="gray" />
            Delete base
          </button>
        </div>
      )}
    </div>
  );
};

export default EditBaseModal;
