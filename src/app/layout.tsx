import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
