// components/SortModal.tsx
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Eye, GripVertical } from "lucide-react";
import type { ColType, HiddenColType } from "~/app/defaults";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cols: ColType[];
  hiddenCols: HiddenColType[];
  onSave: (param: HiddenColType[]) => void;
}

const HiddenModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  cols,
  hiddenCols,
  onSave,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  const filteredFields = cols.filter((field) =>
    field.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleHiddenCol = (hide: boolean, id: number) => {
    if(hide) {
      onSave([...hiddenCols, id])
    } else {
      onSave(hiddenCols.filter((colId) => colId != id))
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[380px] rounded-lg border border-gray-200 bg-white shadow-xl"
       onClick={(e) => e.stopPropagation()}
    >
      {/* Content */}
      <div className="space-y-2 px-4 py-3">
        <div className="mb-3 flex items-center">
          <input
            type="text"
            placeholder="Find a field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-none py-1.5 pr-2 pl-2 text-sm focus:ring-1 focus:ring-transparent focus:outline-none"
          />
        </div>

        <ul>
          <li className="my-1 border-t border-gray-200" />
        </ul>
        <div className="mt-3 space-y-2">
          {filteredFields.map((col: ColType) =>{ 
            const hiddenCol: boolean = hiddenCols.includes(col.id);
            return (
            <div
              key={col.id}
              className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <button onClick={() => handleHiddenCol(!hiddenCol, col.id)}>
                  {hiddenCol ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-300" />
                  )}
                </button>
                {/* {field.icon} */}
                <span className="text-sm">{col.name}</span>
              </div>
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )})}
        </div>

        {/* Footer buttons */}
        <div className="mt-4 flex justify-between">
          <button
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() =>
              onSave(cols.map((c) => c.id))
            }
          >
            Hide all
          </button>
          <button
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => onSave([])}
          >
            Show all
          </button>
        </div>
      </div>
    </div>
  );
};

export default HiddenModal;
