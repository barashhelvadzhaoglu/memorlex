import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

export async function generateStaticParams() {
  return [
    { lang: 'en' }, { lang: 'tr' }, { lang: 'de' }, { lang: 'uk' }, { lang: 'es' }
  ];
}

// ✅ MAKSİMUM SEO & KEYWORD ENJEKSİYONU
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const baseUrl = 'https://memorlex.com'; 

  // Her dil için devasa anahtar kelime ve hashtag listeleri
  const masterKeywords: Record<ValidLangs, string[]> = {
    de: [
      "learngerman", "germanlanguage", "germanpodcast", "germanforbeginners", "germany", "deutschkurs", 
      "germangrammar", "germanvocabulary", "learninggerman", "studygerman", "germanlessons", 
      "languagelearning", "speakgerman", "germanforenglishspeakers", "learngermanpodcast", "deutschlernen", 
      "vokabeln", "munich", "berlin", "integrationcourse", "dw_deutsch", "goetheinstitut", "telc", "testdaf"
    ],
    en: [
      "learnenglish", "englishlanguage", "englishpodcast", "englishforbeginners", "usa", "uk", "canada", 
      "englishcourse", "englishgrammar", "englishvocabulary", "learningenglish", "studyenglish", 
      "englishlessons", "languagelearning", "speakenglish", "ielts", "toefl", "businessenglish", 
      "esl", "dailyenglish", "vocabularybuilder", "cambridgeenglish", "oxfordenglish"
    ],
    es: [
      "learnspanish", "spanishlanguage", "spanishpodcast", "spanishforbeginners", "spain", "mexico", 
      "spanishcourse", "spanishgrammar", "spanishvocabulary", "learningspanish", "studyspanish", 
      "spanishlessons", "languagelearning", "speakspanish", "aprenderespanol", "dele", "vocabulario", 
      "hablarespanol", "cursodeespanol", "español", "latam", "escritura"
    ],
    tr: [
      "ingilizceöğren", "almancaöğren", "ispanyolcaöğren", "dilöğrenme", "kelimeezberleme", "flashcards", 
      "günlükhaberler", "seslihikayeler", "dilkursu", "onlineeğitim", "almancakelime", "ingilizcekursu", 
      "yabancıdil", "pratikyap", "memorlex", "eğitim", "türkiye", "almanya", "vize", "entegrasyon"
    ],
    uk: [
      "вивченнямови", "німецькамова", "англійськамова", "іспанськамова", "словниковийзапас", "курсимови", 
      "німеччина", "навчання", "мовнапрактика", "флешкартки", "аудіоісторії", "новининімецькою"
    ]
  };

  return { 
    title: `Memorlex | ${dict.title}`, 
    description: dict.description,
    keywords: masterKeywords[lang as ValidLangs] || masterKeywords.en,
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        'en': `${baseUrl}/en`, 'tr': `${baseUrl}/tr`, 'de': `${baseUrl}/de`, 
        'uk': `${baseUrl}/uk`, 'es': `${baseUrl}/es`, 'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: `Memorlex | ${dict.title}`,
      description: dict.description,
      url: `${baseUrl}/${lang}`,
      siteName: 'Memorlex',
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Memorlex | ${dict.title}`,
      description: dict.description,
    }
  };
}

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center p-6 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mt-16 mb-16">
        <h1 className="text-7xl font-black mb-6 uppercase italic tracking-tighter text-amber-500">Memorlex</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">{dict.home?.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">{dict.home?.sub}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'Integration', 'Daily News', 'Stories', 'Podcast'].map((tag) => (
            <span key={tag} className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black uppercase">#{tag}</span>
          ))}
        </div>
      </section>
      
      {/* Subject Selection - Dinamik Hashtag Bulutu İle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-16">
        {[
          { 
            id: 'german', flag: '🇩🇪', 
            tags: ["#learngerman", "#deutschkurs", "#germany", "#vokabeln", "#munich", "#podcast"] 
          }, 
          { 
            id: 'english', flag: '🇬🇧', 
            tags: ["#learnenglish", "#ielts", "#vocabulary", "#usa", "#grammar", "#esl"] 
          }, 
          { 
            id: 'spanish', flag: '🇪🇸', 
            tags: ["#learnspanish", "#dele", "#vocabulario", "#spain", "#hablar", "#mexico"] 
          }
        ].map((subject) => (
          <Link key={subject.id} href={`/${lang}/${subject.id}`} className="group p-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] hover:border-amber-500 transition-all shadow-xl text-center relative">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">{subject.flag}</span>
            <span className="text-2xl font-black uppercase tracking-widest block mb-4">
              {/* @ts-ignore */}
              {dict.subjects?.[subject.id] || subject.id}
            </span>
            <div className="flex flex-wrap justify-center gap-1">
              {subject.tags.map(t => (
                <span key={t} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Dinamik SEO İçeriği */}
      {dict.seoContent && (
        <section className="max-w-4xl w-full py-12 px-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-[40px] mb-24 border border-slate-100 dark:border-slate-800">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-3xl font-black text-amber-500 uppercase mb-6 italic tracking-tight">{dict.seoContent.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="leading-relaxed text-sm">{dict.seoContent.p1}</p>
                <h3 className="text-xl font-bold uppercase tracking-tighter">{dict.seoContent.h2_1}</h3>
                <p className="leading-relaxed text-sm">{dict.seoContent.p2}</p>
              </div>
              <div className="space-y-4 text-sm">
                <h3 className="text-xl font-bold uppercase tracking-tighter">{dict.seoContent.h2_2}</h3>
                <p className="leading-relaxed">{dict.seoContent.p3}</p>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-r-xl italic font-medium">
                  {dict.seoContent.footerNote}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer / Features */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 dark:border-slate-800 pt-16 mb-20">
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase tracking-tight text-amber-500">{dict.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">{dict.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { icon: '⌨️', label: dict.practice },
            { icon: '🖼️', label: (dict as any).flashcardsLabel || "Flashcards" },
            { icon: '📚', label: dict.categories?.integration },
            { icon: '🚀', label: dict.start }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-transparent hover:border-amber-500/20 transition-colors">
              <span className="text-3xl mb-2 block">{item.icon}</span>
              <span className="font-bold block text-[10px] md:text-xs uppercase text-slate-500 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}