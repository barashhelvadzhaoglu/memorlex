// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPPORTED = ['tr', 'de', 'uk', 'es', 'en'];

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
    const matched = SUPPORTED.includes(browserLang) ? browserLang : 'en';
    router.replace(`/${matched}`);
  }, []);

  return null; // ya da küçük bir loading spinner
}