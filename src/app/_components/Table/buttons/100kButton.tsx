import { api } from "~/trpc/react";

interface ButtonProps {
  tableId: number;
}

const HundredThousandButton: React.FC<ButtonProps> = ({ tableId }) => {
  const createRows = api.table.createFilledRows.useMutation({});
  return (
    <button className="border-l border-gray-100 rounded p-1 cursor-pointer font-semibold w-full hover:bg-gray-100" onClick={() => createRows.mutate({ tableId, count: 100000 })}>
      Generate 100k rows
    </button>
  );
};

export default HundredThousandButton;
