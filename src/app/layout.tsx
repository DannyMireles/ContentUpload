import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Content Upload Control",
  description: "Private scheduling and AI-assisted distribution console for multi-company video publishing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="page-shell">{children}</body>
    </html>
  );
}
