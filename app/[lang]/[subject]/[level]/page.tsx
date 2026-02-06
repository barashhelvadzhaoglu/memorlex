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

  const seoData: Record<string, { title: string, description: string }> = {
    tr: {
      title: `${subName} ${upperLvl} Seviyesi Tüm Üniteler | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi üniteleri ve kelime listeleri.`
    },
    en: {
      title: `${subName} ${upperLvl} All Units | Memorlex`,
      description: `Study ${subName} ${upperLvl} units and vocabulary lists.`
    },
    uk: {
      title: `${subName} ${upperLvl} Усі розділи | Memorlex`,
      description: `Вивчайте ${subName} ${upperLvl} за розділами.`
    },
    de: {
      title: `${subName} ${upperLvl} Alle Einheiten | Memorlex`,
      description: `Lerne ${subName} auf dem Niveau ${upperLvl}.`
    }
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
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

  // Stories etiketleri (UI diline göre)
  const storiesTitle =
    dict?.stories?.title ||
    (lang === "tr" ? "HİKÂYELER" : lang === "de" ? "GESCHICHTEN" : "STORIES");

  const storiesSub =
    lang === "tr" ? "stories →" : lang === "de" ? "stories →" : "stories →";

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-amber-500">
          {subjectsDict?.[subject] || subject} - {level.toUpperCase()}
        </h1>

        <div className="grid gap-6">

          {/* ✅ STORIES CARD (EN ÜSTTE) */}
          <Link
            href={`/${lang}/${subject}/${level}/stories`}
            className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                       bg-slate-50 border-slate-200 text-slate-900
                       dark:bg-slate-900 dark:border-slate-800 dark:text-white
                       hover:bg-amber-500 hover:text-black hover:border-amber-500
                       border-2 shadow-sm"
          >
            <span className="text-2xl font-black uppercase tracking-widest">
              📖 {storiesTitle}
            </span>
            <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">
              {storiesSub}
            </span>
          </Link>

          {/* ✅ MEVCUT KATEGORİLER */}
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
