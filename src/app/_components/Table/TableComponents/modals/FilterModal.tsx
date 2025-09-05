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
  FilterGroup,
  FilterLeaf,
  FilterOperator,
} from "~/app/defaults";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  setFilter: Dispatch<SetStateAction<FilterGroup | null>>;
  currentFilter: FilterGroup | null;
  cols: ColType[];
}

const textOperators: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "contains..." },
  { value: "notContains", label: "does not contain..." },
  { value: "eq", label: "is..." },
  { value: "neq", label: "is not..." },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const numberOperators: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "=" },
  { value: "notContains", label: "≠" },
  { value: "gt", label: "greater than" },
  { value: "lt", label: "less than" },
  { value: "gte", label: "≥" },
  { value: "lte", label: "≤" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  currentFilter,
  setFilter,
  cols,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const filterTree: FilterGroup = currentFilter ?? {
    functionName: "and",
    args: [],
  };

  const updateCondition = (
    index: number,
    key: "functionName",
    value: FilterOperator,
  ) => {
    const updated = [...filterTree.args];
    const existing = updated[index];

    if (!existing) return;

    updated[index] = {
      functionName: value,
      args: existing.args, // preserve args explicitly
    };

    setFilter({ ...filterTree, args: updated });
  };

  const updateArg = (
    index: number,
    argIndex: 0 | 1,
    value: string | number | boolean,
  ) => {
    const updated = [...filterTree.args];
    const cond = updated[index];
    if (!cond) return;

    const newArgs = [...cond.args] as [number, string | number | boolean];
    if (argIndex === 0) {
      newArgs[0] = Number(value); // Ensure it's a number for columnId
    } else {
      newArgs[1] = value; // Can be string | number | boolean
    }
    updated[index] = {
      ...cond,
      args: newArgs,
    };
    setFilter({ ...filterTree, args: updated });
  };

  const removeCondition = (index: number) => {
    const updated = [...filterTree.args];
    updated.splice(index, 1);
    setFilter({ ...filterTree, args: updated });
  };

  const getColType = (colId: number): "text" | "number" => {
    const col = cols.find((c) => c.id === colId);
    return col?.type === "number" ? "number" : "text";
  };

  const addCondition = () => {
    const newCond: FilterLeaf = {
      functionName: "contains",
      args: [cols[0]?.id ?? 0, ""],
    };
    setFilter({ ...filterTree, args: [...filterTree.args, newCond] });
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

  // useEffect(() => {
  //   filterTree && setFilter(filterTree);
  // }, [filterTree, setFilter]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[550px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="space-y-3 px-4 py-3">
        <p className="text-xs text-gray-700">In this view, show records</p>

        {/* Logic selector */}

        {/* Condition rows */}
        <div className="space-y-2">
          {filterTree.args.map((cond, index) => (
            <div key={index} className="ml-2 flex items-center text-xs">
              {/* Joiner for non-first conditions */}
              <div className="mr-2 flex w-15 items-center justify-center gap-2 text-xs font-semibold">
                {index === 0 && <span className="text-gray-600">Where</span>}
                {index === 1 && (
                  <select
                    value={filterTree.functionName}
                    onChange={(e) =>
                      setFilter({
                        ...filterTree,
                        functionName: e.target.value as "and" | "or",
                      })
                    }
                    className="rounded border border-gray-200 bg-white px-2 py-2 text-xs"
                  >
                    <option value="and">and</option>
                    <option value="or">or</option>
                  </select>
                )}
                {index > 1 && <p>{filterTree.functionName}</p>}
              </div>

              {/* Field */}
              <div className="flex rounded border border-gray-200">
                <select
                  value={cond.args[0]}
                  onChange={(e) => updateArg(index, 0, Number(e.target.value))}
                  className="border-r border-r-gray-200 px-1 py-1"
                >
                  {cols.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>

                {/* Operator */}
                <select
                  value={cond.functionName}
                  onChange={(e) =>
                    updateCondition(
                      index,
                      "functionName",
                      e.target.value as FilterOperator,
                    )
                  }
                  className="border-r border-r-gray-200 px-1 py-1"
                >
                  {(getColType(cond.args[0]) === "text"
                    ? textOperators
                    : numberOperators
                  ).map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Value */}
                {cond.functionName &&
                  (() => {
                    const usableInput =
                      cond.functionName !== "isEmpty" &&
                      cond.functionName !== "isNotEmpty";
                    return (
                      <input
                        type="text"
                        value={usableInput ? cond.args[1].toString() : ""}
                        disabled={!usableInput}
                        onChange={(e) => updateArg(index, 1, e.target.value)}
                        className="flex-1 border-r border-gray-200 px-2 py-1 focus:outline-none"
                        placeholder={usableInput ? "Enter a value" : ""}
                      />
                    );
                  })()}

                {/* Delete */}
                <button
                  onClick={() => removeCondition(index)}
                  className="px-2 text-center focus:border-transparent focus:ring-0 focus:outline-none"
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add buttons */}
        <div className="mt-2 flex items-center space-x-4 text-xs">
          <button
            onClick={addCondition}
            className="text-blue-600 hover:underline"
          >
            + Add condition
          </button>
          <button disabled className="cursor-not-allowed text-gray-400">
            + Add condition group
          </button>
          <button disabled className="ml-auto cursor-not-allowed">
            Copy from another view
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
