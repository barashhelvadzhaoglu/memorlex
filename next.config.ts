import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Statik çıktı üretilmesini sağlar. 
  // Bu sayede 'fs' modülü hatalarını build aşamasında çözeriz.
  output: 'export', 

  // 2. Statik export modunda resim optimizasyonu sunucu gerektirdiği için 
  // Cloudflare Pages'te 'unoptimized' yapmamız gerekir.
  images: {
    unoptimized: true,
  },

  // 3. Eğer projende trailing slash (URL sonundaki /) kullanımıyla ilgili 
  // yönlendirme sorunları yaşarsan bunu aktif edebilirsin.
  trailingSlash: true,
};

export default nextConfig;