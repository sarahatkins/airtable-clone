"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useDefaultTableSetup } from "./Table/helper/CreateDefaultTable";
import LoadingScreen from "./Table/LoadingScreen";

interface LoadingProps {
  id: string;
}

const LoadBasePage: React.FC<LoadingProps> = ({ id }) => {
  const createdTableRef = useRef<boolean>(false);
  const router = useRouter();
  const { data: tables, isLoading } = api.table.getTablesByBase.useQuery(
    { baseId: id },
    { enabled: !!id },
  );

  const { newTable, finishedTableSetup, handleCreateTable } =
    useDefaultTableSetup(id);

  useEffect(() => {
    if (!isLoading) {
      if (tables?.[0]) {
        // Redirect to first table if available
        router.replace(`/${id}/${tables[0].id}`);
      } else if (!createdTableRef.current) {
        // No tables found, create a new one
        createdTableRef.current = true;
        handleCreateTable("Table 1");
      }
    }
  }, [isLoading, tables, id, router, handleCreateTable]);

  useEffect(() => {
    if (finishedTableSetup && newTable) {
      router.replace(`/${id}/${newTable.id}`);
    }
  }, [finishedTableSetup, newTable, id, router]);

  return <div className="h-full"><LoadingScreen /></div>;
};

export default LoadBasePage;
