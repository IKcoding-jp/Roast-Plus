import type { Metadata, Viewport } from "next";
// TEMPORARY: Google Fonts disabled for build - will re-enable after deployment
// import { Geist, Geist_Mono, Noto_Serif_JP, Playfair_Display, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ToastProvider } from "@/components/Toast";
import { SplashScreen } from "@/components/SplashScreen";

import { Zen_Old_Mincho, Inter } from "next/font/google";

const zenOldMincho = Zen_Old_Mincho({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-zen-old-mincho",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'ローストプラス',
  description: 'コーヒー豆加工業務をサポートするWebアプリ',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ローストプラス',
  },
};

export const viewport: Viewport = {
  themeColor: '#211714',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${zenOldMincho.variable} ${inter.variable} antialiased font-serif`}
        suppressHydrationWarning
      >
        <Script
          src="https://cdn.jsdelivr.net/npm/twemoji@latest/dist/twemoji.min.js"
          strategy="afterInteractive"
        />
        <ServiceWorkerRegistration />
        <SplashScreen />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
