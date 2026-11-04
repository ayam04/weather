import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/**": ["./data/city/**", "./data/climate/**"],
  },
  async headers() {
    return [
      {
        source: "/data/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
