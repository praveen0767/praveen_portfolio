import { ContactPage } from "../../components/contact/ContactPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata("Contact Praveen Kumar S - Software Engineer", "Contact information for software engineering, AI engineering and technical collaboration.", "/contact");

export default function ContactRoute() {
  return <ContactPage />;
}
