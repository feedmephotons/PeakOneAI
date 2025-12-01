import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeakOne AI - All-in-One Communication & AI Productivity Platform",
  description: "Combining secure messaging, video conferencing, AI-powered productivity, project management, and cloud storage in one unified platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PeakOne AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "PeakOne AI",
    title: "PeakOne AI - AI-Powered Productivity Platform",
    description: "Messaging, video, tasks, and files unified with AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PeakOne AI",
    description: "AI-Powered Productivity Platform",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA iOS specific */}
        <link rel="apple-touch-icon" href="/icons/pwa/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/pwa/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/pwa/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/pwa/icon-192.png" />

        {/* iOS splash screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PeakOne AI" />

        {/* Windows */}
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* General */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PeakOne AI" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ServiceWorkerRegistration />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
