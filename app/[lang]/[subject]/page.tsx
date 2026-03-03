import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

const ALL_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1'];

// Her dil icin ayri keyword seti
const getDynamicKeywords = (subject: string, lang: string) => {
  const common = ["memorlex", "language learning", "flashcards", "vocabulary builder", "online course"];
  const regions = ["germany", "usa", "canada", "europe", "india", "egypt", "spain", "mexico", "turkey"];
  const methods = ["podcast", "daily news", "stories", "listening comprehension", "writing practice", "youtube", "exam prep"];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      // Genel
      "learngerman", "germanlanguage", "germanpodcast", "germanforbeginners",
      "deutschkurs", "germangrammar", "germanvocabulary", "learninggerman",
      "studygerman", "germanlessons", "speakgerman", "deutschlernen",
      "germansongs", "germanculture", "munich", "berlin", "austria",
      "germanstories", "germanlistening", "germanreading", "germanwriting",
      // Entegrasyon odakli
      "integrationkurs", "telc", "goethe", "testdaf", "osd",
      "germanlanguagetest", "b1pruefung", "a1pruefung", "sprachkurs",
      "germanyimmigration", "germanresidency", "neulinie", "volkshochschule",
      "deutschintegration", "einbuergerungstest",
    ],
    english: [
      "learnenglish", "englishlanguage", "englishpodcast", "englishforbeginners",
      "englishcourse", "englishgrammar", "englishvocabulary", "learningenglish",
      "studyenglish", "englishlessons", "speakenglish", "ielts", "toefl", "toeic",
      "businessenglish", "cambridgeenglish", "esl", "esol",
      "americanenglish", "britishenglish", "englishpronunciation",
      "dailyenglish", "englishnews", "englishstories", "englishwriting",
      "englishreading", "englishlistening",
    ],
    spanish: [
      "learnspanish", "spanishlanguage", "spanishpodcast", "spanishforbeginners",
      "spanishcourse", "spanishgrammar", "spanishvocabulary", "learningspanish",
      "studyspanish", "spanishlessons", "speakspanish", "aprenderespanol",
      "cursodeespanol", "dele", "siele", "hablarespanol", "vocabulario",
      "español", "idiomaspanol", "latinoamerica", "spain", "mexico",
      "spanishculture", "spanishnews", "spanishstories", "escritura",
      "spanishwriting", "spanishreading",
    ]
  };

  return [...(subjectSpecific[subject] || []), ...common, ...regions, ...methods];
};

// Dile ve konuya gore subject adi
const getSubjectName = (subject: string, lang: string) => {
  const names: Record<string, Record<string, string>> = {
    german:  { tr: 'Almanca', uk: 'Німецька', de: 'Deutsch', en: 'German',   es: 'Alemán'    },
    english: { tr: 'İngilizce', uk: 'Англійська', de: 'Englisch', en: 'English', es: 'Inglés' },
    spanish: { tr: 'İspanyolca', uk: 'Іспанська', de: 'Spanisch', en: 'Spanish', es: 'Español' },
  };
  return names[subject]?.[lang] || subject;
};

// Dile gore hashtag seti
const getSubjectHashtags = (subject: string, lang: ValidLangs): string[] => {
  const tags: Record<string, Record<ValidLangs, string[]>> = {
    german: {
      tr: ['#almanca', '#entegrasyon', '#telc', '#goethe', '#b1sınavı', '#neulinie', '#kelime', '#a1-c1', '#deutschkurs', '#sprachkurs'],
      uk: ['#німецька', '#інтеграція', '#telc', '#goethe', '#b1іспит', '#neulinie', '#словник', '#a1-c1', '#deutschkurs'],
      de: ['#deutsch', '#integrationskurs', '#telc', '#goethe', '#b1prüfung', '#vokabeln', '#deutschlernen', '#a1-c1', '#sprachkurs'],
      en: ['#german', '#integrationcourse', '#telc', '#goethe', '#b1exam', '#vocabulary', '#learngerman', '#a1toc1', '#deutschkurs'],
      es: ['#alemán', '#integración', '#telc', '#goethe', '#examenb1', '#vocabulario', '#aprenderalemán', '#a1-c1'],
    },
    english: {
      tr: ['#ingilizce', '#ielts', '#toefl', '#cambridge', '#iş-ingilizcesi', '#kelime', '#günlük-ingilizce', '#a1-c1'],
      uk: ['#англійська', '#ielts', '#toefl', '#cambridge', '#ділова', '#словник', '#щоденна', '#a1-c1'],
      de: ['#englisch', '#ielts', '#toefl', '#cambridge', '#businessenglish', '#vokabeln', '#englischlernen', '#a1-c1'],
      en: ['#english', '#ielts', '#toefl', '#cambridge', '#businessenglish', '#vocabulary', '#learnenglish', '#a1toc1'],
      es: ['#inglés', '#ielts', '#toefl', '#cambridge', '#inglésnegocios', '#vocabulario', '#aprenderinglés', '#a1-c1'],
    },
    spanish: {
      tr: ['#ispanyolca', '#dele', '#siele', '#latinamerika', '#gramer', '#kelime', '#a1-c1', '#ispanyolca-ogrenme'],
      uk: ['#іспанська', '#dele', '#siele', '#латинська', '#граматика', '#словник', '#a1-c1'],
      de: ['#spanisch', '#dele', '#siele', '#lateinamerika', '#grammatik', '#vokabeln', '#spanischlernen', '#a1-c1'],
      en: ['#spanish', '#dele', '#siele', '#latinamerica', '#grammar', '#vocabulary', '#learnspanish', '#a1toc1'],
      es: ['#español', '#dele', '#siele', '#latinoamérica', '#gramática', '#vocabulario', '#aprenderespañol', '#a1-c1'],
    },
  };
  return tags[subject]?.[lang] || tags[subject]?.en || [];
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string }> }): Promise<Metadata> {
  const { lang, subject } = await params;
  const baseUrl = 'https://memorlex.com';
  const subName = getSubjectName(subject, lang);

  const seoData: Record<string, { title: string, description: string }> = {
    tr: {
      title: `${subName} Öğren A1-C1 | Kelime, Hikaye, Dinleme | Memorlex`,
      description: `${subName} öğrenmek için A1-C1 kelime listeleri, flashcard, hikayeler, YouTube dinleme ve yazma alıştırmaları. Entegrasyon kursu ve sınav hazırlığı.`,
    },
    en: {
      title: `Learn ${subName} A1-C1 | Vocabulary, Stories, Listening | Memorlex`,
      description: `Learn ${subName} with A1-C1 vocabulary lists, flashcards, stories, YouTube listening and writing exercises. Exam prep for IELTS, TOEFL, DELE, Telc and Goethe.`,
    },
    uk: {
      title: `Вивчайте ${subName} A1-C1 | Слова, Історії, Аудіювання | Memorlex`,
      description: `Вивчайте ${subName} за рівнями A1-C1. Списки слів, картки, історії, YouTube та вправи для підготовки до іспитів.`,
    },
    de: {
      title: `${subName} lernen A1-C1 | Vokabeln, Geschichten, Hören | Memorlex`,
      description: `${subName} lernen mit Vokabellisten A1-C1, Karteikarten, Geschichten, YouTube-Hörübungen und Schreibtraining. Prüfungsvorbereitung Telc, Goethe, IELTS.`,
    },
    es: {
      title: `Aprender ${subName} A1-C1 | Vocabulario, Historias, Escucha | Memorlex`,
      description: `Aprende ${subName} con listas de vocabulario A1-C1, tarjetas, historias, YouTube y ejercicios de escritura. Preparación para DELE, SIELE, IELTS.`,
    },
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: getDynamicKeywords(subject, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}`,
      languages: {
        'tr': `${baseUrl}/tr/${subject}`,
        'en': `${baseUrl}/en/${subject}`,
        'de': `${baseUrl}/de/${subject}`,
        'uk': `${baseUrl}/uk/${subject}`,
        'es': `${baseUrl}/es/${subject}`,
        'x-default': `${baseUrl}/en/${subject}`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `${baseUrl}/${lang}/${subject}`,
      siteName: 'Memorlex',
      locale: lang,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const subjects = ['german', 'english', 'spanish'];
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
  const currentSubjectName = getSubjectName(subject, lang);
  const hashtags = getSubjectHashtags(subject, lang as ValidLangs);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://memorlex.com/${lang}` },
      { "@type": "ListItem", "position": 2, "name": currentSubjectName, "item": `https://memorlex.com/${lang}/${subject}` }
    ]
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${currentSubjectName} Learning Program - Memorlex`,
    "description": `Comprehensive ${currentSubjectName} course featuring A1 to C1 levels, podcasts, stories, YouTube listening and vocabulary practice.`,
    "educationalCredentialAwarded": "Language Proficiency",
    "occupationalCategory": "Language Learning",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": "PT10H"
    },
    "provider": { "@type": "Organization", "name": "Memorlex", "sameAs": "https://memorlex.com" }
  };

  // Dile ve konuya gore H1 basligi
  const pageTitle = lang === 'tr' ? `${currentSubjectName} Öğren`
    : lang === 'uk' ? `Вивчайте ${currentSubjectName}`
    : lang === 'de' ? `${currentSubjectName} Lernen`
    : lang === 'es' ? `Aprender ${currentSubjectName}`
    : `Learn ${currentSubjectName}`;

  // Seviye secim alt baslik
  const levelSelectTitle = dict.levels?.selectTitle
    || (lang === 'tr' ? 'Seviye seçerek öğrenmeye başla:'
      : lang === 'uk' ? 'Оберіть рівень для початку навчання:'
      : lang === 'de' ? 'Wähle ein Niveau, um zu beginnen:'
      : lang === 'es' ? 'Selecciona un nivel para empezar:'
      : 'Select a level to start learning:');

  // Konu bazli yontem metni
  const studyMethodText = {
    tr: lang === 'tr' ? `${currentSubjectName} öğrenmek için A1'den C1'e kelime listeleri, hikayeler, YouTube dinleme alıştırmaları ve yazma pratikleri. Telc, Goethe, IELTS ve DELE sınavlarına hazırlanın.` : '',
    uk: lang === 'uk' ? `Вивчайте ${currentSubjectName} від A1 до C1 за допомогою списків слів, історій, YouTube та вправ на письмо. Підготовка до Telc, Goethe, IELTS та DELE.` : '',
    de: lang === 'de' ? `Lerne ${currentSubjectName} von A1 bis C1 mit Vokabellisten, Geschichten, YouTube-Hörübungen und Schreibtraining. Vorbereitung auf Telc, Goethe, IELTS und DELE.` : '',
    es: lang === 'es' ? `Aprende ${currentSubjectName} de A1 a C1 con listas de vocabulario, historias, práctica de escucha en YouTube y ejercicios de escritura. Prepárate para DELE, SIELE e IELTS.` : '',
    en: `Master ${currentSubjectName} from A1 to C1 with vocabulary lists, stories, YouTube listening practice and writing exercises. Prepare for Telc, Goethe, IELTS and DELE exams.`,
  };

  const studyText = studyMethodText[lang as ValidLangs] || studyMethodText.en;

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white p-10 flex flex-col items-center transition-colors duration-300">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

      <div className="max-w-6xl w-full">

        {/* Baslik */}
        <h1 className="text-5xl md:text-6xl font-black mb-3 uppercase italic tracking-tighter text-amber-500">
          {pageTitle}
        </h1>

        {/* Konuya ozel hashtag bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-slate-500 dark:text-slate-400 mb-12 font-bold italic text-xl">
          {levelSelectTitle}
        </p>

        {/* Seviye Kartlari */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {ALL_LEVELS.map((lvl) => (
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
                {dict.start || (lang === 'es' ? 'EMPEZAR' : 'START')} →
              </span>
            </Link>
          ))}
        </div>

        {/* Calisma Yontemi */}
        <section className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-400">
            {lang === 'tr' ? `${currentSubjectName} Çalışma Yöntemi`
              : lang === 'uk' ? `Метод вивчення ${currentSubjectName}`
              : lang === 'de' ? `${currentSubjectName} Lernmethode`
              : lang === 'es' ? `Método de Estudio — ${currentSubjectName}`
              : `${currentSubjectName} Study Method`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed italic">
            {studyText}
          </p>
        </section>

        {/* Geri butonu */}
        <div className="mt-12 text-center">
          <Link
            href={`/${lang}`}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-black uppercase text-xs tracking-widest"
          >
            ← {dict.navigation?.back || (lang === 'es' ? 'Volver' : lang === 'tr' ? 'Geri' : lang === 'uk' ? 'Назад' : lang === 'de' ? 'Zurück' : 'Back')}
          </Link>
        </div>

      </div>
    </main>
  );
}
