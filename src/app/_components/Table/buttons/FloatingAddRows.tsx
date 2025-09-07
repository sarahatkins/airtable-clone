import type { Dispatch, SetStateAction } from "react";
import type { NormalizedRow } from "../DataGrid";
import HundredThousandButton from "./100kButton";
import CreateRowButton from "./CreateRowButton";
import type { TableType } from "~/app/defaults";

interface ButtonProps {
  dbTable: TableType;
  setRows: Dispatch<SetStateAction<NormalizedRow[]>>;
}

const FloatingAddRows: React.FC<ButtonProps> = ({ dbTable, setRows }) => {
  return (
    <button
      type="button"
      className="fixed bottom-5 left-[340px] z-50 flex h-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-md transition hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label="Add"
    >
      <div className="w-20">
        <CreateRowButton
          dbTable={dbTable}
          setRows={setRows}
          style="cursor-pointer"
        />
      </div>
      <HundredThousandButton tableId={dbTable.id} />
    </button>
  );
};

export default FloatingAddRows;
