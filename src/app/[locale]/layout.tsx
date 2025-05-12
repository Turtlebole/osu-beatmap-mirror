import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <>
      <Navbar locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer locale={locale} />
    </>
  );
}