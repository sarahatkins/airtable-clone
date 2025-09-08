import { useEffect } from "react";
import { trpcClient } from "~/trpc/query-client";
import { api } from "~/trpc/react";

interface ButtonProps {
  tableId: number;
}

const HundredThousandButton: React.FC<ButtonProps> = ({ tableId }) => {
  const utils = api.useUtils();

  const handleClick = async (tableId: number, count: number) => {
    for await (const chunk of await trpcClient.table.createFilledRows.mutate(
      { tableId, count },
      {
        context: {
          skipBatch: true,
        },
      },
    )) {
      switch (chunk.type) {
        case "start":
          console.log(chunk.message);
          break;
        case "rowsFilled":
          console.log(`Rows filled: ${chunk.value}`);
          await utils.table.getFilterCells.invalidate();
          break;
        case "end":
          console.log(chunk.message);
          break;
      }
    }
  };

  // const {data, mutate: createRows} = api.table.createFilledRows.useMutation({
  //   onSuccess: async () => {
  //     console.log("generated cells")
  //     await utils.table.getFilterCells.invalidate();
  //   }
  // });

  return (
    <button
      className="h-full w-full cursor-pointer rounded rounded-tr-3xl rounded-br-3xl border-l border-gray-100 p-1 font-semibold hover:bg-gray-50"
      onClick={() => handleClick(tableId, 100000)}
    >
      Generate 100k rows
    </button>
  );
};

export default HundredThousandButton;
