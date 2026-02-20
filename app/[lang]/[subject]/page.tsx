import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

// Desteklenen diller
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// SEO İçin Meta Veri Üretimi
export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string }> }): Promise<Metadata> {
  const { lang, subject } = await params;
  
  // Konu ismini dile göre belirle (SEO için)
  const subName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English');
  
  const seoData: Record<string, { title: string, description: string }> = {
    tr: {
      title: `${subName} Kelime Listeleri A1, A2, B1 | Memorlex`,
      description: `${subName} öğrenmek için seviye bazlı (A1-B1) kelime listeleri, flashcardlar ve yazma alıştırmaları. Entegrasyon kursu müfredatına uygun.`
    },
    en: {
      title: `${subName} Vocabulary Lists A1, A2, B1 | Memorlex`,
      description: `Learn ${subName} with level-based vocabulary lists, flashcards, and writing exercises. Perfect for official language exams.`
    },
    uk: {
      title: `${subName} Словниковий запас A1, A2, B1 | Memorlex`,
      description: `Вивчайте ${subName} мову за рівнями A1-B1. Списки слів, картки та вправи для швидкого навчання.`
    },
    de: {
      title: `${subName} Vokabellisten A1, A2, B1 | Memorlex`,
      description: `Lerne ${subName} mit Vokabellisten für die Niveaus A1 bis B1. Übe mit Karteikarten und Schreibtraining.`
    },
    es: {
      title: `${subName} Listas de Vocabulario A1, A2, B1 | Memorlex`,
      description: `Aprende ${subName} con listas de vocabulario por niveles, tarjetas y ejercicios de escritura. Ideal para exámenes oficiales.`
    }
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: [`${subName} aprender`, `${subName} A1 vocabulario`, `${subName} B1 lista`, "aprender palabras escribiendo", "flashcards"]
  };
}

// Statik Parametre Üretimi
export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const subjects = ['german', 'english'];

  const params = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      params.push({ lang, subject });
    }
  }
  return params;
}

export default async function SubjectPage({ params }: { params: Promise<{ lang: string, subject: string }> }) {
  const { lang, subject } = await params;

  const dict = await getDictionary(lang as ValidLangs);
  const subjectsDict = dict.subjects as Record<string, string> | undefined;
  const currentSubjectName = subjectsDict?.[subject] || subject;

  const levels = ['a1', 'a2', 'b1'];

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-10 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full">
        {/* Başlık: Dile göre dinamik yapı */}
        <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase italic tracking-tighter text-amber-500">
          {lang === 'tr' ? `${currentSubjectName} Öğren` : 
           lang === 'es' ? `Aprender ${currentSubjectName}` : 
           `Learn ${currentSubjectName}`}
        </h1>
        
        {/* Alt Başlık: Sözlükten geliyor */}
        <p className="text-slate-500 dark:text-slate-400 mb-12 font-bold italic text-xl">
          {dict.levels?.selectTitle || "Please select a level to start learning:"}
        </p>

        {/* Seviye Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <Link 
              key={lvl} 
              href={`/${lang}/${subject}/${lvl}`} 
              className="p-10 rounded-[40px] transition-all text-center group border-2
                         bg-slate-50 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <span className="text-5xl font-black block uppercase group-hover:text-amber-500 transition-colors">
                {lvl}
              </span>
              <p className="text-xs font-bold mt-2 text-slate-400 uppercase tracking-widest">
                {currentSubjectName} {lvl.toUpperCase()}
              </p>
              <span className="text-sm text-amber-500 block mt-4 opacity-0 group-hover:opacity-100 transition-all font-black">
                {dict.start || "START"} →
              </span>
            </Link>
          ))}
        </div>

        {/* Çalışma Yöntemi Bölümü */}
        <section className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-400">
            {lang === 'tr' ? `${currentSubjectName} Kelime Çalışma Yöntemi` : 
             lang === 'es' ? `Método de Estudio de ${currentSubjectName}` : 
             `${currentSubjectName} Study Method`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed italic">
            {lang === 'tr' 
              ? `${currentSubjectName} dilinde uzmanlaşmak için A1, A2 ve B1 seviyelerine özel hazırlanan kelime listelerimizi kullanın. Flashcard yöntemi ve yazarak çalışma modumuz sayesinde kelime öğrenme sürecinizi hızlandırın.`
              : lang === 'es'
              ? `Para dominar el ${currentSubjectName}, utiliza nuestras listas de vocabulario especialmente preparadas para los niveles A1, A2 y B1. Acelera tu aprendizaje con nuestras tarjetas y el modo de escritura.`
              : `Master ${currentSubjectName} by using our specialized A1, A2, and B1 vocabulary lists. Speed up your learning process with our flashcard and writing modes.`}
          </p>
        </section>

        {/* Geri Dön Butonu */}
        <div className="mt-12 text-center">
          <Link 
            href={`/${lang}`} 
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-black uppercase text-xs tracking-widest"
          >
            ← {dict.navigation?.back || (lang === 'es' ? "Volver" : "Back")}
          </Link>
        </div>
      </div>
    </main>
  );
}