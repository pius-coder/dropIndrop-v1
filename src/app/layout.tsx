import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Drop-in-Drop - E-commerce WhatsApp au Cameroun | Vente en ligne sur WhatsApp",
  description:
    "Plateforme e-commerce révolutionnaire sur WhatsApp. Achetez et vendez exclusivement via des groupes WhatsApp, découvrez des produits locaux camerounais et vivez une expérience de commerce communautaire fluide.",
  keywords:
    "ecommerce whatsapp cameroun, vente whatsapp, groupe whatsapp vente, shopping whatsapp cameroun, commerce mobile cameroun, marketplace communautaire, whatsapp drops, achats en ligne cameroun, produits locaux cameroun, mtn momo shopping, orange money ecommerce",
  authors: [{ name: "Drop-in-Drop Team" }],
  creator: "Drop-in-Drop",
  publisher: "Drop-in-Drop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://drop-in-drop.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Drop-in-Drop - E-commerce WhatsApp au Cameroun",
    description:
      "Achetez sur WhatsApp en toute simplicité ! Rejoignez nos communautés, découvrez des produits locaux camerounais et faites vos achats sans quitter votre messagerie préférée.",
    url: "https://drop-in-drop.vercel.app",
    siteName: "Drop-in-Drop",
    locale: "fr_CM",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drop-in-Drop - Plateforme e-commerce WhatsApp au Cameroun",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drop-in-Drop - E-commerce WhatsApp au Cameroun",
    description:
      "Achetez sur WhatsApp en toute simplicité ! Produits locaux camerounais, paiement Mobile Money, livraison rapide.",
    images: ["/og-image.jpg"],
    creator: "@dropindrop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "article:author": "Drop-in-Drop Team",
    "article:publisher": "https://drop-in-drop.vercel.app",
    "og:site_name": "Drop-in-Drop",
    "og:locale": "fr_CM",
    "og:type": "website",
    "twitter:site": "@dropindrop",
    "twitter:creator": "@dropindrop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "drop-In-drop",
              url: "https://dropindrop.com",
              logo: "https://dropindrop.com/logo.png",
              description:
                "WhatsApp-powered e-commerce platform for community-driven shopping",
              sameAs: [
                "https://twitter.com/dropindrop",
                "https://facebook.com/dropindrop",
                "https://linkedin.com/company/dropindrop",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-234-567-890",
                contactType: "customer service",
                email: "support@dropindrop.com",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} font-mono antialiased`}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
