// components/SortModal.tsx
import { useEffect, useRef, useState } from "react";
import { Baseline, Eye, GripVertical, Hash } from "lucide-react";
import type { ColType, HiddenColType } from "~/app/defaults";
// import { IonToggle } from '@ionic/react';
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

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
    if (hide) {
      onSave([...hiddenCols, id]);
    } else {
      onSave(hiddenCols.filter((colId) => colId != id));
    }
  };

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
      <div className="mt-3 px-4 pb-2">
        <div className="mb-3 flex items-center">
          <input
            type="text"
            placeholder="Find a field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-none pr-2 pl-2 text-sm focus:ring-1 focus:ring-transparent focus:outline-none"
          />
        </div>

        <ul>
          <li className="border-t border-gray-200" />
        </ul>

        <div className="mt-3 space-y-2">
          {filteredFields.map((col: ColType) => {
            const hiddenCol: boolean = hiddenCols.includes(col.id);
            return (
              <div
                key={col.id}
                className="flex items-center justify-between rounded-md px-1 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => handleHiddenCol(!hiddenCol, col.id)}>
                    {/* <switch /> */}
                    <TinySwitch checked={!hiddenCol} />
                  </button>

                  <span className="flex items-center text-sm text-gray-900">
                    {col.type === "text" ? (
                      <Baseline width={13} className="mt-0.25 mr-1" />
                    ) : (
                      <Hash width={13} className="mr-1" />
                    )}

                    {col.name}
                  </span>
                </div>
                <GripVertical className="h-4 w-4 text-gray-300" />
              </div>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div className="mt-4 flex justify-between gap-5">
          <button
            className="w-full cursor-pointer rounded-md bg-gray-100 py-1 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
            onClick={() => onSave(cols.map((c) => c.id))}
          >
            Hide all
          </button>
          <button
            className="w-full cursor-pointer rounded-md bg-gray-100 py-1 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
            onClick={() => onSave([])}
          >
            Show all
          </button>
        </div>
      </div>
    </div>
  );
};

const TinySwitch = styled(Switch)(({ theme }) => ({
  width: 20,
  height: 10,
  padding: 0,
  display: "flex",

  "& .MuiSwitch-switchBase": {
    padding: 1.25,
    paddingTop: 2,
    transform: "translateX(0px)",
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#16a34a", // Tailwind green-600
        opacity: 1,
      },
    },
  },

  "& .MuiSwitch-thumb": {
    width: 6,
    height: 6,
    boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
  },

  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    backgroundColor: "#d1d5db", // Tailwind gray-300
    opacity: 1,
  },
}));

export default HiddenModal;
