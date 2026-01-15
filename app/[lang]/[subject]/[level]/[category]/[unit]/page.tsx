import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react'; // Suspense import edildi

type ValidLangs = "en" | "tr" | "de" | "uk";

// 1. Statik Parametre Üretici: Build sırasında tüm üniteleri fiziksel dosya olarak oluşturur.
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  
  if (!fs.existsSync(baseDir)) return [];

  const subjectDirs = fs.readdirSync(baseDir);
  for (const subDir of subjectDirs) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.lstatSync(subjectPath).isDirectory()) continue;
    
    // Klasör adı 'de' ise URL 'german' olmalı, 'en' ise 'english' olmalı (mantığınıza göre)
    const subjectParam = subDir === 'de' ? 'german' : subDir === 'en' ? 'english' : subDir;

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

// 2. Server Component: Veriyi hazırlar ve Client Component'e aktarır.
export default async function UnitPage({ 
  params 
}: { 
  params: Promise<{ lang: string, subject: string, level: string, category: string, unit: string }> 
}) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  const data = await getVocab(lang, subject, level, category, unit);
  
  if (!data) return notFound();

  // UnitClientWrapper, içindeki useSearchParams() kullanımı nedeniyle Suspense ile sarmalanmalıdır.
  // Bu, Next.js 'output: export' modunda build hatası almamızı engeller.
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold italic">
        Yükleniyor...
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