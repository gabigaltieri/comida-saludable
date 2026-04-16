import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#547d54",
};

export const metadata: Metadata = {
  title: "262 Cosas Ricas | Viandas Saludables en Palermo & Villa Crespo",
  description:
    "Viandas saludables, ensaladas frescas y catering boutique en CABA. Comida casera y nutritiva que te simplifica la vida. Pedí por WhatsApp.",
  keywords: [
    "viandas saludables palermo",
    "viandas villa crespo",
    "comida saludable CABA",
    "catering saludable buenos aires",
    "meal prep buenos aires",
    "viandas congeladas",
    "ensaladas frescas palermo",
  ],
  openGraph: {
    title: "262 Cosas Ricas | Viandas Saludables",
    description: "Comida que te simplifica la vida. Viandas, ensaladas y catering boutique en CABA.",
    type: "website",
    locale: "es_AR",
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
        {children}
      </body>
    </html>
  );
}
