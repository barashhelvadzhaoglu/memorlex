import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Statik çıktı üretilmesini sağlar. 
  output: 'export', 

  // 2. Logo ve görsellerin Cloudflare Pages'te görünmesi için kritik ayar.
  images: {
    unoptimized: true,
  },

  // 3. URL sonuna '/' ekleyerek yönlendirme uyumluluğunu artırır.
  trailingSlash: true,
};

export default nextConfig;