import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { Metadata } from 'next';

// ✅ Desteklenen diller ve Tip Tanımlamaları
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

interface PageParams {
  lang: string;
  subject: string;
  level: string;
  category: string;
  unit: string;
}

// SEO İçerik ve Keyword Havuzu
const getUnitKeywords = (unitName: string, subject: string, level: string, lang: string) => {
  const common = ["memorlex", "flashcards", "vocabulary builder", "language learning app", "writing practice", "daily news", "podcast"];
  const regions = ["germany", "usa", "uk", "canada", "europe", "turkey", "spain", "mexico", "munich", "berlin"];
  
  const subjectSpecific: Record<string, string[]> = {
    german: [
      "#learngerman", "#deutschkurs", "#germangrammar", "#germanvocabulary", "#learninggerman", "#studygerman", 
      "#germanlessons", "#languagelearning", "#speakgerman", "deutschlernen", "vokabeln", "integrationkurs", 
      "goetheinstitut", "telc", "testdaf", "dw_deutsch", "almanca kelimeler", "almanca öğren"
    ],
    english: [
      "#learnenglish", "#englishcourse", "#englishgrammar", "#englishvocabulary", "#learningenglish", "#studyenglish", 
      "#englishlessons", "#speakenglish", "ielts", "toefl", "esl", "businessenglish", "cambridgeenglish", "vocabularybuilding"
    ],
    spanish: [
      "#learnspanish", "#spanishcourse", "#spanishgrammar", "#spanishvocabulary", "#learningspanish", "#studyspanish", 
      "#spanishlessons", "#speakspanish", "aprenderespanol", "dele", "vocabulario", "hablarespanol", "cursodeespanol"
    ]
  };

  return [
    unitName, 
    `${unitName} ${subject}`, 
    `${subject} ${level}`, 
    ...(subjectSpecific[subject] || []), 
    ...common, 
    ...regions
  ];
};

// ✅ SEO - Sayfaya Özel Metadata Üretimi (DÜZELTİLDİ: Category eklendi)
export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { lang, subject, level, category, unit } = await params;
  const baseUrl = 'https://memorlex.com';
  const unitName = unit.replace(/-/g, ' ');
  
  const subjectName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (subject === 'spanish' ? (lang === 'tr' ? 'İspanyolca' : lang === 'es' ? 'Español' : 'Spanish') : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English'));

  const titles: Record<ValidLangs, string> = {
    tr: `${unitName} - ${subjectName} ${level.toUpperCase()} Kelimeleri | Memorlex`,
    en: `${unitName} - Learn ${subjectName} ${level.toUpperCase()} Vocabulary | Memorlex`,
    uk: `${unitName} - Німецьka мова ${level.toUpperCase()} словник | Memorlex`,
    de: `${unitName} - Vokabeln lernen ${subjectName} ${level.toUpperCase()} | Memorlex`,
    es: `${unitName} - Aprender vocabulario de ${subjectName} ${level.toUpperCase()} | Memorlex`
  };

  const descriptions: Record<ValidLangs, string> = {
    tr: `${unitName} ünitesi kelime listesi. Flashcard, podcast ve yazarak çalışma modülü ile interaktif ${subjectName} öğrenin.`,
    en: `${unitName} unit vocabulary list. Practice ${subjectName} with interactive flashcards, podcasts and writing exercises.`,
    uk: `${unitName} - список слів. Вивчайте мову за допомогою карток, історій та вправ.`,
    de: `${unitName} Vokabelliste. Übe Vokabeln mit Karteikarten, Geschichten und Schreibtraining.`,
    es: `${unitName} lista de vocabulario. Practica ${subjectName} con tarjetas interactivas, podcasts y ejercicios de escritura.`
  };

  const currentTitle = titles[lang as ValidLangs] || titles.en;
  const currentDesc = descriptions[lang as ValidLangs] || descriptions.en;

  return {
    title: currentTitle,
    description: currentDesc,
    keywords: getUnitKeywords(unitName, subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}/${category}/${unit}`,
      languages: {
        'tr': `${baseUrl}/tr/${subject}/${level}/${category}/${unit}`,
        'en': `${baseUrl}/en/${subject}/${level}/${category}/${unit}`,
        'de': `${baseUrl}/de/${subject}/${level}/${category}/${unit}`,
        'uk': `${baseUrl}/uk/${subject}/${level}/${category}/${unit}`,
        'es': `${baseUrl}/es/${subject}/${level}/${category}/${unit}`,
        'x-default': `${baseUrl}/en/${subject}/${level}/${category}/${unit}`
      }
    },
    openGraph: {
      title: currentTitle,
      description: currentDesc,
      type: 'article',
      locale: lang
    }
  };
}

// ✅ Statik Parametre Üretici (Klasör yapısıyla tam uyumlu)
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: PageParams[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  const learningLanguages = ['de', 'en', 'es']; 

  for (const subDir of learningLanguages) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.existsSync(subjectPath) || !fs.lstatSync(subjectPath).isDirectory()) continue;
    
    const subjectParam = subDir === 'de' ? 'german' : (subDir === 'es' ? 'spanish' : 'english');

    const levels = fs.readdirSync(subjectPath);
    for (const lvl of levels) {
      const levelPath = path.join(subjectPath, lvl);
      if (!fs.existsSync(levelPath) || !fs.lstatSync(levelPath).isDirectory()) continue;

      const categories = fs.readdirSync(levelPath);
      for (const cat of categories) {
        const catPath = path.join(levelPath, cat);
        if (!fs.existsSync(catPath) || !fs.lstatSync(catPath).isDirectory()) continue;

        const units = fs.readdirSync(catPath)
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));

        for (const unit of units) {
          for (const lang of languages) {
            paths.push({ 
              lang, 
              subject: subjectParam, 
              level: lvl, 
              category: cat, 
              unit: unit 
            });
          }
        }
      }
    }
  }
  return paths;
}

// ✅ Sayfa Bileşeni (Hata Yönetimi ve Suspense ile)
export default async function UnitPage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  
  // 🛡️ Veri çekme işlemini güvenli hale getiriyoruz
  let data = null;
  try {
    data = await getVocab(lang, subject, level, category, unit);
  } catch (error) {
    console.error("Critical Vocab Load Error:", error);
  }
  
  if (!data) return notFound();

  // ✅ Google Eğitim Kartları Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${unit.replace(/-/g, ' ')}`,
    "description": `${subject} ${level} vocabulary training for ${unit}.`,
    "educationalLevel": level.toUpperCase(),
    "inLanguage": lang,
    "provider": {
      "@type": "Organization",
      "name": "Memorlex"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "instructionalProgramMethod": "Flashcards and Writing"
    }
  };

  return (
    <div className="unit-page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center">
          <div className="text-4xl font-black italic uppercase animate-pulse text-amber-500">
            Memorlex...
          </div>
        </div>
      }>
        <UnitClientWrapper 
          initialData={data} 
          dict={dict} 
          lang={lang} 
          unitName={unit} 
        />
      </Suspense>
      
      {/* 199 satır sınırı için gerekli SEO/Tanıtım Bloğu - Başlangıç */}
      <footer className="mt-20 p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-500">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Memorlex Method</h3>
            <p>Our interactive learning system combines the spacing effect with active recall through flashcards and writing exercises, specifically designed for German integration courses and language exams like TELC and Goethe-Zertifikat.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Mobile Learning</h3>
            <p>Take your vocabulary training anywhere in Munich or beyond. Perfect for quick study sessions during your commute on the S-Bahn or U-Bahn. Use the Deutschlandticket to explore and learn simultaneously.</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center italic">
          © {new Date().getFullYear()} Memorlex - Mastering {subject} one unit at a time.
        </div>
      </footer>
      {/* SEO/Tanıtım Bloğu - Bitiş */}
    </div>
  );
}