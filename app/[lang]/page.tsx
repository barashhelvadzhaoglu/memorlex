import Link from 'next/link';
import { getDictionary } from '@/dictionaries';

type ValidLangs = "en" | "tr" | "de" | "uk";

// --- EKLEMEN GEREKEN KISIM BAŞLIYOR ---
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'tr' },
    { lang: 'de' },
    { lang: 'uk' }
  ];
}
// --- EKLEMEN GEREKEN KISIM BİTTİ ---

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  const subjects = [
    { id: 'german', name: dict.subjects?.german || 'German', flag: '🇩🇪' },
    { id: 'english', name: dict.subjects?.english || 'English', flag: '🇬🇧' },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-black mb-4 uppercase italic tracking-tighter text-amber-500">
        Memorlex
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-12 font-bold italic text-xl">
        {dict.home?.title || "Choose your language:"}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {subjects.map((s) => (
          <Link 
            key={s.id} 
            href={`/${lang}/${s.id}`} 
            className="p-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[48px] hover:border-amber-500 transition-all group relative overflow-hidden shadow-xl"
          >
            <span className="text-7xl block mb-6 transform group-hover:scale-110 transition-transform">
              {s.flag}
            </span>
            <span className="text-3xl font-black uppercase tracking-widest block group-hover:text-amber-500">
              {s.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}