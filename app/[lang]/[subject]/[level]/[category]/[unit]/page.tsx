import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk']; // Arayüz dilleri
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  // Sadece öğrenilecek dillerin klasörlerini gez (Örn: 'de')
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
          // KRİTİK NOKTA: Her bir fiziksel JSON dosyası için 
          // 4 farklı dil rotası (tr, en, de, uk) oluşturuyoruz.
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

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white font-bold italic uppercase tracking-tighter">
        Memorlex...
      </div>
    }>
      <UnitClientWrapper 
        initialData={data} 
        dict={dict} 
        lang={lang} 
        unitName={unit} 
      />
    </Suspense>
  );
}