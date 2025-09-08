import { api } from "~/trpc/react";

interface ButtonProps {
  tableId: number;
}

const HundredThousandButton: React.FC<ButtonProps> = ({ tableId }) => {
  const utils = api.useUtils();

  const handleHundreds = api.hundreds.generateLargeTable.useMutation({
    onSuccess: async () => {
      console.log("Generated 100k rows");
      await utils.table.getFilterCells.invalidate();
    },
  });

  return (
    <button
      className="h-full w-full cursor-pointer rounded rounded-tr-3xl rounded-br-3xl border-l border-gray-100 p-1 font-semibold hover:bg-gray-50"
      onClick={() => handleHundreds.mutate({ tableId })}
    >
      Generate 100k rows
    </button>
  );
};

export default HundredThousandButton;
