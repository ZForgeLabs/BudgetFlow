import { TempoInit } from "@/components/tempo-init";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FeatureLimitsProvider } from "@/contexts/FeatureLimitsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BudgetFlow - Smart Budgeting & Financial Management",
  description: "Take control of your finances with intelligent budgeting, real-time tracking, and personalized insights. Build wealth, reduce stress, and achieve your financial goals faster.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TempoInit />
        <FeatureLimitsProvider>
          {children}
        </FeatureLimitsProvider>
        <Toaster />
      </body>
      <Script src="https://api.tempo.build/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
    </html>
  );
}
