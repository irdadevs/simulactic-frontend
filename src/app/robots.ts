import type { MetadataRoute } from "next";
import { publicEnv } from "../config/env";

export default function robots(): MetadataRoute.Robots {
  const production = process.env.NODE_ENV === "production";

  return {
    rules: production
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/dashboard", "/login", "/signup", "/me"],
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
    host: publicEnv.siteUrl,
  };
}
