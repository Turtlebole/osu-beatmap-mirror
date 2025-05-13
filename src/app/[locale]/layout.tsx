export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "osu!mirror - Beatmap Mirror for osu!",
  description: "Find and download your favorite osu! beatmaps easily.",
};

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout(props: LayoutProps) {
  const { locale: rawLocale } = await Promise.resolve(props.params);
  
  const locale = rawLocale.split('-')[0];
  
  return (
    <>
      <Navbar locale={locale} />
      <main className="flex-grow">{props.children}</main>
      <Footer locale={locale} />
    </>
  );
}