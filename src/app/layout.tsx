import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1% — Last Message",
  description:
    "One battery percent. One message. Deliver it before the signal dies.",
  openGraph: {
    title: "1% — Last Message",
    description:
      "One battery percent. One message. Deliver it before the signal dies.",
    type: "website",
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
