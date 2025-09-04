import AirTable from "../../_components/airtable";

interface TablePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: TablePageProps) {
  const { id } = await params;

  return <AirTable baseId={id} />;
}
