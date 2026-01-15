import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk";

// SEO Meta Veri Üretici
export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }): Promise<Metadata> {
  const { lang, subject, level } = await params;
  
  const subName = subject === 'german' ? (lang === 'tr' ? 'Almanca' : 'German') : (lang === 'tr' ? 'İngilizce' : 'English');
  const upperLvl = level.toUpperCase();
  
  const seoData = {
    tr: {
      title: `${subName} ${upperLvl} Seviyesi Tüm Üniteler ve Kelimeler | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi üniteleri (Kapiteller). Entegrasyon kursu kelime listeleri, flashcardlar ve yazarak öğrenme modülü.`
    },
    en: {
      title: `${subName} ${upperLvl} All Units and Vocabulary Lists | Memorlex`,
      description: `Study ${subName} ${upperLvl} units. Access vocabulary lists for all chapters, practice with flashcards and writing drills.`
    },
    uk: {
      title: `${subName} ${upperLvl} Усі розділи та словник | Memorlex`,
      description: `Вивчайте ${subName} ${upperLvl} за розділами. Списки слів для всіх глав, картки та вправи для написання.`
    }
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    // Örn: "Almanca A1 üniteleri", "German A1 vocabulary chapters"
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
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* H1 SEO Vurgusu */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-amber-500">
            {subjectsDict?.[subject] || subject} {level.toUpperCase()}
          </h1>
          <p className="mt-2 text-slate-500 font-bold italic">
            {lang === 'tr' ? 'Ünite Bazlı Kelime Çalışma Listeleri' : 'Unit-Based Vocabulary Study Lists'}
          </p>
        </div>
        
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
              <div className="flex flex-col">
                <span className="text-2xl font-black uppercase tracking-widest">
                  {categoriesDict?.[cat] || cat.toUpperCase()}
                </span>
                <span className="text-xs font-bold opacity-60 group-hover:text-black uppercase">
                  {subjectsDict?.[subject]} {level.toUpperCase()}
                </span>
              </div>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">{cat} →</span>
            </Link>
          ))}
        </div>

        {/* SEO Alt Bilgi Bölümü */}
        <section className="mt-20 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-black uppercase tracking-widest mb-4">
               {lang === 'tr' ? 'Neden Ünite (Kapitel) Bazlı Çalışmalısınız?' : 'Why Study by Units?'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed italic">
                {lang === 'tr' ? (
                    `Almanca öğrenme sürecinde, özellikle Entegrasyon Kursları ${level.toUpperCase()} müfredatındaki her bir Kapitel (ünite), belirli bir konuya (Örn: Kapitel 16 - Noel Pazarı) odaklanır. Memorlex, bu üniteleri parçalara ayırarak kelime ezberlemeyi kolaylaştırır ve yazarak öğrenme moduyla öğrendiklerinizi pekiştirmenizi sağlar.`
                ) : (
                    `Studying vocabulary by units (Chapters) helps you focus on specific topics. Our ${level.toUpperCase()} curriculum is designed to help you master each unit with interactive writing exercises and flashcards.`
                )}
            </p>
        </section>

        <div className="mt-10">
          <Link href={`/${lang}/${subject}`} className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white font-bold italic transition-colors">
            ← {dict.navigation?.back || 'Back'}
          </Link>
        </div>
      </div>
    </main>
  );
}