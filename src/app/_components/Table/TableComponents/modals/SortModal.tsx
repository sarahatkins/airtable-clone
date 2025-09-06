import { X, Plus, Baseline, Info } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  STATUS,
  typeToIconMap,
  type ColType,
  type SortingType,
} from "~/app/defaults";
import PickColModal from "./PickColModal";

interface SortModalProps {
  isOpen: boolean;
  onClose: any;
  cols: ColType[];
  setSort: Dispatch<SetStateAction<SortingType[]>>;
  currentSorts: SortingType[];
}

const SortModal: React.FC<SortModalProps> = ({ cols, isOpen, onClose, setSort, currentSorts }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [showPickCol, setShowPickCol] = useState<boolean>(true);
  const [showAdditional, setShowAdditional] = useState<boolean>(false);
  const [availableCols, setAvailableCols] = useState<any>([]);

  useEffect(() => {
    const mappedCols = cols
      .filter((col) => !currentSorts.some((sort) => sort.columnId === col.id))
      .map((col) => ({
        id: col.id,
        name: col.name,
        icon: typeToIconMap[col.type as STATUS] || Baseline,
      }));

    setAvailableCols(mappedCols);
    setShowPickCol(currentSorts.length === 0);
  }, [cols, currentSorts]);

  const updateColumn = (index: number, columnId: number) => {
    const updated = [...currentSorts];

    if (!updated[index]) return;
    updated[index].columnId = columnId;
    setSort(updated);
  };

  const updateDirection = (index: number, direction: "asc" | "desc") => {
    const updated = [...currentSorts];

    if (!updated[index]) return;
    updated[index].direction = direction;
    setSort(updated);
  };

  const addSortOption = (columnId: number) => {
    setSort([...currentSorts, { columnId, direction: "asc" }]);
  };

  const removeSortOption = (index: number) =>
    setSort(currentSorts.filter((_, i) => i !== index));
  
  // Close on outside click
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

  return showPickCol ? (
    <div ref={modalRef}>
      <PickColModal
        isOpen={isOpen}
        onClose={onClose}
        cols={availableCols}
        onSelect={addSortOption}
      />
    </div>
  ) : (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[500px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      {/* Content */}
      <div className="space-y-3 px-4 py-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center font-semibold text-gray-400">
            Sort by <Info height={15} className="ml-0.5" />
          </h2>
          <button onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul>
          <li className="my-1 border-t border-gray-200" />
        </ul>
        <div className="space-y-2">
          {currentSorts.length === 0 ? (
            <p> No results </p>
          ) : (
            <>
              {currentSorts.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded border border-gray-300 px-2 py-1"
                    value={opt.columnId ?? ""}
                    onChange={(e) => updateColumn(idx, Number(e.target.value))}
                  >
                    {cols.map((col: ColType) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded border border-gray-300 px-2 py-1"
                    value={opt.direction}
                    onChange={(e) =>
                      updateDirection(idx, e.target.value as "asc" | "desc")
                    }
                  >
                    <option value="asc">A → Z</option>
                    <option value="desc">Z → A</option>
                  </select>

                  <button
                    onClick={() => removeSortOption(idx)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="relative">
          <button
            className="mt-2 flex items-center gap-1 text-blue-600"
            onClick={() => setShowAdditional(true)}
          >
            <Plus className="h-4 w-4" /> Add another sort
          </button>

          <PickColModal
            isOpen={showAdditional}
            onClose={() => setShowAdditional(false)}
            cols={availableCols}
            onSelect={addSortOption}
          />
        </div>
      </div>
    </div>
  );
};

export default SortModal;
