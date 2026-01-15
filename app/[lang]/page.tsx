'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Desteklediğin dilleri tanımla
    const supportedLanguages = ['tr', 'en', 'de', 'uk'];
    const defaultLanguage = 'en';

    // 2. Tarayıcı dilini al (örn: 'tr-TR' -> 'tr')
    const browserLang = navigator.language.split('-')[0];

    // 3. Eğer tarayıcı dili destekleniyorsa oraya, yoksa varsayılana yönlendir
    if (supportedLanguages.includes(browserLang)) {
      router.replace(`/${browserLang}`);
    } else {
      router.replace(`/${defaultLanguage}`);
    }
  }, [router]);

  // Yönlendirme sırasında görünecek şık bir yükleme ekranı
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-black italic text-xl tracking-tighter uppercase animate-pulse">
        Memorlex
      </div>
    </div>
  );
}