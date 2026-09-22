import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Images added from the control panel can be pasted as links from any https website.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
