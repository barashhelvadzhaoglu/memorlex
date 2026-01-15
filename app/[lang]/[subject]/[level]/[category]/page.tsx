import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';

// 1. Tip Tanımlaması
type ValidLangs = "en" | "tr" | "de" | "uk";

// 2. Statik Parametre Üretici
// Bu sayfa için tüm olası URL kombinasyonlarını build sırasında oluşturur.
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk'];
  const subjects = ['german', 'english'];
  const levels = ['a1', 'a2', 'b1'];
  
  // Örnek kategorileri buraya eklemelisiniz. 
  // Dinamik olarak çekmek isterseniz üst klasörleri fs ile tarayabilirsiniz.
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
  
  // Sözlüğü güvenli tip ile yüklüyoruz
  const dict = await getDictionary(lang as ValidLangs);

  const targetLang = subject === 'german' ? 'de' : subject;
  
  // Dosya yolu: Build sırasında okunur
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level, category);
  
  let units: string[] = [];
  if (fs.existsSync(dataPath)) {
    units = fs.readdirSync(dataPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-black mb-10 uppercase italic text-amber-500">
        {dict.categories?.[category] || category} {dict.units?.listTitle || "List"}
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