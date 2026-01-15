'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const supportedLanguages = ['tr', 'en', 'de', 'uk'];
    const browserLang = navigator.language.split('-')[0];
    const target = supportedLanguages.includes(browserLang) ? browserLang : 'en';
    router.replace(`/${target}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
    </div>
  );
}