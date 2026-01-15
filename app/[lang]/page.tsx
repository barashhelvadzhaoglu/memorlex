import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk";

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'tr' },
    { lang: 'de' },
    { lang: 'uk' }
  ];
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = await params;
  
  // SEO Keywords Stratejisi
  const seoData = {
    tr: {
      title: "Memorlex - Almanca Öğren & İngilizce Kelime Ezberle | A1-B1",
      description: "Almanca öğrenmek ve İngilizce kelime ezberlemek için en iyi yöntem! Yazarak öğrenme ve flashcardlar ile A1, A2, B1 seviye kelime listeleri."
    },
    en: {
      title: "Memorlex - Learn German & English Vocabulary | A1-B1 Levels",
      description: "Best way to learn German and English! Practice vocabulary with writing exercises and flashcards for all levels from A1 to B1."
    },
    uk: {
      title: "Memorlex - Вивчай німецьку та англійську мови | А1-B1",
      description: "Вивчай німецьку мову швидко! Словниковий запас, картки та письмові вправи для рівнів A1, A2, B1."
    },
    de: {
      title: "Memorlex - Deutsch & Englisch lernen | Vokabeltrainer A1-B1",
      description: "Effektiv Deutsch lernen! Vokabeln üben mit Karteikarten und Schreibtraining für die Niveaus A1, A2 und B1."
    }
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: ["Almanca öğren", "İngilizce öğren", "kelime ezberle", "yazarak öğren", "A1 Almanca", "B1 Almanca kelimeleri", "Entegrasyon kursu", "flashcards"]
  };
}

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center p-6">
      
      {/* Hero Section - Anahtar Kelime Odaklı */}
      <section className="text-center max-w-4xl mt-16 mb-16">
        <h1 className="text-7xl font-black mb-6 uppercase italic tracking-tighter text-amber-500">
          Memorlex
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
          {lang === 'tr' && "Almanca Öğren ve İngilizce Kelime Ezberle: Yazarak ve Görsel Hafıza ile Kalıcı Çözüm"}
          {lang === 'uk' && "Вивчай німецьку та англійську: пиши та запам'ятовуй швидше"}
          {lang === 'en' && "Learn German & English: Master Vocabulary by Writing and Visual Memory"}
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['A1', 'A2', 'B1', 'Entegrasyon Kursu', 'Yazarak Öğren'].map((tag) => (
            <span key={tag} className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black uppercase">
              #{tag}
            </span>
          ))}
        </div>
      </section>
      
      {/* Dil Seçimi - Subject Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-24">
        <Link href={`/${lang}/german`} className="group p-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] hover:border-amber-500 transition-all shadow-xl text-center">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">🇩🇪</span>
            <span className="text-2xl font-black uppercase tracking-widest">{dict.subjects?.german} Öğren</span>
        </Link>
        <Link href={`/${lang}/english`} className="group p-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] hover:border-amber-500 transition-all shadow-xl text-center">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">🇬🇧</span>
            <span className="text-2xl font-black uppercase tracking-widest">{dict.subjects?.english} Öğren</span>
        </Link>
      </div>

      {/* SEO Alt Bölüm - Geniş Kelime Aralığı */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 dark:border-slate-800 pt-16 mb-20">
        <div>
          <h3 className="text-2xl font-black uppercase mb-4 tracking-tight text-amber-500">
            {lang === 'tr' ? "Kelime Ezberleme Artık Çok Kolay" : "Vocabulary Learning Made Easy"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'tr' ? (
              "Memorlex ile Almanca öğren sürecini hızlandırın. A1'den B1'e tüm seviyelerde, özellikle Entegrasyon Kursu müfredatına uygun kelime listeleri sunuyoruz. Kelime öğrenme aşamasında sadece bakmak yetmez; yazarak öğrenme modumuz ile imla hatalarını düzeltir, flashcardlar ile görsel hafızanızı güçlendirirsiniz."
            ) : (
              "Accelerate your language journey. Whether you want to learn German or master English, our platform provides unit-based word lists from A1 to B1."
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
            <span className="text-3xl mb-2 block">⌨️</span>
            <span className="font-bold block text-sm">Yazarak Öğren</span>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
            <span className="text-3xl mb-2 block">🖼️</span>
            <span className="font-bold block text-sm">Flashcard Modu</span>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
            <span className="text-3xl mb-2 block">📚</span>
            <span className="font-bold block text-sm">Kapitel Listeleri</span>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
            <span className="text-3xl mb-2 block">🚀</span>
            <span className="font-bold block text-sm">Hızlı İlerleme</span>
          </div>
        </div>
      </section>
    </main>
  );
}