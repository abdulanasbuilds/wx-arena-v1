import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { PWAProvider } from "@/components/pwa";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WX ARENA — Global Skill-Based Gaming Platform",
    template: "%s | WX ARENA",
  },
  description:
    "The world's premier platform for skill-based matches and professional tournaments. Compete globally in eFootball, EA Sports FC 25, Free Fire, PUBG Mobile, and more.",
  keywords: ["global gaming", "esports", "efootball 2025", "ea fc 25", "free fire", "pubg mobile", "tournaments", "skill-based matches", "worldwide gaming"],
  authors: [{ name: "WX ARENA" }],
  creator: "WX ARENA",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://wx-arena.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WX ARENA — Skill-Based Gaming Platform",
    description: "Compete in skill-based gaming matches and win prizes.",
    siteName: "WX ARENA",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WX ARENA",
    description: "Compete in skill-based gaming matches and win prizes.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WX ARENA",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-[#050508] text-[#f1f5f9] font-[family-name:var(--font-dm-sans)] antialiased">
        <PWAProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-8">{children}</main>
          <MobileNav />
          <Footer />
        </PWAProvider>
      </body>
    </html>
  );
}
