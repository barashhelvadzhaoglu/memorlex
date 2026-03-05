import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// Dile ve konuya gore subject adi
const getSubjectName = (subject: string, lang: string) => {
  const names: Record<string, Record<string, string>> = {
    german:  { tr: 'Almanca', uk: 'Німецька', de: 'Deutsch', en: 'German',  es: 'Alemán'   },
    english: { tr: 'İngilizce', uk: 'Англійська', de: 'Englisch', en: 'English', es: 'Inglés' },
    spanish: { tr: 'İspanyolca', uk: 'Іспанська', de: 'Spanisch', en: 'Spanish', es: 'Español' },
  };
  return names[subject]?.[lang] || subject;
};

// Her dil ve konu icin ayri keyword seti
const getLevelKeywords = (subject: string, level: string, lang: string) => {
  const upperLvl = level.toUpperCase();
  const common = [
    "memorlex", "language learning", "vocabulary units", "flashcards",
    "online course", "stories", "listening practice", "writing exercises",
  ];
  const regions = [
    "germany", "usa", "uk", "canada", "europe",
    "india", "egypt", "spain", "mexico", "turkey",
  ];
  const methods = [
    "short stories", "reading comprehension", "listening comprehension",
    "pronunciation", "youtube", "exam prep", "podcast",
  ];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      // Genel
      `learn german ${level}`, `deutsch lernen ${level}`,
      `german ${upperLvl} vocabulary`, `deutschkurs ${level}`,
      "learngerman", "germanlanguage", "germangrammar", "germanvocabulary",
      "speakgerman", "deutschlernen", "germanstories", "germanlistening",
      "german podcast", "munich", "berlin", "austria",
      // Entegrasyon odakli
      "integrationkurs", "telc", "goethe", "testdaf", "osd",
      `telc ${level}`, `goethe ${level}`,
      "germanlanguagetest", "b1pruefung", "a1pruefung", "sprachkurs",
      "germanyimmigration", "neulinie", "volkshochschule",
      "deutschintegration", "einbuergerungstest",
    ],
    english: [
      `learn english ${level}`, `english ${upperLvl} vocabulary`,
      `english course ${level}`, `study english ${level}`,
      "learnenglish", "englishlanguage", "englishgrammar", "englishvocabulary",
      "speakenglish", "englishstories", "englishlistening", "dailyenglish",
      "ielts", "toefl", "toeic", "businessenglish", "cambridgeenglish",
      "esl", "esol", "americanenglish", "britishenglish",
      `ielts ${level}`, `toefl ${level}`,
    ],
    spanish: [
      `learn spanish ${level}`, `spanish ${upperLvl} vocabulary`,
      `aprender español ${level}`, `curso de español ${level}`,
      "learnspanish", "spanishlanguage", "spanishgrammar", "spanishvocabulary",
      "speakspanish", "spanishstories", "aprenderespanol",
      "dele", "siele", "hablarespanol", "vocabulario", "cursodeespanol",
      "latinoamerica", "spain", "mexico", "spanishculture",
      `dele ${level}`, `siele ${level}`,
    ],
  };

  return [
    ...(subjectSpecific[subject] || []),
    ...common,
    ...regions,
    ...methods,
    `${subject} ${level} units`,
    `${subject} ${upperLvl} stories`,
  ];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string }>;
}): Promise<Metadata> {
  const { lang, subject, level } = await params;
  const baseUrl = 'https://memorlex.com';
  const upperLvl = level.toUpperCase();
  const subName = getSubjectName(subject, lang);

  const seoData: Record<string, { title: string; description: string }> = {
    tr: {
      title: `${subName} ${upperLvl} | Kelime Üniteleri, Hikayeler & Dinleme | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi için kelime üniteleri, okuma hikayeleri ve YouTube dinleme pratikleri. Telc, Goethe ve entegrasyon kursu hazırlığı için ideal.`,
    },
    en: {
      title: `${subName} ${upperLvl} | Vocabulary Units, Stories & Listening | Memorlex`,
      description: `${subName} ${upperLvl} vocabulary units, short stories and YouTube listening practice. Ideal for IELTS, TOEFL, DELE, Telc and Goethe exam preparation.`,
    },
    uk: {
      title: `${subName} ${upperLvl} | Розділи, Історії та Аудіювання | Memorlex`,
      description: `Вивчайте ${subName} ${upperLvl}: словникові розділи, цікаві історії та YouTube вправи. Підготовка до Telc, Goethe, IELTS та DELE.`,
    },
    de: {
      title: `${subName} ${upperLvl} | Vokabeleinheiten, Geschichten & Hören | Memorlex`,
      description: `${subName} lernen auf Niveau ${upperLvl}: Vokabeleinheiten, Kurzgeschichten und YouTube-Hörübungen. Ideal für Telc, Goethe und Integrationskurs-Vorbereitung.`,
    },
    es: {
      title: `${subName} ${upperLvl} | Unidades, Historias y Escucha | Memorlex`,
      description: `Estudia ${subName} nivel ${upperLvl}: unidades de vocabulario, historias cortas y práctica de escucha en YouTube. Preparación para DELE, SIELE e IELTS.`,
    },
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: getLevelKeywords(subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}`,
      languages: {
        tr: `${baseUrl}/tr/${subject}/${level}`,
        en: `${baseUrl}/en/${subject}/${level}`,
        de: `${baseUrl}/de/${subject}/${level}`,
        uk: `${baseUrl}/uk/${subject}/${level}`,
        es: `${baseUrl}/es/${subject}/${level}`,
        'x-default': `${baseUrl}/en/${subject}/${level}`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `${baseUrl}/${lang}/${subject}/${level}`,
      siteName: 'Memorlex',
      locale: lang,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const subjects = ['german', 'english', 'spanish'];
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];

  const paths = [];
  for (const lang of languages) {
    for (const subject of subjects) {
      for (const level of levels) {
        paths.push({ lang, subject, level });
      }
    }
  }
  return paths;
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string }>;
}) {
  const { lang, subject, level } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  const subjectsDict = dict.subjects as Record<string, string> | undefined;
  const categoriesDict = dict.categories as Record<string, string> | undefined;
  const currentSubjectName = getSubjectName(subject, lang);

  const targetLang = subject === 'german' ? 'de' : subject === 'spanish' ? 'es' : subject;
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level);

  let categories: string[] = [];
  if (fs.existsSync(dataPath)) {
    categories = fs
      .readdirSync(dataPath)
      .filter((f) => fs.lstatSync(path.join(dataPath, f)).isDirectory());
  }

  // Dile gore stories etiketi
  const storiesTitle =
    (dict as any)?.stories?.title ||
    (lang === 'tr' ? 'HİKÂYELER'
      : lang === 'uk' ? 'ОПОВІДАННЯ'
      : lang === 'de' ? 'GESCHICHTEN'
      : lang === 'es' ? 'HISTORIAS'
      : 'STORIES');

  const storiesSub =
    lang === 'tr' ? 'hikayelere git →'
    : lang === 'uk' ? 'до оповідань →'
    : lang === 'de' ? 'zu den Geschichten →'
    : lang === 'es' ? 'ir a historias →'
    : 'go to stories →';

  // Geri butonu metni
  const backText =
    dict.navigation?.back ||
    (lang === 'tr' ? 'Geri'
      : lang === 'uk' ? 'Назад'
      : lang === 'de' ? 'Zurück'
      : lang === 'es' ? 'Volver'
      : 'Back');

  // Schema.org Breadcrumb
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Memorlex',
        item: `https://memorlex.com/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: currentSubjectName,
        item: `https://memorlex.com/${lang}/${subject}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: level.toUpperCase(),
        item: `https://memorlex.com/${lang}/${subject}/${level}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">

        {/* Baslik */}
        <h1 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-amber-500">
          {currentSubjectName} — {level.toUpperCase()}
        </h1>

        {/* Alt baslik */}
        <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-10">
          {lang === 'tr' ? 'Konu seçerek çalışmaya başla:'
            : lang === 'uk' ? 'Оберіть тему для навчання:'
            : lang === 'de' ? 'Wähle ein Thema zum Lernen:'
            : lang === 'es' ? 'Elige un tema para estudiar:'
            : 'Choose a topic to start studying:'}
        </p>

        <div className="grid gap-6">

          {/* Stories Karti */}
          <Link
            href={`/${lang}/${subject}/${level}/stories`}
            className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                       bg-slate-50 border-2 border-slate-200 text-slate-900
                       dark:bg-slate-900 dark:border-slate-800 dark:text-white
                       hover:bg-amber-500 hover:text-black hover:border-amber-500
                       shadow-sm hover:shadow-xl hover:shadow-amber-500/20"
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black uppercase tracking-widest">
                📖 {storiesTitle}
              </span>
              <span className="text-xs font-black text-slate-400 group-hover:text-black/60 uppercase tracking-widest">
                {lang === 'tr' ? 'Okuma & Dinleme & Anlama Soruları'
                  : lang === 'uk' ? 'Читання · Аудіювання · Запитання'
                  : lang === 'de' ? 'Lesen · Hören · Verständnisfragen'
                  : lang === 'es' ? 'Lectura · Escucha · Comprensión'
                  : 'Reading · Listening · Comprehension'}
              </span>
            </div>
            <span className="text-sm font-bold italic opacity-40 group-hover:opacity-100 whitespace-nowrap ml-4">
              {storiesSub}
            </span>
          </Link>

          {/* Kelime Kategorileri */}
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${lang}/${subject}/${level}/${cat}`}
              className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                         bg-slate-50 border-2 border-slate-200 text-slate-900
                         dark:bg-slate-900 dark:border-slate-800 dark:text-white
                         hover:bg-amber-500 hover:text-black hover:border-amber-500
                         shadow-sm hover:shadow-xl hover:shadow-amber-500/20"
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {categoriesDict?.[cat] || cat.toUpperCase()}
              </span>
              <span className="text-sm font-bold italic opacity-40 group-hover:opacity-100">
                {cat} →
              </span>
            </Link>
          ))}

        </div>

        {/* Geri Butonu */}
        <div className="mt-12">
          <Link
            href={`/${lang}/${subject}`}
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors font-black uppercase text-xs tracking-widest"
          >
            ← {backText}
          </Link>
        </div>

      </div>
    </main>
  );
}
