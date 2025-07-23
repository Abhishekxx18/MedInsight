import { createFileRoute, useParams } from "@tanstack/react-router";
import DiseaseInfo from "@/components/DiseaseInfo";

export const Route = createFileRoute("/disease-info/$disease")({
  component: DiseaseInfoPage,
});

function DiseaseInfoPage() {
  const { disease } = useParams({ from: "/disease-info/$disease" });
  return <DiseaseInfo disease={disease} />;
}
