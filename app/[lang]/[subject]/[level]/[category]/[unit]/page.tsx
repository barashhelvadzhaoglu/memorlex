import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from '@/app/components/UnitClientWrapper';
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

// ✅ SEO - Sayfaya Özel Metadata Üretimi
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

// ✅ Statik Parametre Üretici
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

// ✅ Sayfa Bileşeni
export default async function UnitPage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  
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

  // Dile gore youtubeId sec
  const youtubeId = data[`youtubeId_${lang}`] || data.youtubeId || null;

  // Video schema
  const videoSchema = youtubeId ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: data.title || unit,
    description: `${subject} ${level} vocabulary video for ${unit}`,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    uploadDate: new Date().toISOString(),
  } : null;

  const subjectLabel = subject === 'german' ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : lang === 'de' ? 'Deutsch' : 'German')
    : subject === 'spanish' ? (lang === 'tr' ? 'İspanyolca' : lang === 'es' ? 'Español' : lang === 'de' ? 'Spanisch' : 'Spanish')
    : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : lang === 'de' ? 'Englisch' : 'English');

  return (
    <div className="unit-page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 pt-6 pb-0">
        <ol className="flex flex-wrap items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <li><a href={`/${lang}/${subject}`} className="hover:text-amber-500 transition-colors">{subjectLabel}</a></li>
          <li className="text-slate-300">/</li>
          <li><a href={`/${lang}/${subject}/${level}`} className="hover:text-amber-500 transition-colors">{level.toUpperCase()}</a></li>
          <li className="text-slate-300">/</li>
          <li><a href={`/${lang}/${subject}/${level}/${category}`} className="hover:text-amber-500 transition-colors">{category}</a></li>
          <li className="text-slate-300">/</li>
          <li className="text-amber-500">{unit.replace(/-/g, ' ')}</li>
        </ol>
      </nav>

      {youtubeId && (
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
          <div className="aspect-video w-full rounded-[24px] overflow-hidden shadow-2xl bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={data.title || unit}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <Suspense fallback={
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="text-2xl font-black italic uppercase animate-pulse text-amber-500">
            Memorlex...
          </div>
        </div>
      }>
        <UnitClientWrapper 
          initialData={data} 
          dict={dict} 
          lang={lang} 
          unitName={unit} 
          subject={subject}
        />
      </Suspense>
      
      {/* Diger konular */}
      <div className="max-w-3xl mx-auto px-4 mt-16">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          {lang === 'tr' ? `Diğer ${level.toUpperCase()} Konuları` 
           : lang === 'es' ? `Otros temas ${level.toUpperCase()}`
           : lang === 'de' ? `Andere ${level.toUpperCase()} Themen`
           : `Other ${level.toUpperCase()} Topics`}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(() => {
            const fs = require('fs');
            const path = require('path');
            const topicDir = path.join(process.cwd(), 'src', 'data', 'vocabulary',
              subject === 'german' ? 'de' : subject === 'spanish' ? 'es' : 'en',
              level, category);
            if (!fs.existsSync(topicDir)) return null;
            return fs.readdirSync(topicDir)
              .filter((f: string) => f.endsWith('.json') && f.replace('.json','') !== unit)
              .slice(0, 12)
              .map((f: string) => {
                const slug = f.replace('.json','');
                return (
                  <a key={slug}
                     href={`/${lang}/${subject}/${level}/${category}/${slug}`}
                     className="px-3 py-1.5 text-xs font-bold uppercase rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-colors">
                    {slug.replace(/-/g, ' ')}
                  </a>
                );
              });
          })()}
        </div>
      </div>

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
    </div>
  );
}
