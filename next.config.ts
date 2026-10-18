import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Faqat backend media'si optimallashtiriladi; boshqa hostlar SafeImage'da `unoptimized`.
    remotePatterns: [{ protocol: "https", hostname: "mytizim.uz", pathname: "/media/**" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200],
    imageSizes: [48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
