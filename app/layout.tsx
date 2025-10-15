/**
 * Root Layout
 * 
 * Main layout for the entire application
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drop-In-Drop - Plateforme E-commerce WhatsApp",
  description: "Plateforme e-commerce via WhatsApp pour le Cameroun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
