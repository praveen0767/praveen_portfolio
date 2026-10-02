import { LabPage } from "../../components/lab/LabPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata("Engineering Lab - Praveen Kumar S", "Experiments, technical notes, and build logs from Praveen Kumar S.", "/lab");

export default function LabRoute() {
  return <LabPage />;
}
