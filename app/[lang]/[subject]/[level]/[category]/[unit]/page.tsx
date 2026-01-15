import { getVocab } from '@/src/lib/vocabLoader'; 
import { getDictionary } from '@/dictionaries'; 
import { notFound } from 'next/navigation';
import UnitClientWrapper from './UnitClientWrapper'; // Yeni oluşturacağımız bileşen
import fs from 'fs';
import path from 'path';

type ValidLangs = "en" | "tr" | "de" | "uk";

// 1. generateStaticParams (Aynı kalıyor, klasörleri tarıyor)
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  const paths: any[] = [];
  if (!fs.existsSync(baseDir)) return [];

  const subjectDirs = fs.readdirSync(baseDir);
  for (const subDir of subjectDirs) {
    const subjectPath = path.join(baseDir, subDir);
    if (!fs.lstatSync(subjectPath).isDirectory()) continue;
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
            paths.push({ lang, subject: subjectParam, level: lvl, category: cat, unit: unit });
          }
        }
      }
    }
  }
  return paths;
}

// 2. Server Component: Sadece veriyi hazırlar
export default async function UnitPage({ params }: { params: Promise<{ lang: string, subject: string, level: string, category: string, unit: string }> }) {
  const { lang, subject, level, category, unit } = await params;
  
  const dict = await getDictionary(lang as ValidLangs);
  const data = await getVocab(lang, subject, level, category, unit);
  
  if (!data) return notFound();

  // Arayüz mantığını Client Wrapper'a devrediyoruz
  return (
    <UnitClientWrapper 
      initialData={data} 
      dict={dict} 
      lang={lang} 
      unitName={unit} 
    />
  );
}