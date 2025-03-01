import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAnalyticsProvider } from "@/components/firebase-analytics-provider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValidateMe - Validate Your Business Ideas",
  description:
    "Create polls to validate your business ideas and get valuable feedback from your audience.",
  keywords: [
    "business validation",
    "idea validation",
    "polls",
    "feedback",
    "market research",
    "customer feedback",
    "survey",
  ],
  openGraph: {
    type: "website",
    title: "ValidateMe - Validate Your Business Ideas",
    description:
      "Create polls to validate your business ideas and get valuable feedback from your audience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.className
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={null}>
            <FirebaseAnalyticsProvider>
              <Toaster />
              {children}
            </FirebaseAnalyticsProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
