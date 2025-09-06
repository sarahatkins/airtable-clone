// app/[base_id]/[table_id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import AirTable from "~/app/_components/airtable";

interface TablePageProps {
  params: Promise<{
    baseId: string;
    tableId: string;
  }>;
}

const TablePage: React.FC<TablePageProps> = () => {
  const params = useParams<{ base_id: string; table_id: string }>();
  const baseId = params.base_id;
  const tableId = params.table_id;

  // Only render AirTable once both IDs are defined
  if (!baseId || !tableId) {
    return <div className="p-4">Loading table…</div>;
  }

  return <AirTable baseId={baseId} tableId={tableId} />;
};

export default TablePage;