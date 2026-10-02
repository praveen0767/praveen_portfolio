import { LabListing } from "../../../components/lab/LabListing";
import { pageMetadata } from "../../../lib/seo";

export const metadata = pageMetadata("Build Log - Praveen Kumar S", "A chronological engineering build log.", "/lab/build-log");

export default function BuildLogRoute() {
  return <LabListing type="build-log" />;
}
