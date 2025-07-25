'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../context/AuthContext";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Gopher Marketplace</title>
        <meta name="description" content="A marketplace for UMN students" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F7F6F1]`}
      >
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-maroon hover:text-red-700 transition-colors">Gopher Marketplace</Link>
                <Link href="/" className="text-gray-700 hover:text-maroon transition-colors font-medium">Dashboard</Link>
                <Link href="/listings/create" className="text-gray-700 hover:text-maroon transition-colors font-medium">Create Listing</Link>
                <Link href="/listings" className="text-gray-700 hover:text-maroon transition-colors font-medium">Show Listings</Link>
                <Link href="/profile" className="text-gray-700 hover:text-maroon transition-colors font-medium">Profile</Link>
              </div>
            </div>
          </div>
        </nav>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
