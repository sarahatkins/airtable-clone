import { X } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface SearchViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  setSearch: Dispatch<SetStateAction<string | undefined>>;
  currentSearch: string | undefined;
}

const SearchViewModal: React.FC<SearchViewModalProps> = ({
  isOpen,
  onClose,
  setSearch,
  currentSearch,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Local state for input
  const [localSearch, setLocalSearch] = useState(currentSearch ?? "");

  // Debounce search updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch || undefined);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, setSearch]);

  useEffect(() => {
    setLocalSearch(currentSearch ?? "");
  }, [currentSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setSearch(undefined);
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, setSearch]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[500px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="space-y-3 px-4 py-3">
        <div className="flex items-center border-b px-3 py-2">
          <input
            type="text"
            value={localSearch}
            placeholder="Find in view"
            className="flex-1 text-sm placeholder-gray-400 outline-none"
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <button
            onClick={onClose}
            className="ml-2 rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 py-2 text-xs text-gray-500">
          Use advanced search options in the{" "}
          <a href="#" className="text-blue-600 hover:underline">
            search extension
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default SearchViewModal;
