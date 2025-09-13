// components/SortModal.tsx
import {
  useRef,
  useState,
} from "react";
import {
  Info,
  Search,
} from "lucide-react";
import type { SortModalColType } from "./SortModal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cols: SortModalColType[];
  onSelect: (param: number, param2: "text" | "number") => void;
}

const PickColModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  cols,
  onSelect,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredFields = cols.filter((field) =>
    field.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[350px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      {/* Content */}
      <div className="space-y-2 px-4 py-3">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-1">
            Sort by <Info className="h-4 w-4 text-gray-400" />
          </div>
          <button className="text-xs text-gray-400 hover:underline" onClick={onClose}>
            Copy from a view
          </button>
        </div>
        <ul>
          <li className="my-1 border-t border-gray-200" />
          </ul>

        <div className="mb-3 flex items-center">
          <Search className="text-gray-400" height={15}/>
          <input
            type="text"
            placeholder="Find a field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-none pr-2 pl-2 text-sm focus:ring-1 focus:ring-transparent focus:outline-none"
          />
        </div>

          {filteredFields.map((col) => (
            <li
              key={col.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-800 bg-white hover:bg-gray-100 m-0"
              onClick={() => onSelect(col.id, col.type)}
            >
              <col.icon className="h-4 w-4 text-gray-500" />
              {col.name}
            </li>
          ))}
      </div>
    </div>
  );
};

export default PickColModal;
