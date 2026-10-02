import { siteName, siteUrl } from "../../lib/seo";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", name: siteName, url: siteUrl, jobTitle: "Software Engineer" },
      { "@type": "WebSite", name: siteName, url: siteUrl, description: "Software engineer and AI generalist building intelligent software systems across software engineering, data and artificial intelligence." },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
