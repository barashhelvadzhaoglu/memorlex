import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { Metadata } from 'next';

// ✅ Desteklenen diller
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// Dinamik Keyword Üretici
const getUnitKeywords = (unitName: string, subject: string, level: string, lang: string) => {
  const common = ["memorlex", "flashcards", "vocabulary builder", "language learning app", "writing practice"];
  const subjectSpecific: Record<string, string[]> = {
    german: ["#learngerman", "#deutschkurs", "vokabeln", "almanca öğren"],
    english: ["#learnenglish", "#englishgrammar", "ielts", "toefl"],
    spanish: ["#learnspanish", "#vocabulario", "dele", "español"]
  };
  return [unitName, `${unitName} ${subject}`, `${subject} ${level}`, ...(subjectSpecific[subject] || []), ...common];
};

// ✅ SEO - Metadata Üretimi (Category Parametresi Eklendi)
export async function generateMetadata({ params }: { params: Promise<any> }): Promise<Metadata> {
  const { lang, subject, level, category, unit } = await params; // 👈 Category buraya eklendi
  const baseUrl = 'https://memorlex.com';
  const unitName = unit.replace(/-/g, ' ');
  
  const subjectName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (subject === 'spanish' ? (lang === 'tr' ? 'İspanyolca' : lang === 'es' ? 'Español' : 'Spanish') : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English'));

  const titles: Record<string, string> = {
    tr: `${unitName} - ${subjectName} ${level.toUpperCase()} | Memorlex`,
    en: `${unitName} - Learn ${subjectName} ${level.toUpperCase()} | Memorlex`,
    de: `${unitName} - Vokabeln ${subjectName} ${level.toUpperCase()} | Memorlex`,
    es: `${unitName} - Vocabulario ${subjectName} ${level.toUpperCase()} | Memorlex`
  };

  const currentTitle = titles[lang] || titles.en;

  return {
    title: currentTitle,
    keywords: getUnitKeywords(unitName, subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}/${category}/${unit}`, // 👈 URL yapısı düzeltildi
      languages: {
        'tr': `${baseUrl}/tr/${subject}/${level}/${category}/${unit}`,
        'en': `${baseUrl}/en/${subject}/${level}/${category}/${unit}`,
        'de': `${baseUrl}/de/${subject}/${level}/${category}/${unit}`,
        'es': `${baseUrl}/es/${subject}/${level}/${category}/${unit}`,
      }
    }
  };
}

// ✅ Statik Parametre Üretici
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  const learningLanguages = ['de', 'en', 'es']; 

  for (const subDir of learningLanguages) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.existsSync(subjectPath)) continue;
    
    const subjectParam = subDir === 'de' ? 'german' : (subDir === 'es' ? 'spanish' : 'english');
    const levels = fs.readdirSync(subjectPath).filter(f => fs.lstatSync(path.join(subjectPath, f)).isDirectory());

    for (const lvl of levels) {
      const levelPath = path.join(subjectPath, lvl);
      const categories = fs.readdirSync(levelPath).filter(f => fs.lstatSync(path.join(levelPath, f)).isDirectory());

      for (const cat of categories) {
        const catPath = path.join(levelPath, cat);
        const units = fs.readdirSync(catPath).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));

        for (const unit of units) {
          for (const lang of languages) {
            paths.push({ lang, subject: subjectParam, level: lvl, category: cat, unit: unit });
          }
        }
      }
    }
  }
  return paths;
}

// ✅ Sayfa Bileşeni (Hata Korumalı)
export default async function UnitPage({ params }: { params: Promise<any> }) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  
  // 🛡️ API Key sızıntısı varsa getVocab patlayabilir, try-catch ile koru
  let data = null;
  try {
    data = await getVocab(lang, subject, level, category, unit);
  } catch (error) {
    console.error("Vocab Loading Error:", error);
  }
  
  if (!data) return notFound();

  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black animate-pulse text-amber-500">MEMORLEX...</div>}>
        <UnitClientWrapper initialData={data} dict={dict} lang={lang} unitName={unit} />
      </Suspense>
    </>
  );
}