import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITULO = "EVA 40+ — Tu ruta metabólica, no otra dieta";
const DESCRIPCION =
  "El diagnóstico y la ruta metabólica semanal para mujeres 40+ que sienten que su cuerpo cambió. Desinflámate esta semana con 3 prioridades claras, sin contar calorías.";

export const metadata: Metadata = {
  metadataBase: new URL("https://eva40.app"),
  title: TITULO,
  description: DESCRIPCION,
  applicationName: "EVA 40+",
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: "/",
    siteName: "EVA 40+",
    locale: "es_LA",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRIPCION },
  icons: { apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#205344",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-base text-txt-primary font-body">
        {/* reducedMotion="user" respeta prefers-reduced-motion del sistema en TODA animación de motion/react */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
