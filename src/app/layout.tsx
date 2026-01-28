import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TeamPost - Turn Your Entire Company Into a LinkedIn Content Machine",
  description: "Transform voice notes into engaging LinkedIn posts. Help your team build their personal brand with AI-powered content creation.",
  keywords: ["LinkedIn", "content creation", "AI", "voice notes", "personal branding", "employee advocacy"],
  authors: [{ name: "TeamPost" }],
  openGraph: {
    title: "TeamPost - Turn Your Entire Company Into a LinkedIn Content Machine",
    description: "Transform voice notes into engaging LinkedIn posts with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-claude-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
