import AirTable from "../../_components/airtable";

interface PageProps {
  params: {
    id: string;
  }
}

export default function Page({ params }: PageProps) {
  return <AirTable baseId={params.id}/>;
}
