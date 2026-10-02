import { WorkIndex } from "../../components/work/WorkIndex";
import { pageMetadata } from "../../lib/seo";
import { Suspense } from "react";

export const metadata = pageMetadata("Work - Praveen Kumar S", "A broader body of software, AI and systems engineering work.", "/work");

export default function WorkPage() {
  return (
    <Suspense fallback={<div>Loading work...</div>}>
      <WorkIndex />
    </Suspense>
  );
}
