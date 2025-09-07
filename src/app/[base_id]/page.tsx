"use client";

import LoadBasePage from "../_components/LoadBasePage";

interface TablePageProps {
  params: {
    base_id: string;
  };
}

export default function Page({ params }: TablePageProps) {
  return <LoadBasePage id={params.base_id} />;
}