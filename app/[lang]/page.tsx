import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

// ✅ Desteklenen diller
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'tr' },
    { lang: 'de' },
    { lang: 'uk' },
    { lang: 'es' }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  
  return { 
    title: `Memorlex | ${dict.title}`, 
    description: dict.description 
  };
}

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center p-6 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mt-16 mb-16">
        <h1 className="text-7xl font-black mb-6 uppercase italic tracking-tighter text-amber-500">
          Memorlex
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
          {dict.home?.title}
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
          {dict.home?.sub}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {['A1', 'A2', 'B1', 'Integration'].map((tag) => (
            <span key={tag} className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black uppercase">
              #{tag}
            </span>
          ))}
        </div>
      </section>
      
      {/* Subject Selection (German / English Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-24">
        {[
          { id: 'german', flag: '🇩🇪' },
          { id: 'english', flag: '🇬🇧' }
        ].map((subject) => (
          <Link 
            key={subject.id} 
            href={`/${lang}/${subject.id}`} 
            className="group p-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] hover:border-amber-500 transition-all shadow-xl text-center"
          >
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
              {subject.flag}
            </span>
            <span className="text-2xl font-black uppercase tracking-widest">
              {/* @ts-ignore - JSON keys are dynamic */}
              {dict.subjects?.[subject.id]} {dict.start}
            </span>
          </Link>
        ))}
      </div>

      {/* Footer / Features Section */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 dark:border-slate-800 pt-16 mb-20">
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase tracking-tight text-amber-500">
            {dict.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
            {dict.description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { icon: '⌨️', label: dict.practice },
            // ✅ Düzeltme: Hata veren flashcardsLabel yerine flashcards.flip veya sabit bir string kullanıldı
            { icon: '🖼️', label: (dict as any).flashcardsLabel || "Flashcards" },
            { icon: '📚', label: dict.categories?.integration },
            { icon: '🚀', label: dict.start }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-transparent hover:border-amber-500/20 transition-colors">
              <span className="text-3xl mb-2 block">{item.icon}</span>
              <span className="font-bold block text-[10px] md:text-xs uppercase text-slate-500 leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}