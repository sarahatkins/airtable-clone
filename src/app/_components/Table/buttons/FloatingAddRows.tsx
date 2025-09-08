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
    <div
      className="shadow-sm fixed bottom-10 left-[340px] z-50 flex h-9 -translate-y-1/2 items-center justify-center rounded-3xl bg-white border border-gray-100 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label="Add"
    >
      <div className="w-20 h-full rounded-tl-3xl rounded-bl-3xl flex justify-center hover:bg-gray-50">
        <CreateRowButton
          dbTable={dbTable}
          setRows={setRows}
          style="cursor-pointer"
        />
      </div>
      <HundredThousandButton tableId={dbTable.id} />
    </div>
  );
};

export default FloatingAddRows;
