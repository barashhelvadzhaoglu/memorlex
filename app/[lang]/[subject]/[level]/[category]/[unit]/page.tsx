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

// Dinamik ve Devasa Keyword Üretici
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

// SEO - Sayfaya Özel Metadata Üretimi
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { lang, subject, level, unit } = await params;
  const baseUrl = 'https://memorlex.com';
  const unitName = unit.replace(/-/g, ' ');
  
  const subjectName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (subject === 'spanish' ? (lang === 'tr' ? 'İspanyolca' : lang === 'es' ? 'Español' : 'Spanish') : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English'));

  const titles: Record<ValidLangs, string> = {
    tr: `${unitName} - ${subjectName} ${level.toUpperCase()} Kelimeleri | Memorlex`,
    en: `${unitName} - Learn ${subjectName} ${level.toUpperCase()} Vocabulary | Memorlex`,
    uk: `${unitName} - Німецька мова ${level.toUpperCase()} словник | Memorlex`,
    de: `${unitName} - Vokabeln lernen ${subjectName} ${level.toUpperCase()} | Memorlex`,
    es: `${unitName} - Aprender vocabulario de ${subjectName} ${level.toUpperCase()} | Memorlex`
  };

  const descriptions: Record<ValidLangs, string> = {
    tr: `${unitName} ünitesi kelime listesi. Flashcard, podcast ve yazarak çalışma modülü ile interaktif ${subjectName} öğrenin.`,
    en: `${unitName} unit vocabulary list. Practice ${subjectName} with interactive flashcards, podcasts and writing exercises.`,
    uk: `${unitName} - список слів. Вивчайте німецьку за допомогою карток, історій та вправ.`,
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
      canonical: `${baseUrl}/${lang}/${subject}/${level}/${unit}`, // Kategori path'de varsa buraya eklenmeli
      languages: {
        'tr': `${baseUrl}/tr/${subject}/${level}/${unit}`,
        'en': `${baseUrl}/en/${subject}/${level}/${unit}`,
        'de': `${baseUrl}/de/${subject}/${level}/${unit}`,
        'uk': `${baseUrl}/uk/${subject}/${level}/${unit}`,
        'es': `${baseUrl}/es/${subject}/${level}/${unit}`,
        'x-default': `${baseUrl}/en/${subject}/${level}/${unit}`
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

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  // Öğrenilen diller (Klasör isimlerine göre)
  const learningLanguages = ['de', 'en', 'es']; 

  for (const subDir of learningLanguages) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.existsSync(subjectPath) || !fs.lstatSync(subjectPath).isDirectory()) continue;
    
    // Klasör ismini URL parametresine eşle (de -> german)
    const subjectParam = subDir === 'de' ? 'german' : (subDir === 'es' ? 'spanish' : 'english');

    const levels = fs.readdirSync(subjectPath);
    for (const lvl of levels) {
      const levelPath = path.join(subjectPath, lvl);
      if (!fs.lstatSync(levelPath).isDirectory()) continue;

      const categories = fs.readdirSync(levelPath);
      for (const cat of categories) {
        const catPath = path.join(levelPath, cat);
        if (!fs.lstatSync(catPath).isDirectory()) continue;

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

export default async function UnitPage({ 
  params 
}: { 
  params: Promise<{ lang: string, subject: string, level: string, category: string, unit: string }> 
}) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  const data = await getVocab(lang, subject, level, category, unit);
  
  if (!data) return notFound();

  // ✅ Zenginleştirilmiş Schema Markup (Google Eğitim Kartları İçin)
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${unit.replace(/-/g, ' ')}`,
    "description": `${subject} ${level} vocabulary training for ${unit}.`,
    "educationalLevel": level.toUpperCase(),
    "inLanguage": lang,
    "provider": {
      "@type": "Organization",
      "name": "Memorlex",
      "sameAs": "https://memorlex.com"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "instructionalProgramMethod": "Flashcards and Writing"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white transition-colors duration-300">
          <div className="text-4xl font-black italic uppercase tracking-tighter animate-pulse text-amber-500">
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
    </>
  );
}