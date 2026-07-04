import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { RegionProvider } from "@/components/shell/region-provider";
import { getServingRegion } from "@/lib/regions.server";
import "./globals.css";

// Fonts are vendored locally (app/fonts) and self-hosted — the build reaches no
// external CDN, keeping the whole pipeline consistent with the air-gapped claim.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
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
