import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalLayout } from "@/components/conditional-layout";

export const metadata: Metadata = {
  title: "TechSupply Co. - Aksesoris Tech Premium",
  description:
    "Toko serba ada untuk aksesoris teknologi dan gadget berkualitas tinggi",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
