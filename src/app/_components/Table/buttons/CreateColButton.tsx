import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  DEFAULT_PENDING_KEY,
  STATUS,
  type ColType,
  type TableType,
} from "~/app/defaults";
import { api } from "~/trpc/react";
import {
  clearPendingColEditsForCol,
  getPendingColEditsForCol,
} from "../helper/PendingEdits";
import { Baseline, Hash, Plus } from "lucide-react";
import ReactDOM from "react-dom";

interface ColButtonProps {
  dbTable: TableType;
  setCols: Dispatch<SetStateAction<ColType[]>>;
}

const CreateColButton: React.FC<ColButtonProps> = ({ dbTable, setCols }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [modalPos, setModalPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnType, setNewColumnType] = useState<STATUS | null>();
  const [newColumnName, setNewColumnName] = useState("");
  const { mutate: setCellValue } = api.table.setCellValue.useMutation({
    onSuccess: () => {
      console.log("New cell created!");
    },
  });

  const createColMutation = api.table.createColumn.useMutation({
    onSuccess: (newCol) => {
      if (!newCol) return;
      setCols((prev: ColType[]) =>
        prev.map((col) => (col.id < 0 ? { ...col, id: newCol.id } : col)),
      );

      // Check for pending and replace default id
      const pending = getPendingColEditsForCol();
      pending.forEach((edit) => {
        const editVal =
          typeof edit.value === "number"
            ? edit.value.toString()
            : (edit.value ?? "");

        setCellValue({
          tableId: edit.tableId ?? 0,
          rowId: edit.rowId,
          columnId: newCol.id,
          value: editVal,
        });
        clearPendingColEditsForCol(edit.columnId);
      });
    },
  });

  const openAddColumn = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalPos({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 350,
      });
    }
    setIsAddColumnOpen(true);
  };

  useEffect(() => {
    // ...existing click outside logic...
    const updatePos = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setModalPos({
          top: rect.bottom + window.scrollY,
          left: rect.right + window.scrollX - 350,
        });
      }
    };
    if (isAddColumnOpen) {
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      updatePos();
    }
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isAddColumnOpen]);

  const closeAddColumn = () => {
    setIsAddColumnOpen(false);
    setNewColumnType(null);
    setNewColumnName("");
  };

  const handleAddNewColumn = () => {
    if (!newColumnName.trim() || !newColumnType) return;

    const newCol: ColType = {
      id: DEFAULT_PENDING_KEY(),
      name: newColumnName,
      type: newColumnType,
      tableId: dbTable.id,
      orderIndex: 0,
    };

    // Add column optimistically
    setCols((prev: ColType[]) => {
      return [...prev, newCol];
    });

    closeAddColumn();

    // Ask backend to create it
    createColMutation.mutate({
      tableId: dbTable.id,
      name: newColumnName,
      type: newColumnType,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsAddColumnOpen(false);
      }
    };
    if (isAddColumnOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddColumnOpen, setIsAddColumnOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openAddColumn}
        className="flex h-full w-full cursor-pointer items-center justify-center hover:bg-gray-100"
      >
        <Plus height={18} />
      </button>
      {isAddColumnOpen &&
        modalPos &&
        ReactDOM.createPortal(
          <div
            ref={modalRef}
            style={{
              position: "fixed",
              top: modalPos.top,
              left: modalPos.left,
              zIndex: 60,
              width: 350,
            }}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          >
            {!newColumnType ? (
              <>
                <h3 className="mb-2 text-gray-500">Select field type</h3>
                <div className="flex flex-col gap-1">
                  {(Object.keys(STATUS) as STATUS[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewColumnType(type)}
                      className="text-left flex cursor-pointer rounded p-2 hover:bg-gray-100 items-center text-sm"
                    >
                      {type.toLowerCase() === STATUS.Text ? <Baseline width={18} className="mr-1"/> : <Hash width={18} className="mr-1" />}
                      {type}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 font-semibold">Enter field name</h3>
                <input
                  className="mb-2 w-full rounded border p-2"
                  placeholder="Field name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeAddColumn}
                    className="rounded border px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewColumn}
                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  >
                    Create field
                  </button>
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export default CreateColButton;
