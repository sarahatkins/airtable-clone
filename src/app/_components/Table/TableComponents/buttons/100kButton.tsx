import { api } from "~/trpc/react";

interface ButtonProps {
  tableId: number;
}

const HundredThousandButton: React.FC<ButtonProps> = ({ tableId }) => {
  const createRows = api.table.createFilledRows.useMutation({});
  return (
    <button className="bg-blue-300 rounded p-1 cursor-pointer font-bold" onClick={() => createRows.mutate({ tableId, count: 100000 })}>
      Generate 100k
    </button>
  );
};

export default HundredThousandButton;
