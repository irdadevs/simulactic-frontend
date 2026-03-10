import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8080"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://simulactic.app"),
  NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug"])
    .default("warn"),
});

const parsedEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED: process.env.NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid public environment configuration: ${parsedEnv.error.message}`);
}

export const publicEnv = {
  apiBaseUrl: parsedEnv.data.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, ""),
  siteUrl: parsedEnv.data.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ""),
  trafficTrackingEnabled: parsedEnv.data.NEXT_PUBLIC_TRAFFIC_TRACKING_ENABLED,
  logLevel: parsedEnv.data.NEXT_PUBLIC_LOG_LEVEL,
} as const;
