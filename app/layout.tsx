import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { RegionProvider } from "@/components/shell/region-provider";
import { getServingRegion } from "@/lib/regions.server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enclave — Sovereign Clinical AI",
  description:
    "Clinical AI that never leaves the country. Note summarization, coding, and medical-image triage processed entirely in-region on Vultr Sovereign Cloud.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const region = await getServingRegion();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RegionProvider initialRegionId={region.id}>{children}</RegionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
