import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { StructuredData } from "../components/layout/StructuredData";
import { Navbar } from "../components/navigation/Navbar";
import { MotionProvider } from "../components/motion/MotionProvider";
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

const title = `${profile.name} — Forward Deployed Engineer | Software Engineer | AI Systems Builder`;
const description =
  "Personal site of Praveen Kumar S — Forward Deployed Engineer in Chennai building end-to-end software, AI and data systems around real-world problems. Serious software engineering, GenAI, full-stack, system integration, deployment and evaluation.";

/**
 * Runs synchronously while the browser parses the head, so the stored theme is
 * applied before the first paint. `try/catch` covers blocked storage.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("praveen-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

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
    "Forward Deployed Engineer",
    "software engineer",
    "AI engineer",
    "AI systems builder",
    "GenAI",
    "full-stack engineering",
    "system integration",
    "backend engineering",
    "retrieval augmented generation",
    "machine learning",
    "edge AI",
    "system design",
    "deployment",
    "evaluation",
    "B.Tech artificial intelligence and data science",
    "Chennai",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
         * Theme initialisation: runs synchronously before the first paint so
         * there is no flash of incorrect theme. beforeInteractive injects the
         * script into the initial HTML <head> server-side, which is the correct
         * mechanism in Next.js App Router for pre-hydration scripts.
         */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <StructuredData />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <Navbar />
          <MotionProvider>
            <main id="main" className="site-main">
              {children}
            </main>
          </MotionProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}