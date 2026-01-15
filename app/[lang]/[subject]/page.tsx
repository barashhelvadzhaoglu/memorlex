import Link from 'next/link';
import { getDictionary } from '@/dictionaries';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const subjects = ['german', 'english'];

  const params = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      params.push({ lang, subject });
    }
  }
  return params;
}

export default async function SubjectPage({ params }: { params: Promise<{ lang: string, subject: string }> }) {
  const { lang, subject } = await params;

  const dict = await getDictionary(lang as ValidLangs);

  // KRİTİK DÜZELTME: TypeScript'e bu objenin dinamik anahtarlarla okunabileceğini söylüyoruz
  const subjectsDict = dict.subjects as Record<string, string> | undefined;

  const levels = ['a1', 'a2', 'b1'];

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-black mb-4 uppercase italic">
          {/* subjectsDict kullanarak güvenli erişim sağlıyoruz */}
          {subjectsDict?.[subject] || subject}
        </h1>
        
        <p className="text-slate-400 mb-12 font-bold italic text-xl">
          {dict.levels?.selectTitle || "Please select a level:"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <Link 
              key={lvl} 
              href={`/${lang}/${subject}/${lvl}`} 
              className="p-10 bg-slate-900 border border-slate-800 rounded-[40px] hover:border-amber-500 transition-all text-center group"
            >
              <span className="text-4xl font-black block uppercase group-hover:text-amber-500 transition-colors">
                {lvl}
              </span>
              <span className="text-sm text-slate-500 block mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {dict.start} →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href={`/${lang}`} className="text-slate-600 hover:text-white transition-colors font-bold">
            ← {dict.navigation?.back || "Back"}
          </Link>
        </div>
      </div>
    </main>
  );
}