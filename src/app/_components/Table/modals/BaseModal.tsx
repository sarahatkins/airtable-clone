import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
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
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("deleted base", renamed);
      router.push(`/`);
      onClose()
    },
  });

  const handleRename = () => {
    if (!newBaseName.trim()) return;

    renameBase.mutate({ id: base.id, name: newBaseName });
    setBaseName(newBaseName);

    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return;
  return (
    <div
      ref={modalRef}
      className="absolute left-[-45] z-50 mt-2 w-[450px] rounded-md border border-gray-200 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-1 pb-5">
        {/* Header */}
        <input
          type="text"
          defaultValue={newBaseName}
          onChange={(e) => setNewBaseName(e.target.value)}
          onBlur={() => {
            handleRename();
          }}
          className="w-full rounded px-2 py-1 text-2xl font-medium text-gray-700 transition-discrete hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <button
          onClick={() => setShowOptions((prev) => !prev)}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <div className="text-xl font-bold">⋯</div>
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

      {showOptions && (
        <div
          ref={optionsRef}
          className="absolute top-10 right-0 z-50 w-60 rounded-md border border-gray-200 bg-white py-2 shadow-xl"
        >
          <button className="cursor-not-allowed flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h8M8 11h8m-8 4h8"
              />
            </svg>
            Duplicate base
          </button>
          <button className="cursor-not-allowed flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12H8m0 0v8m0-8L5 15m3-3l3 3"
              />
            </svg>
            Slack notifications
          </button>
          <button onClick={() => deleteBase.mutate({id: base.id})} className="cursor-pointer flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            <X  height={15} className="ml-[-3] mr-1"/>
            Delete base
          </button>
        </div>
      )}
    </div>
  );
};

export default EditBaseModal;
