import Link from 'next/link';
import { getDictionary } from '@/dictionaries';

// 1. Tip Tanımlaması (TypeScript hatasını önlemek için)
type ValidLangs = "en" | "tr" | "de" | "uk";

// 2. Statik Parametre Üretici (Cloudflare/Export hatasını çözen kısım)
// Bu fonksiyon build sırasında çalışır ve Next.js'e hangi dilleri oluşturacağını söyler.
export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' },
    { lang: 'de' },
    { lang: 'uk' }
  ];
}

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // TypeScript'e lang'in desteklenen dillerden biri olduğunu garanti ediyoruz (as ValidLangs)
  const dict = await getDictionary(lang as ValidLangs);

  const subjects = [
    { id: 'german', native: 'Deutsch', flag: '🇩🇪' },
    { id: 'english', native: 'English', flag: '🇬🇧' }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black mb-2 uppercase italic tracking-tighter text-center">
        {dict.home?.title || "Which Language?"}
      </h1>
      <p className="text-slate-500 mb-12 font-bold text-center">
        {dict.home?.sub || "Select a target."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {subjects.map((s) => (
          <Link 
            key={s.id} 
            href={`/${lang}/${s.id}`} 
            className="p-10 bg-slate-900 border border-slate-800 rounded-[40px] hover:border-amber-500 transition-all text-center group"
          >
            <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">
              {s.flag}
            </span>
            
            <span className="text-2xl font-black block">
              {dict.subjects?.[s.id] || s.id}
            </span>
            
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {s.native}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}