import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

// Load fonts with static class names that won't change between renders
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap", 
  variable: "--font-geist-mono",
});

// Make class names static strings
const fontClasses = `${geistSans.variable} ${geistMono.variable}`;

export const metadata: Metadata = {
  title: "osu!mirror - Beatmap Mirror",
  description: "Find and download your favorite osu! beatmaps easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={fontClasses} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col dark">
        {/* Force dark mode using next/script for better hydration */}
        <Script id="dark-mode-script" strategy="beforeInteractive">
          {`document.documentElement.classList.add('dark');`}
        </Script>
        
        {children}
      </body>
    </html>
  );
}
