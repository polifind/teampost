import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/posts/", "/magic-drafts/", "/settings/", "/create/", "/onboarding/"],
      },
    ],
    sitemap: "https://teampost.ai/sitemap.xml",
  };
}
