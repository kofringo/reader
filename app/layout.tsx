import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] text-gray-100 min-h-screen flex flex-col`}>
        
        {/* Global Main Menu / Header */}
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md group-hover:bg-blue-500 transition">
                W
              </div>
              <div>
                <span className="font-extrabold text-lg text-white group-hover:text-blue-400 transition">
                  Web Novel Reader
                </span>
                <p className="text-[10px] text-green-400 font-medium -mt-1">
                  ✓ Connected to Supabase
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-xs font-semibold text-gray-300 hover:text-white transition"
              >
                Home
              </Link>
              <Link
                href="/auth"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <div className="flex-1">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  );
}