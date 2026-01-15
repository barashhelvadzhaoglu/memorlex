import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries'; // Sözlük yükleyiciyi ekledik

export default async function LevelPage({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }) {
  const { lang, subject, level } = await params;
  
  // 1. Sözlüğü URL'deki dile göre (tr, en, uk, de) yüklüyoruz
  const dict = await getDictionary(lang);

  const targetLang = subject === 'german' ? 'de' : subject;
  
  // Yol: src/data/vocabulary/de/a1
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level);
  
  let categories: string[] = [];
  if (fs.existsSync(dataPath)) {
    // Sadece klasörleri (integration, topic vb.) alıyoruz
    categories = fs.readdirSync(dataPath).filter(f => fs.lstatSync(path.join(dataPath, f)).isDirectory());
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        {/* Başlık kısmında subject ve level dinamik kalmaya devam ediyor */}
        <h1 className="text-4xl font-black mb-10 uppercase italic">{subject} - {level.toUpperCase()}</h1>
        
        <div className="grid gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/${lang}/${subject}/${level}/${cat}`} 
              className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] hover:bg-amber-500 hover:text-black transition-all flex justify-between items-center group"
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {/* MODÜLER DEĞİŞKEN KISMI:
                   Eğer sözlükte (dict.categories) bu klasörün (cat) bir karşılığı varsa onu yazar.
                   Örn: dict.categories['integration'] -> "📚 ÜNİTE ODAKLI"
                   Eğer karşılığı yoksa klasör adını (cat) büyük harfle yazar.
                */}
                {dict.categories && dict.categories[cat] ? dict.categories[cat] : cat.toUpperCase()}
              </span>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">{cat} →</span>
            </Link>
          ))}
        </div>

        {/* Opsiyonel: Alt kısma bir geri dön butonu */}
        <div className="mt-10">
          <Link href={`/${lang}/${subject}`} className="text-slate-500 hover:text-white font-bold italic">
            ← {dict.navigation?.back || 'Back'}
          </Link>
        </div>
      </div>
    </main>
  );
}