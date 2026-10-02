import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { StructuredData } from "../components/layout/StructuredData";
import { Navbar } from "../components/navigation/Navbar";
import { profile } from "../content/profile";
import { siteUrl } from "../lib/seo";
import "./globals.css";

/** Fonts are downloaded at build time and self-hosted by next/font. No external request at runtime. */
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const title = `${profile.name} - ${profile.professionalTitle} & AI Generalist`;
const description =
  "Software engineer and AI generalist building end-to-end systems across software engineering, data and artificial intelligence.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${profile.name}`,
  },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    "software engineer",
    "AI generalist",
    "AI systems builder",
    "applied AI",
    "backend engineering",
    "retrieval augmented generation",
    "machine learning",
    "edge AI",
    "system design",
    profile.name,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: profile.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <StructuredData />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <Navbar />
          <main id="main" className="site-main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}