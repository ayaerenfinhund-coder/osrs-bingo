import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.osrsbox.com',
        port: '',
        pathname: '/osrsbox-db/items-icons/**',
      },
      {
        protocol: 'https',
        hostname: 'oldschool.runescape.wiki',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
