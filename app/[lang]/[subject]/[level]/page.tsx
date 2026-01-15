import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';

// 1. Tip Tanımlaması
type ValidLangs = "en" | "tr" | "de" | "uk";

// 2. Statik Parametre Üretici
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const subjects = ['german', 'english'];
  const levels = ['a1', 'a2', 'b1'];

  const paths = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      for (const level of levels) {
        paths.push({ lang, subject, level });
      }
    }
  }
  return paths;
}

export default async function LevelPage({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }) {
  const { lang, subject, level } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);

  const subjectsDict = dict.subjects as Record<string, string> | undefined;
  const categoriesDict = dict.categories as Record<string, string> | undefined;

  const targetLang = subject === 'german' ? 'de' : subject;
  
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level);
  
  let categories: string[] = [];
  if (fs.existsSync(dataPath)) {
    categories = fs.readdirSync(dataPath).filter(f => 
      fs.lstatSync(path.join(dataPath, f)).isDirectory()
    );
  }

  return (
    // Ana arka planı hem açık hem koyu moda uyumlu yaptık
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter">
          {subjectsDict?.[subject] || subject} - {level.toUpperCase()}
        </h1>
        
        <div className="grid gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/${lang}/${subject}/${level}/${cat}`} 
              // DÜZELTME BURADA: bg-slate-900 yerine dark:bg-slate-900 ve açık mod için bg-slate-50 eklendi
              className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                         bg-slate-50 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:bg-amber-500 hover:text-black hover:border-amber-500
                         border-2"
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {categoriesDict?.[cat] || cat.toUpperCase()}
              </span>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">{cat} →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href={`/${lang}/${subject}`} className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white font-bold italic transition-colors">
            ← {dict.navigation?.back || 'Back'}
          </Link>
        </div>
      </div>
    </main>
  );
}