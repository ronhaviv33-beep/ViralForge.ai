import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/i18n-provider";
import { dirFor } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ViralForge — Turn One Idea Into 30 Days Of Content",
  description:
    "Generate captions, hooks, hashtags, posts and content ideas instantly. Turn one idea, transcript, or piece of text into a complete content package.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "ViralForge — Turn One Idea Into 30 Days Of Content",
    description:
      "Generate captions, hooks, hashtags, posts and content ideas instantly.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={dirFor(locale)} className="dark">
      <body className={`${inter.variable} font-sans`}>
        <I18nProvider locale={locale}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
