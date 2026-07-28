import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "freewebnovel.com",
      },
      // You can add wildcard support for subdomains or any other image hosts here
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;