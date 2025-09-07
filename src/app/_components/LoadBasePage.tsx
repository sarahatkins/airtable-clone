"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/trpc/react";

interface LoadingProps {
  id: string;
}

const LoadBasePage: React.FC<LoadingProps> = ({ id }) => {
  console.log("THIS IS ID", id);
  const router = useRouter();
  const { data: tables, isLoading } = api.table.getTablesByBase.useQuery(
    { baseId: id },
    { enabled: !!id },
  );

  useEffect(() => {
    if (!isLoading && tables?.[0]) {
      console.log(tables[0])
      // redirect to the first table by default
      router.replace(`/${id}/${tables[0].id}`);
    }
  }, [isLoading, tables, id, router]);

  return <div className="p-4">Loading tables…</div>;
};

export default LoadBasePage;
