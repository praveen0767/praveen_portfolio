import { LabListing } from "../../../components/lab/LabListing";
import { pageMetadata } from "../../../lib/seo";

export const metadata = pageMetadata("Engineering Notes - Praveen Kumar S", "Technical notes from the engineering lab.", "/lab/notes");

export default function NotesRoute() {
  return <LabListing type="notes" />;
}
