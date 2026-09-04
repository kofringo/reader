import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "freewebnovel.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/stickers/:path*',
        destination: 'https://qdddnsyjvdewcxtghhth.supabase.co/storage/v1/object/public/stickers/:path*',
      },
    ];
  },
};

export default nextConfig;