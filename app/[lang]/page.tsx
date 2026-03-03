import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

export async function generateStaticParams() {
  return [
    { lang: 'en' }, { lang: 'tr' }, { lang: 'de' }, { lang: 'uk' }, { lang: 'es' }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const baseUrl = 'https://memorlex.com';
  const keywords = (dict as any).keywords || [];

  return {
    title: `Memorlex | ${dict.title}`,
    description: dict.description,
    keywords: keywords,
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        'en': `${baseUrl}/en`,
        'tr': `${baseUrl}/tr`,
        'de': `${baseUrl}/de`,
        'uk': `${baseUrl}/uk`,
        'es': `${baseUrl}/es`,
        'x-default': `${baseUrl}/en`,
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

// Her dil karti icin dile ozel tag seti
const getLanguageCards = (lang: ValidLangs) => [
  {
    id: 'german',
    flag: '🇩🇪',
    color: 'from-yellow-400 to-red-600',
    tags: {
      tr: ["#entegrasyon", "#telc", "#goethe", "#b1sınav", "#neulinie", "#kelime"],
      uk: ["#інтеграція", "#telc", "#goethe", "#b1іспит", "#neulinie", "#словник"],
      de: ["#integrationskurs", "#telc", "#goethe", "#b1prüfung", "#vokabeln", "#deutsch"],
      en: ["#integrationcourse", "#telc", "#goethe", "#b1exam", "#vocabulary", "#german"],
      es: ["#integración", "#telc", "#goethe", "#examenb1", "#vocabulario", "#alemán"],
    }
  },
  {
    id: 'english',
    flag: '🇬🇧',
    color: 'from-blue-600 to-red-600',
    tags: {
      tr: ["#ielts", "#toefl", "#iş-ingilizcesi", "#cambridge", "#kelime", "#günlük"],
      uk: ["#ielts", "#toefl", "#ділова", "#cambridge", "#словник", "#щоденна"],
      de: ["#ielts", "#toefl", "#businessenglish", "#cambridge", "#vokabeln", "#daily"],
      en: ["#ielts", "#toefl", "#businessenglish", "#cambridge", "#vocabulary", "#daily"],
      es: ["#ielts", "#toefl", "#inglésnegocios", "#cambridge", "#vocabulario", "#diario"],
    }
  },
  {
    id: 'spanish',
    flag: '🇪🇸',
    color: 'from-red-500 to-yellow-500',
    tags: {
      tr: ["#dele", "#ispanyolca", "#gramer", "#latinamerika", "#haberler", "#konuşma"],
      uk: ["#dele", "#іспанська", "#граматика", "#латинська", "#новини", "#розмова"],
      de: ["#dele", "#spanisch", "#grammatik", "#lateinamerika", "#nachrichten", "#sprechen"],
      en: ["#dele", "#siele", "#grammar", "#latinamerica", "#news", "#speaking"],
      es: ["#dele", "#siele", "#gramática", "#latinoamérica", "#noticias", "#hablar"],
    }
  },
];

// Tum dilleri kapsayan genis hashtag havuzu — SEO icin
const ALL_HASHTAGS = [
  // Almanca
  '#learngerman', '#germanlanguage', '#germanpodcast', '#germanforbeginners',
  '#deutschkurs', '#germanvocabulary', '#integrationkurs', '#telc', '#goethe',
  '#deutschlernen', '#germangrammar', '#speakgerman', '#a1toc1', '#germanstories',
  // Ingilizce
  '#learnenglish', '#englishlanguage', '#ielts', '#toefl', '#businessenglish',
  '#englishgrammar', '#englishvocabulary', '#dailyenglish', '#esl', '#speakenglish',
  // Ispanyolca
  '#learnspanish', '#spanishlanguage', '#aprenderespañol', '#dele', '#español',
  '#spanishgrammar', '#hablarespañol', '#cursodeespañol', '#latinoamerica', '#siele',
  // Genel dil ogrenme
  '#languagelearning', '#flashcards', '#listeningpractice', '#readingcomprehension',
  '#writingpractice', '#podcast', '#youtubelearning', '#languageapp', '#vocabularybuilder',
  '#onlinecourse', '#languageexam', '#storiesindeutsch',
];

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const languageCards = getLanguageCards(lang as ValidLangs);

  // TR ve UK icin entegrasyon banneri goster
  const showIntegrationBanner = lang === 'tr' || lang === 'uk';

  const integrationBannerText = {
    tr: {
      badge: "🇩🇪 Almanya'dasın mı?",
      title: "Entegrasyon Kursu & Sınav Hazırlığı",
      desc: "Telc B1, Goethe ve ÖSD sınavlarına özel içerikler. Neu Linie kitabı ünite ünite.",
      cta: "Almancaya Başla →"
    },
    uk: {
      badge: "🇩🇪 Ви в Німеччині?",
      title: "Інтеграційний курс і підготовка до іспитів",
      desc: "Матеріали для Telc B1, Goethe та ÖSD. Підручник Neu Linie — розділ за розділом.",
      cta: "Почати німецьку →"
    }
  };

  const banner = integrationBannerText[lang as 'tr' | 'uk'];

  // Dile gore ozellik kartlari — dinleme/okuma/yazma one cikar
  const featureItems = [
    {
      icon: '👂',
      title: lang === 'tr' ? 'Dinleme'
           : lang === 'uk' ? 'Аудіювання'
           : lang === 'de' ? 'Hörverstehen'
           : lang === 'es' ? 'Escucha'
           : 'Listening',
      desc:  lang === 'tr' ? 'YouTube & Ses Pratikleri'
           : lang === 'uk' ? 'YouTube та аудіо'
           : lang === 'de' ? 'YouTube & Audio'
           : lang === 'es' ? 'YouTube y audio'
           : 'YouTube & Audio Practice',
    },
    {
      icon: '📖',
      title: lang === 'tr' ? 'Okuma'
           : lang === 'uk' ? 'Читання'
           : lang === 'de' ? 'Lesen'
           : lang === 'es' ? 'Lectura'
           : 'Reading',
      desc:  lang === 'tr' ? 'Seviyeye Göre Hikayeler'
           : lang === 'uk' ? 'Історії за рівнем'
           : lang === 'de' ? 'Levelgerechte Texte'
           : lang === 'es' ? 'Historias por nivel'
           : 'Level-Based Stories',
    },
    {
      icon: '✍️',
      title: lang === 'tr' ? 'Yazma'
           : lang === 'uk' ? 'Письмо'
           : lang === 'de' ? 'Schreiben'
           : lang === 'es' ? 'Escritura'
           : 'Writing',
      desc:  lang === 'tr' ? 'Yazarak Kelime Ezberle'
           : lang === 'uk' ? 'Навчання через письмо'
           : lang === 'de' ? 'Schreibbasiertes Lernen'
           : lang === 'es' ? 'Aprender escribiendo'
           : 'Writing-Based Learning',
    },
    {
      icon: '🧠',
      title: lang === 'tr' ? 'Flashcard'
           : lang === 'uk' ? 'Картки'
           : lang === 'de' ? 'Karteikarten'
           : lang === 'es' ? 'Tarjetas'
           : 'Flashcards',
      desc:  lang === 'tr' ? 'Aralıklı Tekrar Sistemi'
           : lang === 'uk' ? 'Інтервальне повторення'
           : lang === 'de' ? 'Spaced Repetition'
           : lang === 'es' ? 'Repetición espaciada'
           : 'Spaced Repetition',
    },
    {
      icon: '📝',
      title: lang === 'tr' ? 'Anlama Testi'
           : lang === 'uk' ? 'Тест розуміння'
           : lang === 'de' ? 'Leseverständnis'
           : lang === 'es' ? 'Comprensión'
           : 'Comprehension',
      desc:  lang === 'tr' ? 'Okuduğunu Anlama Soruları'
           : lang === 'uk' ? 'Питання на розуміння'
           : lang === 'de' ? 'Verständnisfragen'
           : lang === 'es' ? 'Preguntas de comprensión'
           : 'Comprehension Questions',
    },
    {
      icon: '🎓',
      title: lang === 'tr' ? 'Sınav Hazırlığı'
           : lang === 'uk' ? 'Підготовка до іспиту'
           : lang === 'de' ? 'Prüfungsvorbereitung'
           : lang === 'es' ? 'Prep Examen'
           : 'Exam Prep',
      desc: 'Telc · Goethe · IELTS · DELE',
    },
    {
      icon: '🎥',
      title: 'YouTube Lab',
      desc:  lang === 'tr' ? 'Görsel & İşitsel Öğrenme'
           : lang === 'uk' ? 'Візуальне навчання'
           : lang === 'de' ? 'Visuelles Lernen'
           : lang === 'es' ? 'Aprendizaje visual'
           : 'Visual Learning',
    },
    {
      icon: '🤖',
      title: 'AI Feedback',
      desc:  lang === 'tr' ? 'Anlık Hata Analizi'
           : lang === 'uk' ? 'Миттєвий аналіз'
           : lang === 'de' ? 'Sofortige Analyse'
           : lang === 'es' ? 'Análisis instantáneo'
           : 'Instant Error Analysis',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center p-6 transition-colors duration-300">

      {/* ── Hero ── */}
      <section className="text-center max-w-5xl mt-20 mb-12">
        <h1 className="text-8xl md:text-9xl font-black mb-4 uppercase italic tracking-tighter text-amber-500 drop-shadow-xl">
          Memorlex
        </h1>
        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-none uppercase tracking-tight text-slate-800 dark:text-slate-100">
          {dict.home?.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-extrabold mb-8 uppercase tracking-[0.3em] text-sm md:text-base">
          {dict.home?.sub}
        </p>

        {/* Skill Pills — dinleme/okuma/yazma one cikar */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-8">
          {featureItems.slice(0, 6).map((skill) => (
            <span
              key={skill.title}
              className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded-2xl text-xs font-black uppercase tracking-widest"
            >
              {skill.icon} {skill.title}
            </span>
          ))}
        </div>

        {/* Hashtag Bar — tum diller, genis kapsam */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {ALL_HASHTAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── TR / UK Entegrasyon Banner ── */}
      {showIntegrationBanner && banner && (
        <section className="w-full max-w-5xl mb-16 px-4">
          <div className="bg-amber-500 rounded-[50px] p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-amber-500/30">
            <div className="text-white space-y-2">
              <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                {banner.badge}
              </span>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-3">
                {banner.title}
              </h3>
              <p className="text-white/80 font-bold text-sm max-w-md">
                {banner.desc}
              </p>
            </div>
            <Link
              href={`/${lang}/german`}
              className="px-8 py-4 bg-white text-amber-500 rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-950 hover:text-white transition-all whitespace-nowrap shadow-lg"
            >
              {banner.cta}
            </Link>
          </div>
        </section>
      )}

      {/* ── Dil Kartlari ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-24 px-4">
        {languageCards.map((subject) => {
          const cardTags = subject.tags[lang as ValidLangs] || subject.tags.en;
          return (
            <Link
              key={subject.id}
              href={`/${lang}/${subject.id}`}
              className="group relative rounded-[50px] hover:scale-[1.02] transition-all duration-500 shadow-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:border-transparent"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] h-full flex flex-col items-center justify-center relative z-10 group-hover:bg-transparent transition-colors duration-500">
                <span className="text-7xl block mb-6 group-hover:scale-125 transition-transform duration-500">
                  {subject.flag}
                </span>
                <span className="text-2xl font-black uppercase tracking-tighter block mb-5 group-hover:text-white transition-colors">
                  {/* @ts-ignore */}
                  {dict.subjects?.[subject.id] || subject.id}
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {cardTags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-white/70 uppercase tracking-widest transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── YouTube Listening Lab ── */}
      <section className="max-w-7xl w-full py-20 px-10 bg-slate-950 text-white rounded-[80px] mb-24 relative overflow-hidden shadow-[0_50px_100px_-15px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full">
              <span className="w-2 h-2 bg-white animate-ping rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Live Media Hub</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
              YouTube <br /> <span className="text-amber-500">Listening</span> Lab
            </h2>
            <p className="text-slate-400 text-lg font-bold leading-relaxed max-w-xl italic">
              {lang === 'tr' && 'Seviyene uygun videolar, interaktif altyazı ve kelime pratikleriyle dinleme becerisini geliştir.'}
              {lang === 'uk' && 'Відео з інтерактивними субтитрами та вправами для розвитку навичок аудіювання.'}
              {lang === 'de' && 'Verbessere dein Hörverstehen mit niveaugerechten Videos, interaktiven Untertiteln und Vokabelübungen.'}
              {lang === 'es' && 'Mejora tu comprensión auditiva con videos por nivel, subtítulos interactivos y ejercicios de vocabulario.'}
              {lang === 'en' && 'Improve your listening skills with level-based videos, interactive subtitles and vocabulary exercises.'}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500 transition-colors">
                <span className="text-3xl block mb-2">🎞️</span>
                <h4 className="font-black text-xs uppercase mb-1">Video Sync</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Interactive subtitles</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500 transition-colors">
                <span className="text-3xl block mb-2">🎙️</span>
                <h4 className="font-black text-xs uppercase mb-1">Native Audio</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Natural speech pace</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full aspect-video bg-slate-900 rounded-[50px] border-8 border-slate-800 flex items-center justify-center relative shadow-inner group overflow-hidden">
            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform duration-500 shadow-2xl">
              <span className="text-4xl ml-2">▶</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-red-600"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ozellik Grid ── */}
      <section className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 px-4">
        {featureItems.map((f, i) => (
          <div
            key={i}
            className="p-8 bg-white dark:bg-slate-900/50 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 text-center group hover:bg-amber-500 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20"
          >
            <span className="text-5xl mb-4 block group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
              {f.icon}
            </span>
            <h4 className="font-black uppercase text-sm mb-2 group-hover:text-white transition-colors">
              {f.title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest group-hover:text-white/80 transition-colors">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── SEO Content ── */}
      {dict.seoContent && (
        <section className="max-w-7xl w-full py-20 px-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[80px] mb-24 relative shadow-xl">
          <div className="prose prose-slate dark:prose-invert max-w-none relative z-10">
            <h2 className="text-4xl font-black text-amber-500 uppercase mb-12 italic tracking-tighter text-center">
              {dict.seoContent.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-4 text-slate-800 dark:text-slate-100">
                    {dict.seoContent.h2_1}
                  </h3>
                  <p className="leading-relaxed text-base text-slate-600 dark:text-slate-400 font-medium">
                    {dict.seoContent.p1}
                  </p>
                </div>
                <p className="leading-relaxed text-base px-4 border-l-4 border-amber-500 italic text-slate-600 dark:text-slate-400">
                  {dict.seoContent.p2}
                </p>
              </div>
              <div className="space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">
                  {dict.seoContent.h2_2}
                </h3>
                <p className="leading-relaxed text-base text-slate-600 dark:text-slate-400 font-medium">
                  {dict.seoContent.p3}
                </p>
                <div className="p-8 bg-amber-500 text-white rounded-[40px] shadow-lg shadow-amber-500/20">
                  <span className="text-4xl block mb-4">💡</span>
                  <p className="italic font-black text-base leading-tight">
                    {dict.seoContent.footerNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer CTA ── */}
      <footer className="w-full max-w-7xl border-t-4 border-slate-100 dark:border-slate-800 pt-20 pb-20 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="max-w-xl">
          <h3 className="text-4xl font-black uppercase tracking-tighter text-amber-500 mb-4 italic">Memorlex</h3>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{dict.description}</p>
        </div>
        <Link
          href={`/${lang}/german`}
          className="px-12 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all shadow-2xl"
        >
          {dict.start} 🚀
        </Link>
      </footer>
    </main>
  );
}
