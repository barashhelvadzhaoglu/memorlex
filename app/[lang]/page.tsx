import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

export async function generateStaticParams() {
  return [
    { lang: 'en' }, { lang: 'tr' }, { lang: 'de' }, { lang: 'uk' }, { lang: 'es' }
  ];
}

// ✅ MAKSİMUM SEO & GENİŞ PLATFORM KAPSAMI (200+ Satır Hedefli)
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const baseUrl = 'https://memorlex.com'; 

  const masterKeywords: Record<ValidLangs, string[]> = {
    de: [
      "deutschlernen", "germanwriting", "deutschschreiben", "germanaudio", "deutschlesen",
      "germanstories", "deutschenachrichten", "germanpodcast", "youtube-deutsch", "vokabeln", 
      "integrationkurs", "telc-vorbereitung", "goethe-institut", "berufssprachkurs", "deutsch-alltag",
      "grammatik-üben", "deutsch-schreiben-lernen", "audio-training", "deutsch-lernen-mit-news",
      "german-vocabulary-builder", "ai-german-tutor", "deutsch-lernen-kostenlos", "munich-language"
    ],
    en: [
      "learnenglish", "englishwriting", "englishpractice", "englishaudio", "englishreading",
      "englishstories", "englishnews", "dailynews", "englishpodcast", "youtube-english", 
      "ielts-preparation", "toefl-writing", "business-english", "vocabulary-builder", "academic-english",
      "learn-english-with-stories", "english-listening-skills", "grammar-check", "ai-language-learning",
      "speak-english-fluently", "daily-english-input", "english-for-work", "cambridge-english"
    ],
    es: [
      "aprenderespañol", "escrituraespañola", "audioespañol", "lecturaespañola", "historiasenespañol",
      "noticiasenespañol", "podcastespañol", "vocabulario-español", "español-youtube", "dele-examen",
      "siele", "gramática-española", "español-para-extranjeros", "hablar-español", "español-moderno",
      "noticias-en-español", "clases-de-español", "español-latino", "español-de-españa", "escritura-creativa"
    ],
    tr: [
      "almancaöğren", "ingilizceöğren", "ispanyolcaöğren", "almancayazma", "almancadinleme",
      "almancahaberler", "almancahikayeler", "dilplatformu", "almancayoutube", "yazaraköğrenme",
      "almancapodcast", "günlükhaberler", "hikayelerlealmanca", "yabancıdilpratik", "yapayzeka-dil",
      "almancakelimeezberleme", "ingilizcekursu", "dilöğrenmeteknikleri", "vize-almanca", "entegrasyonkursu"
    ],
    uk: [
      "вивченнямови", "німецькамова", "англійськамова", "іспанськамова", "практикаписьма",
      "аудіоуроки", "читаннянімецькою", "історіїнімецькою", "новининімецькою", "youtube-німецька",
      "словниковийзапас", "курсинімецької", "мовнаплатформа", "німеччинадляукраїнців", 
      "інтеграційнікурси", "німецькадляроботи", "вивченнянімецькоїонлайн", "німецькамовабезкоштовно"
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
      
      {/* 🚀 Hero Section: Dev Platform Vizyonu */}
      <section className="text-center max-w-4xl mt-20 mb-20">
        <h1 className="text-8xl md:text-9xl font-black mb-6 uppercase italic tracking-tighter text-amber-500 drop-shadow-xl">
          Memorlex
        </h1>
        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-none uppercase tracking-tight text-slate-800 dark:text-slate-100">
          {dict.home?.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-extrabold mb-10 uppercase tracking-[0.3em] text-sm md:text-base">
          {dict.home?.sub}
        </p>
        
        {/* Modül Hashtagleri - SEO Enjeksiyonu */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {[
            'WritingLab', 'DailyNews', 'YouTubeListening', 'Stories', 
            'Podcast', 'A1-C1', 'Integration', 'SmartVocab', 'AIFeedback'
          ].map((tag) => (
            <span key={tag} className="px-5 py-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-amber-500 transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </section>
      
      {/* 🧭Subject Selection: Medya Odaklı Dil Seçimi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl mb-32">
        {[
          { 
            id: 'german', flag: '🇩🇪', color: 'from-yellow-400 to-red-600',
            tags: ["#writing", "#news", "#youtube", "#podcast", "#integration"] 
          }, 
          { 
            id: 'english', flag: '🇬🇧', color: 'from-blue-600 to-red-600',
            tags: ["#business", "#ielts", "#podcast", "#vocabulary", "#reading"] 
          }, 
          { 
            id: 'spanish', flag: '🇪🇸', color: 'from-red-500 to-yellow-500',
            tags: ["#dele", "#gramatica", "#escritura", "#noticias", "#hablar"] 
          }
        ].map((subject) => (
          <Link key={subject.id} href={`/${lang}/${subject.id}`} className="group relative p-1 bg-gradient-to-br rounded-[60px] hover:scale-[1.02] transition-all duration-500 shadow-2xl overflow-hidden">
            <div className="bg-white dark:bg-slate-950 p-12 rounded-[58px] h-full flex flex-col items-center justify-center relative z-10">
                <span className="text-8xl block mb-8 group-hover:scale-125 transition-transform duration-500">{subject.flag}</span>
                <span className="text-3xl font-black uppercase tracking-tighter block mb-6 group-hover:text-amber-500 transition-colors">
                  {/* @ts-ignore */}
                  {dict.subjects?.[subject.id] || subject.id}
                </span>
                <div className="flex flex-wrap justify-center gap-3">
                  {subject.tags.map(t => (
                    <span key={t} className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t}</span>
                  ))}
                </div>
            </div>
            {/* Arka plan animasyon efekti */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </Link>
        ))}
      </div>

      {/* 📺 NEW: YouTube & Audio Hub Bölümü */}
      <section className="max-w-7xl w-full py-20 px-10 bg-slate-950 text-white rounded-[80px] mb-32 relative overflow-hidden shadow-[0_50px_100px_-15px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full">
                    <span className="w-2 h-2 bg-white animate-ping rounded-full"></span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Live Media Hub</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
                    YouTube <br/> <span className="text-amber-500">Listening</span> Lab
                </h2>
                <p className="text-slate-400 text-lg font-bold leading-relaxed max-w-xl italic">
                    Gerçek YouTube videoları üzerinden dinleme pratiği yap, kelimeleri bağlamında yakala ve görsel hafızanı tetikle.
                </p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500 transition-colors">
                        <span className="text-3xl block mb-2">🎞️</span>
                        <h4 className="font-black text-xs uppercase mb-1">Video Sync</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Interaktif altyazı desteği</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500 transition-colors">
                        <span className="text-3xl block mb-2">🎙️</span>
                        <h4 className="font-black text-xs uppercase mb-1">Native Audio</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Doğal konuşma hızında pratik</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 w-full aspect-video bg-slate-900 rounded-[50px] border-8 border-slate-800 flex items-center justify-center relative shadow-inner group overflow-hidden">
                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform duration-500 shadow-2xl">
                    <span className="text-4xl ml-2">▶</span>
                </div>
                {/* Alt dekoratif bar */}
                <div className="absolute bottom-6 left-6 right-6 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-red-600"></div>
                </div>
            </div>
        </div>
      </section>

      {/* ✍️ Writing & SEO Content: Dinamik İçerik Alanı */}
      {dict.seoContent && (
        <section className="max-w-7xl w-full py-20 px-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[80px] mb-32 relative shadow-xl">
          <div className="prose prose-slate dark:prose-invert max-w-none relative z-10">
            <h2 className="text-5xl font-black text-amber-500 uppercase mb-12 italic tracking-tighter text-center">
                {dict.seoContent.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-slate-800 dark:text-slate-100">
                        {dict.seoContent.h2_1}
                    </h3>
                    <p className="leading-relaxed text-base text-slate-600 dark:text-slate-400 font-medium">
                        {dict.seoContent.p1}
                    </p>
                </div>
                <p className="leading-relaxed text-base px-4 border-l-4 border-amber-500 italic">
                    {dict.seoContent.p2}
                </p>
              </div>
              <div className="space-y-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">
                    {dict.seoContent.h2_2}
                </h3>
                <p className="leading-relaxed text-base text-slate-600 dark:text-slate-400 font-medium">
                    {dict.seoContent.p3}
                </p>
                <div className="p-10 bg-amber-500 text-white rounded-[50px] shadow-lg shadow-amber-500/20">
                  <span className="text-4xl block mb-4">💡</span>
                  <p className="italic font-black text-lg leading-tight">
                    {dict.seoContent.footerNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🛠️ Genişletilmiş Özellik Grid'i */}
      <section className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 px-4">
        {[
          { icon: '⌨️', title: 'Writing Lab', desc: 'AI Destekli Yazma Pratiği' },
          { icon: '📻', title: 'Podcast Player', desc: 'Yolda Dinle ve Öğren' },
          { icon: '📰', title: 'Daily News', desc: 'Gerçek Almanca Haberler' },
          { icon: '📖', title: 'Story Hub', desc: 'Seviyeye Göre Hikayeler' },
          { icon: '🎥', title: 'YouTube Hub', desc: 'Görsel Dil Eğitimi' },
          { icon: '🧠', title: 'Smart Cards', desc: 'Aralıklı Tekrar Sistemi' },
          { icon: '📈', title: 'Goal Tracker', desc: 'Günlük Hedef Takibi' },
          { icon: '🤖', title: 'AI Feedback', desc: 'Anlık Hata Analizi' }
        ].map((f, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900/50 rounded-[50px] border-2 border-slate-100 dark:border-slate-800 text-center group hover:bg-amber-500 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20">
            <span className="text-5xl mb-6 block group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{f.icon}</span>
            <h4 className="font-black uppercase text-sm mb-3 group-hover:text-white transition-colors">{f.title}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest group-hover:text-white/80 transition-colors">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer / Final Call to Action */}
      <footer className="w-full max-w-7xl border-t-4 border-slate-100 dark:border-slate-800 pt-20 pb-20 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="max-w-xl">
          <h3 className="text-4xl font-black uppercase tracking-tighter text-amber-500 mb-4 italic">Memorlex</h3>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{dict.description}</p>
        </div>
        <Link href={`/${lang}/german`} className="px-12 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all shadow-2xl">
          {dict.start} 🚀
        </Link>
      </footer>
    </main>
  );
}