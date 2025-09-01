import { Trash2, GripVertical } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ColType,
  FilterJoiner,
  FilterOperator,
  FilterType,
} from "~/app/defaults";

interface FilterModalProps {
  isOpen: boolean;
  onClose: any;
  tableId: number;
  setFilter: Dispatch<SetStateAction<FilterType[]>>;
  currentFilter: FilterType[];
  cols: ColType[];
}

const filterOperators: { label: string; value: FilterOperator }[] = [
  { label: "equals", value: "equals" },
  { label: "not equals", value: "notEquals" },
  { label: "contains", value: "contains" },
  { label: "not contains", value: "notContains" },
  { label: "starts with", value: "startsWith" },
  { label: "ends with", value: "endsWith" },
  { label: "greater than", value: "greaterThan" },
  { label: "less than", value: "lessThan" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  tableId,
  currentFilter,
  setFilter,
  cols,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<any>(null);
  const [conditions, setConditions] = useState<FilterType[]>(currentFilter);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        columnId: cols[0]?.id!,
        operator: "contains",
        value: "",
        ...(conditions.length > 0 && { joiner: "and" }),
      },
    ]);
  };

  const updateCondition = <K extends keyof FilterType>(
    index: number,
    key: K,
    value: FilterType[K],
  ) => {
    const newConditions = [...conditions];
    if (newConditions[index]) newConditions[index][key] = value;
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFilter(conditions);
  }, [conditions, setFilter]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-10 mt-2 w-[500px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      {/* Content */}
      <div className="space-y-3 px-4 py-3">
        {conditions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No filter conditions are applied
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-700">In this view, show records</p>
            {conditions.map((cond, idx) => (
              <div
                key={idx}
                className="flex items-center rounded-md border border-white px-2"
              >
                {/* And/Where label */}
                <span className="mr-2 min-w-10 text-xs font-medium whitespace-nowrap text-gray-600">
                  {idx === 0 ? (
                    "Where"
                  ) : (
                    <select
                      value={cond.joiner}
                      onChange={(e) => {
                        updateCondition(
                          idx,
                          "joiner",
                          e.target.value as "and" | "or",
                        );
                      }}
                      className="border border-gray-200 bg-white py-1 text-xs"
                    >
                      <option>and</option>
                      <option>or</option>
                    </select>
                  )}
                </span>

                {/* Field Dropdown */}
                <select
                  value={cond.columnId}
                  onChange={(e) => {
                    updateCondition(idx, "columnId", Number(e.target.value));
                  }}
                  className="border border-gray-200 bg-white px-2 py-1 text-xs"
                >
                  {cols.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Operator Dropdown */}
                <select
                  value={cond.operator}
                  onChange={(e) =>
                    updateCondition(
                      idx,
                      "operator",
                      e.target.value as FilterOperator,
                    )
                  }
                  className="border border-gray-200 bg-white px-2 py-1 text-xs"
                >
                  {filterOperators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Value Input */}
                <input
                  type="text"
                  value={cond.value as string}
                  onChange={(e) =>
                    updateCondition(idx, "value", e.target.value)
                  }
                  placeholder="Enter a value"
                  className="flex-1 border border-gray-200 px-2 py-1 text-xs"
                />

                {/* Delete Button */}
                <button
                  onClick={() => removeCondition(idx)}
                  className="rounded p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Drag Handle */}
                <GripVertical className="h-4 w-4 text-gray-300" />
              </div>
            ))}
          </>
        )}

        {/* Add condition / group */}
        <div className="flex items-center space-x-4 text-xs">
          <button
            onClick={addCondition}
            className="text-blue-600 hover:underline"
          >
            + Add condition
          </button>
          <button className="text-gray-600 hover:underline">
            + Add condition group
          </button>
          <button className="ml-auto text-gray-600 hover:underline">
            Copy from another view
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
