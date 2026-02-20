import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// SEO İçin Meta Veri Üretici
export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string, level: string, category: string }> }): Promise<Metadata> {
  const { lang, subject, level, category } = await params;
  
  const subName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English');
  const upperLvl = level.toUpperCase();
  
  // Kategori ismini daha okunabilir yapalım (SEO için)
  const catNames: any = {
    tr: { integration: 'Entegrasyon Kursu', topic: 'Konu Bazlı', work: 'İş Dünyası' },
    en: { integration: 'Integration Course', topic: 'Topic Based', work: 'Work & Business' },
    uk: { integration: 'Інтеграційний курс', topic: 'За темами', work: 'Робота та бізнес' },
    es: { integration: 'Curso de Integración', topic: 'Basado en Temas', work: 'Trabajo y Negocios' }
  };

  const currentCat = catNames[lang]?.[category] || category;

  const titles: Record<ValidLangs, string> = {
    tr: `${subName} ${upperLvl} ${currentCat} Üniteleri | Memorlex`,
    en: `${subName} ${upperLvl} ${currentCat} Units & Lessons | Memorlex`,
    uk: `${subName} ${upperLvl} ${currentCat} - Усі уроки | Memorlex`,
    de: `${subName} ${upperLvl} ${currentCat} Einheiten | Memorlex`,
    es: `${subName} ${upperLvl} ${currentCat} Unidades | Memorlex`
  };

  return {
    title: titles[lang as ValidLangs] || titles.en,
    description: lang === 'es' 
      ? `Todas las unidades en la categoría ${subName} ${upperLvl} ${currentCat}. Practica vocabulario con tarjetas y modo de escritura.`
      : `${subName} ${upperLvl} ${currentCat} kategorisindeki tüm üniteler. Kelime listelerini flashcard ve yazarak öğrenme moduyla çalışın.`,
    keywords: [`${subName} ${category}`, `${subName} ${level} üniteleri`, "lista de capítulos", "aprender idiomas escribiendo"]
  };
}

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
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

  const categoriesDict = dict.categories as Record<string, string> | undefined;

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Başlık ve SEO Açıklaması */}
        <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black mb-4 uppercase italic text-amber-500 tracking-tighter flex items-center gap-3">
            📚 {categoriesDict?.[category] || category} {dict.units?.listTitle || (lang === 'es' ? 'Lista' : 'Listesi')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl leading-relaxed">
                {lang === 'tr' 
                    ? `${level.toUpperCase()} seviyesi ${category} odaklı tüm üniteler aşağıda listelenmiştir. Her bir ünite, sınav müfredatına ve günlük hayattaki kelime ihtiyacına göre hazırlanmıştır.`
                    : lang === 'es'
                    ? `Todas las unidades del nivel ${level.toUpperCase()} enfocadas en ${category} se enumeran a continuación. Cada unidad está estructurada según los requisitos del examen.`
                    : `All ${level.toUpperCase()} units for ${category} are listed below. Each unit is structured according to exam requirements.`
                }
            </p>
        </header>

        {/* Ünite Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {units.map((unit) => (
            <Link 
              key={unit} 
              href={`/${lang}/${subject}/${level}/${category}/${unit}`} 
              className="p-5 rounded-2xl transition-all font-bold text-sm md:text-base uppercase border-2
                         bg-slate-50 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md 
                         hover:bg-amber-50 dark:hover:bg-amber-900/10 text-center"
            >
              {unit.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
        
        {/* SEO Alt Metin (Long-Tail için) */}
        <section className="mt-24 p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black mb-4 uppercase tracking-tight">
                {lang === 'tr' ? "Yazarak Öğrenme Metodu ile Kalıcı Hafıza" : lang === 'es' ? "Domina el Vocabulario Escribiendo" : "Master Vocabulary by Writing"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                {lang === 'tr' 
                    ? `Memorlex'te ${subject === 'german' ? 'Almanca' : 'İngilizce'} öğrenirken sadece kelime listelerine bakmazsınız. Seçtiğiniz bu ${category} ünitelerindeki her kelimeyi flashcardlar ile görsel olarak pekiştirir, yazma moduyla ise imla hatasız öğrenirsiniz. Özellikle ${level.toUpperCase()} sınavlarına hazırlananlar için en etkili çalışma yöntemidir.`
                    : lang === 'es'
                    ? `En Memorlex, aprende ${subject === 'german' ? 'alemán' : 'inglés'} de forma activa. Cada unidad en la categoría ${category} está diseñada para mejorar tu memoria a través de la visualización y la escritura.`
                    : `Learn ${subject} by actively participating. Each unit in the ${category} category is designed to improve your memory through visualization and writing.`
                }
            </p>
        </section>

        <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-6 text-center md:text-left">
          <Link 
            href={`/${lang}/${subject}/${level}`} 
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white transition-colors font-black uppercase text-xs tracking-widest inline-flex items-center gap-2"
          >
            ← {dict.navigation?.back || (lang === 'es' ? "Volver" : "Geri Dön")}
          </Link>
        </div>
      </div>
    </main>
  );
}