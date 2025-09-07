"use client";

import { useParams } from "next/navigation";
import LoadBasePage from "../_components/LoadBasePage";

interface TablePageProps {
  params: Promise<{
    base_id: string;
  }>;
}

 const Page: React.FC<TablePageProps> = () => {
  const params = useParams<{base_id: string}>();

  return <LoadBasePage id={params.base_id} />;
}

export default Page;