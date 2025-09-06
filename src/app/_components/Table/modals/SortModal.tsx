import { X, Plus, Baseline, Info, type LucideIcon } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  type STATUS,
  typeToIconMap,
  type ColType,
  type SortingType,
} from "~/app/defaults";
import PickColModal from "./PickColModal";

interface SortModalProps {
  currentSorts: SortingType[];
  cols: ColType[];
  onSave: (param: SortingType[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export type SortModalColType = {
  id: number;
  name: string;
  icon: LucideIcon;
};

const SortModal: React.FC<SortModalProps> = ({
  cols,
  isOpen,
  onClose,
  onSave,
  currentSorts,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const additionalRef = useRef<HTMLDivElement | null>(null);

  // Local state for modal UI
  const [showPickCol, setShowPickCol] = useState<boolean>(
    currentSorts.length === 0,
  );
  const [showAdditional, setShowAdditional] = useState<boolean>(false);
  const [availableCols, setAvailableCols] = useState<SortModalColType[]>([]);
  const [sorts, setSorts] = useState<SortingType[]>(currentSorts);

  // Initialize local state when props change
  useEffect(() => {
    setSorts(currentSorts);
    const mappedCols = cols
      .filter((col) => !currentSorts.some((s) => s.columnId === col.id))
      .map((col) => ({
        id: col.id,
        name: col.name,
        icon: typeToIconMap[col.type as STATUS] || Baseline,
      }));
    setAvailableCols(mappedCols);
    setShowPickCol(currentSorts.length === 0);
  }, [cols, currentSorts]);

  // Utility to update local state and immediately call onSave
  const updateSorts = (newSorts: SortingType[]) => {
    setSorts(newSorts);
    onSave(newSorts);
  };

  const updateColumn = (index: number, columnId: number) => {
    const updated = sorts.map((s, i) => (i === index ? { ...s, columnId } : s));
    updateSorts(updated);
  };

  const updateDirection = (index: number, direction: "asc" | "desc") => {
    const updated = sorts.map((s, i) =>
      i === index ? { ...s, direction } : s,
    );
    updateSorts(updated);
  };

  const addSortOption = (columnId: number) => {
    updateSorts([...sorts, { columnId, direction: "asc" }]);
    setShowAdditional(false);
  };

  const removeSortOption = (index: number) => {
    const updated = sorts.filter((_, i) => i !== index);
    updateSorts(updated);
  };

  // Close modal on outside click
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showAdditional &&
        additionalRef.current &&
        !additionalRef.current.contains(event.target as Node)
      ) {
        setShowAdditional(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAdditional]);

  if (!isOpen) return null;
  if (showPickCol) {
    return (
      <div ref={modalRef}>
        <PickColModal
          isOpen={isOpen}
          onClose={onClose}
          cols={availableCols}
          onSelect={addSortOption}
        />
      </div>
    );
  }

  return (
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

          {showAdditional && (
            <div ref={additionalRef} className="absolute z-50 mt-1">
              <PickColModal
                isOpen={showAdditional}
                onClose={() => setShowAdditional(false)}
                cols={availableCols}
                onSelect={addSortOption}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortModal;
