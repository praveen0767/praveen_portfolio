import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const siteName = "Praveen Kumar S";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
