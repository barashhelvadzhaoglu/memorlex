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

  // dict.keywords varsa kullan, yoksa fallback
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

// Dile göre dil kartı konfigürasyonu
const getLanguageCards = (lang: ValidLangs) => {
  const allCards = [
    {
      id: 'german',
      flag: '🇩🇪',
      color: 'from-yellow-400 to-red-600',
      // TR ve UK için entegrasyon odaklı taglar
      tags: {
        tr: ["#entegrasyon", "#telc", "#goethe", "#a1-c1", "#kelime"],
        uk: ["#інтеграція", "#telc", "#goethe", "#a1-c1", "#словник"],
        de: ["#integration", "#telc", "#goethe", "#a1-c1", "#vokabeln"],
        en: ["#integration", "#telc", "#goethe", "#a1-c1", "#vocabulary"],
        es: ["#integración", "#telc", "#goethe", "#a1-c1", "#vocabulario"],
      }
    },
    {
      id: 'english',
      flag: '🇬🇧',
      color: 'from-blue-600 to-red-600',
      tags: {
        tr: ["#ielts", "#toefl", "#iş-ingilizcesi", "#kelime", "#okuma"],
        uk: ["#ielts", "#toefl", "#ділова", "#словник", "#читання"],
        de: ["#ielts", "#toefl", "#business", "#vocabulary", "#reading"],
        en: ["#ielts", "#toefl", "#business", "#vocabulary", "#reading"],
        es: ["#ielts", "#toefl", "#negocios", "#vocabulario", "#lectura"],
      }
    },
    {
      id: 'spanish',
      flag: '🇪🇸',
      color: 'from-red-500 to-yellow-500',
      tags: {
        tr: ["#dele", "#gramer", "#yazma", "#haberler", "#konuşma"],
        uk: ["#dele", "#граматика", "#письмо", "#новини", "#розмова"],
        de: ["#dele", "#grammatik", "#schreiben", "#nachrichten", "#sprechen"],
        en: ["#dele", "#grammar", "#writing", "#news", "#speaking"],
        es: ["#dele", "#gramática", "#escritura", "#noticias", "#hablar"],
      }
    },
  ];

  return allCards;
};

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const languageCards = getLanguageCards(lang as ValidLangs);

  // TR ve UK için entegrasyon banner'ı göster
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

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex flex-col items-center p-6 transition-colors duration-300">

      {/* Hero Section */}
      <section className="text-center max-w-4xl mt-20 mb-12">
        <h1 className="text-8xl md:text-9xl font-black mb-6 uppercase italic tracking-tighter text-amber-500 drop-shadow-xl">
          Memorlex
        </h1>
        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-none uppercase tracking-tight text-slate-800 dark:text-slate-100">
          {dict.home?.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-extrabold mb-10 uppercase tracking-[0.3em] text-sm md:text-base">
          {dict.home?.sub}
        </p>

        {/* Hashtag Bar */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {[
            '#learngerman', '#germanlanguage', '#germanpodcast', '#germanforbeginners',
            '#deutschkurs', '#germanvocabulary', '#languagelearning', '#integrationkurs',
            '#telc', '#goethe', '#a1toc1', '#storiesindeutsch'
          ].map((tag) => (
            <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-amber-500 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* TR / UK için Entegrasyon Banner */}
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

      {/* Dil Kartları — 3 dil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-24 px-4">
        {languageCards.map((subject) => {
          const cardTags = subject.tags[lang as ValidLangs] || subject.tags.en;
          return (
            <Link
              key={subject.id}
              href={`/${lang}/${subject.id}`}
              className="group relative p-1 bg-gradient-to-br rounded-[50px] hover:scale-[1.02] transition-all duration-500 shadow-xl overflow-hidden"
              style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10 group-hover:opacity-100 transition-opacity duration-500 rounded-[50px]`}></div>
              <div className="bg-white dark:bg-slate-950 p-10 rounded-[48px] h-full flex flex-col items-center justify-center relative z-10">
                <span className="text-7xl block mb-6 group-hover:scale-125 transition-transform duration-500">
                  {subject.flag}
                </span>
                <span className="text-2xl font-black uppercase tracking-tighter block mb-5 group-hover:text-amber-500 transition-colors">
                  {/* @ts-ignore */}
                  {dict.subjects?.[subject.id] || subject.id}
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {cardTags.map(t => (
                    <span key={t} className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* YouTube Listening Lab */}
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
              YouTube <br /> <span className="text-amber-500">Listening</span> Lab
            </h2>
            <p className="text-slate-400 text-lg font-bold leading-relaxed max-w-xl italic">
              {lang === 'tr' && 'Seviyene uygun Almanca videolar, interaktif altyazı ve kelime pratikleriyle dinleme becerisini geliştir.'}
              {lang === 'uk' && 'Відео з інтерактивними субтитрами та вправами для розвитку навичок аудіювання.'}
              {(lang === 'de' || lang === 'en' || lang === 'es') && 'Practice listening with level-based videos, interactive subtitles and vocabulary exercises.'}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500 transition-colors">
                <span className="text-3xl block mb-2">🎞️</span>
                <h4 className="font-black text-xs uppercase mb-1">Video Sync</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold">İnteraktif altyazı desteği</p>
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
            <div className="absolute bottom-6 left-6 right-6 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-red-600"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
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

      {/* Özellik Grid */}
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

      {/* Footer CTA */}
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
