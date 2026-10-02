import { LabListing } from "../../../components/lab/LabListing";
import { pageMetadata } from "../../../lib/seo";

export const metadata = pageMetadata("Experiments - Praveen Kumar S", "Technical experiments from the engineering lab.", "/lab/experiments");

export default function ExperimentsRoute() {
  return <LabListing type="experiments" />;
}
