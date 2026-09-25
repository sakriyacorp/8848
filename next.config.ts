import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 85],
  },
  // reference-code/ is read-only reference material; tsconfig + eslint exclude it and
  // nothing under src/ imports from it, so it never reaches the bundle.
  outputFileTracingExcludes: {
    "*": ["reference-code/**", "assets/**", "shots/**"],
  },
};

export default nextConfig;
