import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CarbonPulse AI+ — Intelligent Carbon Footprint Tracker",
    template: "%s | CarbonPulse AI+",
  },
  description:
    "Track and reduce your carbon footprint with Explainable AI (SHAP), Digital Carbon Twin forecasting, OCR receipt intelligence, and community gamification.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "explainable AI",
    "SHAP",
    "digital twin",
    "climate action",
  ],
  authors: [{ name: "CarbonPulse AI+" }],
  openGraph: {
    title: "CarbonPulse AI+ — Intelligent Carbon Footprint Tracker",
    description:
      "From Awareness to Action. The intelligent carbon tracking platform powered by Explainable AI and Digital Twins.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
