import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { Metadata } from 'next';

// ✅ "es" eklendi
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// SEO - Sayfaya Özel Metadata Üretimi
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { lang, subject, level, unit } = await params;
  const unitName = unit.replace(/-/g, ' ');
  
  // Özne ismini dile göre ayarla
  const subjectName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (lang === 'es' ? 'Inglés' : 'English');

  const titles: Record<ValidLangs, string> = {
    tr: `${unitName} - ${subjectName} ${level.toUpperCase()} Kelimeleri ve Alıştırmalar`,
    en: `${unitName} - Learn ${subjectName} ${level.toUpperCase()} Vocabulary`,
    uk: `${unitName} - Німецька мова ${level.toUpperCase()} словник`,
    de: `${unitName} - Vokabeln lernen ${subjectName} ${level.toUpperCase()}`,
    es: `${unitName} - Aprender vocabulario de ${subjectName} ${level.toUpperCase()}` // ✅ Eklendi
  };

  const descriptions: Record<ValidLangs, string> = {
    tr: `${unitName} ünitesi kelime listesi. Flashcard ve yazarak çalışma modülü ile interaktif ${subjectName} öğrenin.`,
    en: `${unitName} unit vocabulary list. Practice ${subjectName} with interactive flashcards and writing exercises.`,
    uk: `${unitName} - список слів. Вивчайте німецьку за допомогою карток та вправ.`,
    de: `${unitName} Vokabelliste. Übe Vokabeln mit Karteikarten und Schreibtraining.`,
    es: `${unitName} lista de vocabulario. Practica ${subjectName} con tarjetas interactivas y ejercicios de escritura.` // ✅ Eklendi
  };

  return {
    title: titles[lang as ValidLangs] || titles.en,
    description: descriptions[lang as ValidLangs] || descriptions.en,
    keywords: [`${unitName} kelimeleri`, `${subjectName} ${level}`, "yazarak öğrenme", "flashcard", "Memorlex", "aprender alemán"]
  };
}

export async function generateStaticParams() {
  // ✅ "es" eklendi. Bu sayede build sırasında İspanyolca sayfalar da oluşturulur.
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  const learningLanguages = ['de']; 

  for (const subDir of learningLanguages) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.existsSync(subjectPath) || !fs.lstatSync(subjectPath).isDirectory()) continue;
    
    const subjectParam = subDir === 'de' ? 'german' : subDir;

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
  
  // Tip güvenliği için cast işlemi
  const dict = await getDictionary(lang as ValidLangs);
  const data = await getVocab(lang, subject, level, category, unit);
  
  if (!data) return notFound();

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    "name": `${unit.replace(/-/g, ' ')}`,
    "educationalLevel": level.toUpperCase(),
    "abstract": `${subject} ${level} vocabulary practice unit.`
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