import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
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
  title: "Web Novel Reader",
  description: "Read your favorite web novels online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200`}>
        
        {/* Global Navigation Header with Center Search */}
        <Suspense fallback={<div className="h-16 border-b border-gray-800 bg-gray-900" />}>
          <Navbar />
        </Suspense>

        {/* Main Page Content */}
        <div className="flex-1">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  );
}