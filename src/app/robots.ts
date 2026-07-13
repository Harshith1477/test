import type { MetadataRoute } from "next";

const DOMAIN = "https://recolt.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/onboard", "/api"],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
