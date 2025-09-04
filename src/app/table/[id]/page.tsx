import AirTable from "../../_components/airtable";

// @ts-ignore
export default function Page({ params }: any) {
  return <AirTable baseId={params.id} />;
}
