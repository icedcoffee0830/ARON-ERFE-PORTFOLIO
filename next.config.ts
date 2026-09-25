import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // picsum.photos serves the placeholder imagery until real project images land in /public/work.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  // Uploaded SVG logos can never run scripts, even when opened directly.
  async headers() {
    return [
      {
        source: "/:file(logo.*\\.svg)",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" },
        ],
      },
    ];
  },
};

export default nextConfig;
