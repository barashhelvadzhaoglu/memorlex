import Link from "next/link";
import fs from "fs";
import path from "path";
import { getDictionary } from "@/dictionaries";
import { Metadata } from "next";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

type StoryMeta = {
  id?: string;
  title: string;
  summary?: string;
  tags?: string[];
};

// Dile ve konuya gore subject adi
const getSubjectName = (subject: string, lang: string) => {
  const names: Record<string, Record<string, string>> = {
    german:  { tr: 'Almanca', uk: 'Німецька', de: 'Deutsch', en: 'German',  es: 'Alemán'   },
    english: { tr: 'İngilizce', uk: 'Англійська', de: 'Englisch', en: 'English', es: 'Inglés' },
    spanish: { tr: 'İspanyolca', uk: 'Іспанська', de: 'Spanisch', en: 'Spanish', es: 'Español' },
  };
  return names[subject]?.[lang] || subject;
};

// Her dil ve konu icin ayri keyword seti — hikaye odakli
const getStoriesKeywords = (subject: string, level: string, lang: string) => {
  const upperLvl = level.toUpperCase();
  const common = [
    "memorlex", "reading practice", "short stories", "language stories",
    "audio stories", "podcast", "listening comprehension", "reading comprehension",
    "vocabulary building", "fluent reading",
  ];
  const methods = [
    "native speaker", "youtube listening", "exam prep",
    "writing practice", "comprehension questions",
  ];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      // Genel
      `german ${level} stories`, `deutsch ${level} geschichten`,
      "learngerman", "germanstories", "deutschegeschichten", "germanpodcast",
      "deutschlernen", "germangrammar", "germanvocabulary", "speakgerman",
      "german listening", "german reading", "munich", "berlin", "austria",
      // Entegrasyon odakli
      "integrationkurs", "telc", "goethe", "testdaf", "osd",
      `telc ${level}`, `goethe ${level}`,
      "b1pruefung", "a1deutsch", "sprachkurs", "neulinie",
      "volkshochschule", "deutschintegration", "einbuergerungstest",
      "deutsch fuer anfaenger",
    ],
    english: [
      `english ${level} stories`, `english ${upperLvl} reading`,
      "learnenglish", "englishstories", "englishpodcast",
      "englishvocabulary", "englishgrammar", "speakenglish",
      "esl stories", "ielts", "toefl", "toeic",
      "cambridgeenglish", "businessenglish", "dailyenglish",
      `ielts ${level}`, `toefl ${level}`,
    ],
    spanish: [
      `spanish ${level} stories`, `historias en español ${level}`,
      "learnspanish", "spanishstories", "historiasenespañol",
      "spanishpodcast", "spanishvocabulary", "spanishgrammar",
      "aprenderespanol", "dele", "siele", "hablarespanol",
      "cuentos cortos", "leer español", "latinoamerica", "spain", "mexico",
      `dele ${level}`, `siele ${level}`,
    ],
  };

  return [
    `${subject} ${level} stories`,
    `${subject} ${upperLvl} reading`,
    ...(subjectSpecific[subject] || []),
    ...common,
    ...methods,
  ];
};

function safeReadStoryMeta(filePath: string): StoryMeta | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    if (!data?.title) return null;
    return {
      id: data.id,
      title: data.title,
      summary: data.summary,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch {
    return null;
  }
}

function normalizeStorySlug(slug?: string) {
  if (!slug) return "";
  return slug.toLowerCase().replace(/\.json$/, "").replace(/[-_]/g, "");
}

function getStoriesDir(subject: string, level: string) {
  const targetLang =
    subject === "german" ? "de"
    : subject === "english" ? "en"
    : subject === "spanish" ? "es"
    : subject;
  return path.join(process.cwd(), "src", "data", "stories", targetLang, level);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string }>;
}): Promise<Metadata> {
  const { lang, subject, level } = await params;
  const baseUrl = "https://memorlex.com";
  const upperLvl = level.toUpperCase();
  const subName = getSubjectName(subject, lang);

  const seoData: Record<ValidLangs, { title: string; description: string }> = {
    tr: {
      title: `${subName} ${upperLvl} Hikayeler | Okuma & Dinleme Pratikleri | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi okuma hikayeleri, YouTube dinleme pratikleri ve anlama soruları. Telc, Goethe, IELTS ve DELE sınavlarına hazırlanın.`,
    },
    en: {
      title: `${subName} ${upperLvl} Stories | Reading & Listening Practice | Memorlex`,
      description: `${subName} ${upperLvl} short stories with reading comprehension, YouTube listening and vocabulary exercises. Ideal for IELTS, TOEFL, DELE, Telc and Goethe prep.`,
    },
    uk: {
      title: `${subName} ${upperLvl} Оповідання | Читання та Аудіювання | Memorlex`,
      description: `${subName} ${upperLvl} — короткі оповідання, YouTube вправи та питання на розуміння. Підготовка до Telc, Goethe, IELTS та DELE.`,
    },
    de: {
      title: `${subName} ${upperLvl} Geschichten | Lesen & Hören | Memorlex`,
      description: `${subName} ${upperLvl} Kurzgeschichten mit Leseverstehen, YouTube-Hörübungen und Vokabeltraining. Ideal für Telc, Goethe und Integrationskurs-Vorbereitung.`,
    },
    es: {
      title: `${subName} ${upperLvl} Historias | Lectura y Escucha | Memorlex`,
      description: `${subName} ${upperLvl} — historias cortas con comprensión lectora, escucha en YouTube y ejercicios de vocabulario. Preparación para DELE, SIELE e IELTS.`,
    },
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: getStoriesKeywords(subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}/stories`,
      languages: {
        tr: `${baseUrl}/tr/${subject}/${level}/stories`,
        en: `${baseUrl}/en/${subject}/${level}/stories`,
        de: `${baseUrl}/de/${subject}/${level}/stories`,
        uk: `${baseUrl}/uk/${subject}/${level}/stories`,
        es: `${baseUrl}/es/${subject}/${level}/stories`,
        "x-default": `${baseUrl}/en/${subject}/${level}/stories`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `${baseUrl}/${lang}/${subject}/${level}/stories`,
      siteName: "Memorlex",
      locale: lang,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const uiLangs = ["en", "tr", "de", "uk", "es"];
  const storiesBase = path.join(process.cwd(), "src", "data", "stories");
  if (!fs.existsSync(storiesBase)) return [];

  const params: { lang: string; subject: string; level: string }[] = [];
  const learningLangs = fs
    .readdirSync(storiesBase)
    .filter((d) => fs.lstatSync(path.join(storiesBase, d)).isDirectory());

  for (const ll of learningLangs) {
    const subject =
      ll === "de" ? "german"
      : ll === "en" ? "english"
      : ll === "es" ? "spanish"
      : ll;
    const levels = fs
      .readdirSync(path.join(storiesBase, ll))
      .filter((lvl) =>
        fs.lstatSync(path.join(storiesBase, ll, lvl)).isDirectory()
      );
    for (const level of levels) {
      for (const lang of uiLangs) {
        params.push({ lang, subject, level });
      }
    }
  }
  return params;
}

export default async function StoriesLevelPage({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string }>;
}) {
  const { lang, subject, level } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const storiesDir = getStoriesDir(subject, level);
  const currentSubjectName = getSubjectName(subject, lang);

  let stories: { slug: string; meta: StoryMeta }[] = [];

  if (fs.existsSync(storiesDir)) {
    const files = fs
      .readdirSync(storiesDir)
      .filter((f) => f.endsWith(".json"));
    stories = files
      .map((file) => {
        const canonicalSlug = normalizeStorySlug(file);
        const meta = safeReadStoryMeta(path.join(storiesDir, file));
        return meta ? { slug: canonicalSlug, meta } : null;
      })
      .filter(Boolean) as { slug: string; meta: StoryMeta }[];

    stories.sort((a, b) => {
      const numA = parseInt(a.slug.replace(/[^0-9]/g, "")) || 0;
      const numB = parseInt(b.slug.replace(/[^0-9]/g, "")) || 0;
      return numA - numB;
    });
  }

  // Dile gore etiketler
  const storiesTitle =
    (dict as any)?.stories?.title ||
    (lang === "tr" ? "Hikâyeler"
      : lang === "uk" ? "Оповідання"
      : lang === "de" ? "Geschichten"
      : lang === "es" ? "Historias"
      : "Stories");

  const chapterLabel =
    lang === "tr" ? "Bölüm"
    : lang === "uk" ? "Розділ"
    : lang === "de" ? "Kapitel"
    : lang === "es" ? "Capítulo"
    : "Chapter";

  const readLabel =
    lang === "tr" ? "Oku →"
    : lang === "uk" ? "Читати →"
    : lang === "de" ? "Lesen →"
    : lang === "es" ? "Leer →"
    : "Read →";

  const backText =
    dict.navigation?.back ||
    (lang === "tr" ? "Geri"
      : lang === "uk" ? "Назад"
      : lang === "de" ? "Zurück"
      : lang === "es" ? "Volver"
      : "Back");

  const emptyText =
    lang === "tr" ? "Henüz hikaye eklenmedi"
    : lang === "uk" ? "Історій ще немає"
    : lang === "de" ? "Noch keine Geschichten"
    : lang === "es" ? "Aún no hay historias"
    : "No stories yet";

  // Alt baslik metni
  const subTitle =
    lang === "tr"
      ? `${currentSubjectName} ${level.toUpperCase()} seviyesine uygun hikayeler ile okuma ve dinleme becerinizi geliştirin.`
      : lang === "uk"
      ? `Покращуйте навички читання та аудіювання з ${currentSubjectName} ${level.toUpperCase()} оповіданнями.`
      : lang === "de"
      ? `Verbessere dein Lese- und Hörverstehen mit ${currentSubjectName}-Geschichten auf Niveau ${level.toUpperCase()}.`
      : lang === "es"
      ? `Mejora tu comprensión lectora y auditiva con historias de ${currentSubjectName} nivel ${level.toUpperCase()}.`
      : `Improve your ${currentSubjectName} reading and listening skills with ${level.toUpperCase()} level stories.`;

  // Schema.org ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${storiesTitle} — ${currentSubjectName} ${level.toUpperCase()}`,
    itemListElement: stories.map((s, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://memorlex.com/${lang}/${subject}/${level}/stories/${s.slug}`,
      name: s.meta.title,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">

        {/* Baslik */}
        <h1 className="text-4xl font-black mb-3 uppercase italic tracking-tighter text-amber-500">
          {storiesTitle} — {currentSubjectName} {level.toUpperCase()}
        </h1>

        {/* SEO Alt Baslik */}
        <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-10">
          {subTitle}
        </p>

        {/* Hikaye Listesi */}
        <div className="grid gap-6">
          {stories.map(({ slug, meta }) => (
            <Link
              key={slug}
              href={`/${lang}/${subject}/${level}/stories/${slug}`}
              className="p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800
                         bg-slate-50 dark:bg-slate-900
                         hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10
                         transition-all group shadow-sm flex justify-between items-center"
            >
              <div className="flex-1 min-w-0">
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  {chapterLabel} {parseInt(slug.replace(/[^0-9]/g, "")) || "?"}
                </span>
                <div className="text-2xl font-black mt-2 group-hover:text-amber-500 transition-colors">
                  {meta.title}
                </div>
                {meta.summary && (
                  <p className="mt-2 text-slate-500 dark:text-slate-400 italic text-sm line-clamp-2">
                    {meta.summary}
                  </p>
                )}
                {meta.tags && meta.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {meta.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-bold tracking-widest"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm font-bold italic opacity-40 group-hover:opacity-100 whitespace-nowrap ml-6 transition-opacity">
                {readLabel}
              </span>
            </Link>
          ))}

          {stories.length === 0 && (
            <div className="text-center py-20 opacity-30 font-black italic uppercase tracking-widest">
              {emptyText}
            </div>
          )}
        </div>

        {/* Geri Butonu */}
        <div className="mt-12">
          <Link
            href={`/${lang}/${subject}/${level}`}
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors font-black uppercase text-xs tracking-widest"
          >
            ← {backText}
          </Link>
        </div>

      </div>
    </main>
  );
}
