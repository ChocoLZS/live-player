import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

setupDevPlatform().catch(console.error);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-d1']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
