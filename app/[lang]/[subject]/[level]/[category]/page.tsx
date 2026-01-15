import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries'; // Sözlük yükleyiciyi ekledik

export default async function CategoryPage({ params }: { params: Promise<{ lang: string, subject: string, level: string, category: string }> }) {
  const { lang, subject, level, category } = await params;
  
  // 1. Sözlüğü URL'deki dile göre yükle
  const dict = await getDictionary(lang);

  const targetLang = subject === 'german' ? 'de' : subject;
  
  // Fiziksel dosya yolu: src/data/vocabulary/de/a1/integration
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level, category);
  
  let units: string[] = [];
  if (fs.existsSync(dataPath)) {
    units = fs.readdirSync(dataPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      {/* DEĞİŞKEN BAŞLIK: 
          Kategori ismini sözlükten alıyoruz (örneğin dict.categories.integration), 
          yanına da "Listesi" karşılığını (dict.units.listTitle) ekliyoruz.
      */}
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
            {/* Ünite isimlerini (Kapital12 vb.) formatlayarak gösterelim */}
            {unit.replace(/-/g, ' ')}
          </Link>
        ))}
      </div>
      
      {/* Geri Dön Butonu eklemek istersen */}
      <div className="mt-10">
        <Link href={`/${lang}/${subject}/${level}`} className="text-slate-500 hover:text-white transition-colors font-bold italic">
          ← {dict.navigation?.back || "Back"}
        </Link>
      </div>
    </main>
  );
}