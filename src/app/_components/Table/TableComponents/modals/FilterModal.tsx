import { Trash2, GripVertical } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ColType, FilterOperator } from "~/app/defaults";
import type {
  FilterGroup,
  FilterLeaf,
  FilterOperator2,
} from "~/app/filterDefaults";

interface FilterModalProps {
  isOpen: boolean;
  onClose: any;
  setFilter: Dispatch<SetStateAction<FilterGroup | null>>;
  currentFilter: FilterGroup | null;
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
    value: FilterOperator2,
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
      className="absolute right-0 z-60 mt-2 w-[500px] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="space-y-3 px-4 py-3">
        <p className="text-xs text-gray-700">In this view, show records</p>

        {/* Logic selector */}
        <div className="text-xs flex items-center gap-2">
          <span className="text-gray-600">Where</span>
          <select
            value={filterTree.functionName}
            onChange={(e) =>
              setFilter({
                ...filterTree,
                functionName: e.target.value as "and" | "or",
              })
            }
            className="border border-gray-200 bg-white px-2 py-1 text-xs"
          >
            <option value="and">all conditions are met</option>
            <option value="or">any condition is met</option>
          </select>
        </div>

        {/* Condition rows */}
        <div className="space-y-2">
          {filterTree.args.map((cond, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded border border-white px-2 py-1 text-xs hover:border-gray-200"
            >
              {/* Joiner for non-first conditions */}
              {index > 0 && (
                <select
                  value={filterTree.functionName}
                  disabled
                  className="text-gray-400 border border-gray-200 bg-white px-1 py-1"
                >
                  <option value="and">and</option>
                  <option value="or">or</option>
                </select>
              )}

              {/* Field */}
              <select
                value={cond.args[0]}
                onChange={(e) =>
                  updateArg(index, 0, Number(e.target.value))
                }
                className="border px-1 py-1"
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
                  updateCondition(index, "functionName", e.target.value as FilterOperator2)
                }
                className="border px-1 py-1"
              >
                <option value="contains">contains</option>
                <option value="notContains">not contains</option>
                <option value="eq">equals</option>
                <option value="neq">not equal</option>
                <option value="startsWith">starts with</option>
                <option value="endsWith">ends with</option>
                <option value="gt">greater than</option>
                <option value="lt">less than</option>
                <option value="gte">≥</option>
                <option value="lte">≤</option>
              </select>

              {/* Value */}
              <input
                type="text"
                value={cond.args[1].toString()}
                onChange={(e) => updateArg(index, 1, e.target.value)}
                className="flex-1 border px-2 py-1"
                placeholder="Enter a value"
              />

              {/* Delete */}
              <button onClick={() => removeCondition(index)}>
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
              </button>
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
          <button disabled className="cursor-not-allowed ml-auto">
            Copy from another view
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
