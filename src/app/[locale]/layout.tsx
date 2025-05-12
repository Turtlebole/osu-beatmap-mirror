import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
  title: "osu!mirror - Beatmap Mirror for osu!",
  description: "Find and download your favorite osu! beatmaps easily.",
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Normalize locale to ensure it's just the base code (e.g., 'en' from 'en-US')
  const locale = params.locale.split('-')[0];
  
  return (
    <html lang={locale} className={fontClasses} suppressHydrationWarning>
      <head>
        {/* Force dark mode */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.documentElement.classList.add('dark');
        `}} />
      </head>
      <body className="antialiased min-h-screen flex flex-col dark">
        <Navbar locale={locale} />
        <main className="flex-grow">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}