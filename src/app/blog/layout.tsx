import type { Metadata } from "next";
import { AUTHOR_BIO } from "./posts";

const SITE_URL = "https://teampost.vercel.app";

export const metadata: Metadata = {
  title: "TeamPost Blog | LinkedIn Strategy, Going Direct & Professional Branding",
  description:
    "Expert insights on LinkedIn content strategy, going direct, ghostwriting, and building your professional brand. Written by Rohan Pavuluri, founder of TeamPost.",
  keywords: [
    "LinkedIn strategy",
    "going direct",
    "LinkedIn ghostwriting",
    "professional branding",
    "LinkedIn content",
    "personal branding",
  ],
  authors: [{ name: AUTHOR_BIO.name, url: AUTHOR_BIO.linkedinUrl }],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "TeamPost Blog | LinkedIn Strategy & Going Direct",
    description:
      "Expert insights on LinkedIn content strategy, going direct, and building your professional brand.",
    type: "website",
    url: `${SITE_URL}/blog`,
    siteName: "TeamPost",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
