import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const subjects = ['german', 'english'];
  const levels = ['a1', 'a2', 'b1'];
  const categories = ['integration', 'topic', 'work']; 

  const paths = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      for (const level of levels) {
        for (const category of categories) {
          paths.push({ lang, subject, level, category });
        }
      }
    }
  }
  return paths;
}

export default async function CategoryPage({ params }: { params: Promise<{ lang: string, subject: string, level: string, category: string }> }) {
  const { lang, subject, level, category } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  const targetLang = subject === 'german' ? 'de' : subject;
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level, category);
  
  let units: string[] = [];
  if (fs.existsSync(dataPath)) {
    units = fs.readdirSync(dataPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  const categoriesDict = dict.categories as Record<string, string> | undefined;

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black mb-8 uppercase italic text-amber-500 tracking-tighter flex items-center gap-2">
          📚 {categoriesDict?.[category] || category} {dict.units?.listTitle || "Listesi"}
        </h1>

        {/* Grid yapısını 2'den 3'e (büyük ekranlarda 4'e) çıkardım, gap'i daralttım */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {units.map((unit) => (
            <Link 
              key={unit} 
              href={`/${lang}/${subject}/${level}/${category}/${unit}`} 
              // Padding'i p-8'den p-4'e düşürdüm, rounded değerini yumuşattım
              className="p-4 md:p-5 rounded-2xl transition-all font-bold text-sm md:text-base uppercase border-2
                         bg-slate-50 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md text-center"
            >
              {unit.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
        
        <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link 
            href={`/${lang}/${subject}/${level}`} 
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white transition-colors font-black uppercase text-xs tracking-widest flex items-center gap-2"
          >
            ← {dict.navigation?.back || "Geri Dön"}
          </Link>
        </div>
      </div>
    </main>
  );
}