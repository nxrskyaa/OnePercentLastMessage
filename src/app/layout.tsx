import type { Metadata } from "next";
import "./globals.css";
import "./shell.css";
import "./panels.css";
import "./hud.css";
import "./results.css";
import "./mobile.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "1% — Last Message",
  description:
    "One battery percent. One message. Deliver it before the signal dies.",
  applicationName: "1% — Last Message",
  authors: [{ name: "NXR", url: "https://x.com/nxrskyaa" }],
  keywords: ["Last Message", "Dlicom AI Game Jam", "browser game", "NXR"],
  openGraph: {
    title: "1% — Last Message",
    description:
      "One battery percent. One message. Deliver it before the signal dies.",
    type: "website",
    siteName: "1% — Last Message",
  },
  twitter: {
    card: "summary_large_image",
    title: "1% — Last Message",
    description:
      "One battery percent. One message. Deliver it before the signal dies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
