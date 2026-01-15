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
  
  // Sözlüğü güvenli tip ile yüklüyoruz
  const dict = await getDictionary(lang as ValidLangs);

  // TİP DÜZELTMELERİ: TypeScript'in dinamik anahtarları kabul etmesini sağlıyoruz
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
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic">
          {/* subjectsDict kullanarak güvenli erişim */}
          {subjectsDict?.[subject] || subject} - {level.toUpperCase()}
        </h1>
        
        <div className="grid gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/${lang}/${subject}/${level}/${cat}`} 
              className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] hover:bg-amber-500 hover:text-black transition-all flex justify-between items-center group"
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {/* categoriesDict kullanarak güvenli erişim */}
                {categoriesDict?.[cat] || cat.toUpperCase()}
              </span>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">{cat} →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href={`/${lang}/${subject}`} className="text-slate-500 hover:text-white font-bold italic">
            ← {dict.navigation?.back || 'Back'}
          </Link>
        </div>
      </div>
    </main>
  );
}