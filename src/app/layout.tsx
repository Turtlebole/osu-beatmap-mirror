import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      {children}
    </html>
  );
}
