import AirTable from "../../_components/airtable";

export default function Page({ params }: { params: { id: string } }) {
  return <AirTable baseId={params.id}/>;
}
