import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";

export const viewport: Viewport = {
  themeColor: "#547d54",
};

export const metadata: Metadata = {
  title: "262 Cosas Ricas | Viandas Saludables en Palermo & Villa Crespo",
  description:
    "Viandas saludables y ensaladas frescas en CABA. Comida casera y nutritiva que te simplifica la vida. Pedí por WhatsApp.",
  keywords: [
    "viandas saludables palermo",
    "viandas villa crespo",
    "comida saludable CABA",
    "meal prep buenos aires",
    "viandas congeladas",
    "ensaladas frescas palermo",
  ],
  openGraph: {
    title: "262 Cosas Ricas | Viandas Saludables",
    description: "Comida que te simplifica la vida. Viandas y ensaladas saludables en CABA.",
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "262 Cosas Ricas — Viandas saludables en CABA",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <Providers>{children}</Providers>
        <WhatsAppButton />
      </body>
    </html>
  );
}
