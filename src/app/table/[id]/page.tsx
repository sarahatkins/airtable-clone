import AirTable from "../../_components/airtable";

interface TablePageProps {
  params: {
    id: string;
  }
}

export default function Page({ params }: TablePageProps) {
  return <AirTable baseId={params.id}/>;
}
