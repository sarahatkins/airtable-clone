import { Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type {
  CellValue,
  ColType,
  FilterGroup,
  FilterLeaf,
  FilterOperator,
} from "~/app/defaults";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cols: ColType[];
  currentFilter: FilterGroup | null;
  onSave: (param: FilterGroup | null) => void;
}

const textOperators: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "contains..." },
  { value: "notContains", label: "does not contain..." },
  { value: "is", label: "is..." },
  { value: "isNot", label: "is not..." },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const numberOperators: { value: FilterOperator; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "gte", label: "≥" },
  { value: "lte", label: "≤" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  currentFilter,
  onSave,
  cols,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const [filterTree, setFilterTree] = useState<FilterGroup>(
    currentFilter ?? { functionName: "and", args: [] },
  );

  useEffect(() => {
    setFilterTree(currentFilter ?? { functionName: "and", args: [] });
  }, [currentFilter]);

  const getColType = (colId: number) => {
    const col = cols.find((c) => c.id === colId);
    return col?.type === "number" ? "number" : "text";
  };

  const updateCondition = (
    index: number,
    key: "functionName" | "args",
    value: FilterOperator | [number, CellValue],
  ) => {
    const newArgs = filterTree.args.map((c, i) =>
      i === index ? { ...c, [key]: value } : c,
    );
    onSave({ ...filterTree, args: newArgs });
  };

  const updateArg = (
    index: number,
    argIndex: 0 | 1,
    value: string | number,
    colTypeChanged: boolean = false,
  ) => {
    // if timeout is not empty -> clear timeout and start a new one
    const newArgs = filterTree.args.map((cond, i) => {
      if (i !== index) return cond;

      let args: [number, CellValue] = [...cond.args];
      let functionName = cond.functionName;

      if (colTypeChanged) {
        // If the column type changed, reset operator and value accordingly
        const newColId = argIndex === 0 ? Number(value) : args[0]; // get new column id
        const colType = getColType(newColId);
        functionName = colType === "number" ? "eq" : "contains";

        args = [newColId, colType === "number" ? 0 : ""];
      } else {
        // Normal update
        if (argIndex === 0) {
          args[0] = Number(value);
        } else {
          args[1] = value;
        }
      }

      return { ...cond, args, functionName };
    });

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onSave({ ...filterTree, args: newArgs });
    }, 1000);

    setDebounceTimer(timer);
  };

  const removeCondition = (index: number) => {
    const newArgs = filterTree.args.filter((_, i) => i !== index);
    onSave({ ...filterTree, args: newArgs });
  };

  const addCondition = () => {
    const firstCol = cols[0]?.id ?? 0;
    const newCond: FilterLeaf = {
      functionName: "contains",
      args: [firstCol, ""],
    };
    onSave({ ...filterTree, args: [...filterTree.args, newCond] });
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

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 z-60 mt-2 w-[530px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="space-y-3 px-4 py-3">
        <p className="text-xs text-gray-700">In this view, show records</p>
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
                      onSave({
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
                  onChange={(e) => {
                    const oldColType = getColType(Number(cond.args[0]));
                    const newColType = getColType(Number(e.target.value));

                    updateArg(
                      index,
                      0,
                      e.target.value,
                      oldColType !== newColType,
                    );
                  }}
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
                  onChange={(e) => {
                    updateCondition(
                      index,
                      "functionName",
                      e.target.value as FilterOperator,
                    );
                  }}
                  className="w-30 border-r border-r-gray-200 px-1 py-1"
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
                      cond.functionName !== "isNotEmpty" &&
                      cond.args[1] !== null &&
                      cond.args[1] !== undefined;
                    const type = getColType(cond.args[0]);
                    return (
                      <input
                        key={usableInput ? cond.args[1]?.toString() : "empty"}
                        type={type === "number" ? "number" : "text"}
                        defaultValue={
                          usableInput ? cond.args[1]?.toString() : ""
                        }
                        disabled={!usableInput}
                        onChange={(e) => {
                          updateArg(index, 1, e.target.value);
                        }}
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
