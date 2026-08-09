import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Web Novel Reader",
    default: "Read Novels Online For Free - Web Novel Reader",
  },
  description: "Read the best light novels, web novels, and translated novels online for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#121212" />
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(s){s.dataset.zone='11539685',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))",
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 min-h-screen flex flex-col justify-between transition-colors duration-200`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Global Navigation Header with Center Search */}
          <Suspense fallback={<div className="h-16 border-b border-gray-800 bg-gray-900" />}>
            <Navbar />
          </Suspense>

          {/* Main Page Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Global Footer */}
          <Footer />

          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}