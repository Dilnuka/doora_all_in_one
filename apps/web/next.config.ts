import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@doora/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
