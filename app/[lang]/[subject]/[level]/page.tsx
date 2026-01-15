import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }): Promise<Metadata> {
  const { lang, subject, level } = await params;
  
  const subName = subject === 'german' ? (lang === 'tr' ? 'Almanca' : 'German') : (lang === 'tr' ? 'İngilizce' : 'English');
  const upperLvl = level.toUpperCase();
  
  // HATA BURADAYDI: 'de' anahtarını ekledim.
  const seoData: Record<string, { title: string, description: string }> = {
    tr: {
      title: `${subName} ${upperLvl} Seviyesi Tüm Üniteler ve Kelimeler | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi üniteleri. Entegrasyon kursu kelime listeleri ve yazarak öğrenme modülü.`
    },
    en: {
      title: `${subName} ${upperLvl} All Units and Vocabulary Lists | Memorlex`,
      description: `Study ${subName} ${upperLvl} units. Access vocabulary lists for all chapters and practice writing.`
    },
    uk: {
      title: `${subName} ${upperLvl} Усі розділи та словник | Memorlex`,
      description: `Вивчайте ${subName} ${upperLvl} за розділами. Списки слів для всіх глав та вправи.`
    },
    de: {
      title: `${subName} ${upperLvl} Alle Einheiten und Vokabeln | Memorlex`,
      description: `Lerne ${subName} auf dem Niveau ${upperLvl}. Vokabellisten für alle Kapitel und Schreibtraining.`
    }
  };

  const current = seoData[lang] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: [`${subName} ${upperLvl} üniteleri`, `${subName} ${upperLvl} kelimeleri`, "kapitel listesi", "yazarak öğren"]
  };
}

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
  return params; // Eğer hata verirse 'return paths;' olarak kalsın
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
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-amber-500">
          {subjectsDict?.[subject] || subject} - {level.toUpperCase()}
        </h1>
        
        <div className="grid gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/${lang}/${subject}/${level}/${cat}`} 
              className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                         bg-slate-50 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:bg-amber-500 hover:text-black hover:border-amber-500
                         border-2 shadow-sm"
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