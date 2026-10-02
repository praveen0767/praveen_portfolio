import { EngineeringPage } from "../../components/engineering/EngineeringPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata("How I Engineer - Praveen Kumar S", "How Praveen Kumar S approaches software engineering, system design, evaluation, and practical AI decisions.", "/engineering");

export default function EngineeringRoute() {
  return <EngineeringPage />;
}
