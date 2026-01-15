import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const subjects = ['german', 'english'];
  const levels = ['a1', 'a2', 'b1'];
  const categories = ['integration', 'topic', 'work']; 

  const paths = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      for (const level of levels) {
        for (const category of categories) {
          paths.push({ lang, subject, level, category });
        }
      }
    }
  }
  return paths;
}

export default async function CategoryPage({ params }: { params: Promise<{ lang: string, subject: string, level: string, category: string }> }) {
  const { lang, subject, level, category } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  const targetLang = subject === 'german' ? 'de' : subject;
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level, category);
  
  let units: string[] = [];
  if (fs.existsSync(dataPath)) {
    units = fs.readdirSync(dataPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  // TİP HATASI ÇÖZÜMÜ: dict.categories'e güvenli erişim için tip zorlaması yapıyoruz
  // Record<string, string> diyerek her türlü string anahtarı kabul etmesini sağlıyoruz.
  const categoriesDict = dict.categories as Record<string, string> | undefined;

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-10">
      <h1 className="text-4xl font-black mb-10 uppercase italic text-amber-500">
        {categoriesDict?.[category] || category} {dict.units?.listTitle || "List"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => (
          <Link 
            key={unit} 
            href={`/${lang}/${subject}/${level}/${category}/${unit}`} 
            className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] hover:border-amber-500 transition-all font-bold text-xl uppercase"
          >
            {unit.replace(/-/g, ' ')}
          </Link>
        ))}
      </div>
      
      <div className="mt-10">
        <Link href={`/${lang}/${subject}/${level}`} className="text-slate-500 hover:text-white transition-colors font-bold italic">
          ← {dict.navigation?.back || "Back"}
        </Link>
      </div>
    </main>
  );
}