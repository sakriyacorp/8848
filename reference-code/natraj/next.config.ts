import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    remotePatterns: [{ protocol: "https", hostname: "**.googleusercontent.com" }],
  },
};

export default nextConfig;
