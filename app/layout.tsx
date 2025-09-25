import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaSX - All-in-One Communication & AI Productivity Platform",
  description: "Combining secure messaging, video conferencing, AI-powered productivity, project management, and cloud storage in one unified platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only use ClerkProvider if we have the required keys
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );

  if (clerkPublishableKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#6B46C1',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorInputBackground: '#ffffff',
            borderRadius: '0.5rem',
          },
          elements: {
            formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90',
            card: 'shadow-xl',
          }
        }}
      >
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
