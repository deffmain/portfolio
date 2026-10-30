import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Micael Martins — Desenvolvedor de software",
  description:
    "Construo software que resolve problemas reais: ferramentas de suporte, documentação de implantação, um simulador de plantio, uma plataforma de viagens em grupo e uma API de estacionamento. Com IA no processo de engenharia.",
  openGraph: {
    title: "Micael Martins — Construo software que resolve problemas reais",
    description: "Cinco soluções, do problema ao resultado — e como uso IA no processo de engenharia.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe8",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="grain min-h-full">{children}</body>
    </html>
  );
}
