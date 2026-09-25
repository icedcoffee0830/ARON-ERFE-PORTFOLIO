import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // picsum.photos serves the placeholder imagery until real project images land in /public/work.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
