import type { MetadataRoute } from "next";
import { publicEnv } from "../config/env";

const staticRoutes = [
  "",
  "/login",
  "/signup",
  "/terms",
  "/privacy-policy",
  "/donations",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: `${publicEnv.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
