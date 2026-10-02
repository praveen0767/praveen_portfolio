import { AboutPage } from "../../components/about/AboutPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata("About Praveen Kumar S - Software Engineer & AI Generalist", "Background, engineering interests and professional direction of Praveen Kumar S.", "/about");

export default function AboutRoute() {
  return <AboutPage />;
}
