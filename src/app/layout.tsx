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
  title: "drop-In-drop - WhatsApp E-commerce Platform",
  description:
    "Revolutionary WhatsApp-powered e-commerce platform. Shop exclusively through WhatsApp groups, discover local products, and experience seamless community-driven commerce.",
  keywords:
    "WhatsApp e-commerce, local shopping, community marketplace, WhatsApp drops, mobile commerce, group shopping",
  authors: [{ name: "drop-In-drop Team" }],
  creator: "drop-In-drop",
  publisher: "drop-In-drop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dropindrop.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "drop-In-drop - WhatsApp E-commerce Platform",
    description:
      "Shop exclusively through WhatsApp. Join communities, discover local products, and experience seamless e-commerce in your preferred messaging app.",
    url: "https://dropindrop.com",
    siteName: "drop-In-drop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "drop-In-drop WhatsApp E-commerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "drop-In-drop - WhatsApp E-commerce Platform",
    description:
      "Shop exclusively through WhatsApp. Join communities, discover local products, and experience seamless e-commerce.",
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
