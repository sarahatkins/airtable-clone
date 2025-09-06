import { useCallback, useState } from "react";
import { api } from "~/trpc/react";
import { DEFAULT_COLS, DEFAULT_NUM_ROWS, type ColNoId, type ColType, type RowNoId, type RowType, type TableType } from "~/app/defaults";

export function useDefaultTableSetup(baseId: string) {
  const utils = api.useUtils();
  const [newRows, setNewRows] = useState<RowType[]>([]);
  const [newCols, setNewCols] = useState<ColType[]>([]);
  const [newTable, setNewTable] = useState<TableType>();
  const [finishedTableSetup, setFinishedTableSetup] = useState<boolean>(false);

  // --- default newRows/newCols/newGrid hook ---
  const createColumn = api.table.createColumn.useMutation({
    onSuccess: (newCol) => {
      if(!newCol) return;
      setNewCols((prev) => [...prev, newCol]);
    },
  });

  const createRow = api.table.createRow.useMutation({
    onSuccess: (newRow) => {
      if(!newRow) return;
      setNewRows((prev) => [...prev, newRow]);
    },
  });

  const createView = api.table.createView.useMutation({
    onSuccess: (newView) => {
      console.log("Created view", newView)
    }
  })

  const createDefaultTable = useCallback(
    async (tableId: number) => {
      try {
        for (const col of DEFAULT_COLS) {
          await createColumn.mutateAsync({
            name: col.name,
            type: col.type,
            tableId,
          });
        }

        for (let i = 0; i < DEFAULT_NUM_ROWS; i++) {
          await createRow.mutateAsync({ tableId });
        }

        await createView.mutateAsync({tableId, name: "Grid view"})
        setFinishedTableSetup(true);
      } catch (error) {
        console.error("Issue with default table setup", error);
      }
    },
    [createColumn, createRow],
  );

  // --- table creation mutation ---
  const createTable = api.table.createTable.useMutation({
    onSuccess: async (newTable) => {
      console.log("Created table:", newTable);
      setNewTable(newTable);
      if (!newTable) return;

      // create defaults immediately after table is created
      await createDefaultTable(newTable.id);
      utils.table.getTablesByBase.invalidate({baseId})
    },
    onError: (error) => {
      console.error("Error creating table:", error);
    },
  });

  const handleCreateTable = useCallback(
    (tableName: string) => {
      createTable.mutate({ baseId, name: tableName });
    },
    [baseId, createTable],
  );

  return {
    newTable,
    newRows,
    newCols,
    finishedTableSetup,
    handleCreateTable,
  };
}
