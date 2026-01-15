"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Hydration hatasını önlemek için bileşen yüklenene kadar bekliyoruz.
  // Bu sayede sayfa yenilendiğinde localStorage'daki tema doğru okunur.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Sayfa yüklenirken içerik titrememesi için şeffaf veya görünmez döndürüyoruz
    return <>{children}</>;
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      storageKey="memorlex-theme"
    >
      {children}
    </ThemeProvider>
  );
}