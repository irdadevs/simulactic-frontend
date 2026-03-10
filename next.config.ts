import type { NextConfig } from "next";
import { publicEnv } from "./src/config/env";

const apiBaseUrl = publicEnv.apiBaseUrl;

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
