import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import StoryQuestions from "./StoryQuestions";
import PracticeAccordion from "./PracticeAccordion";
import { Suspense } from "react";
import { Metadata } from "next";

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

function normalizeStorySlug(slug: string) {
  return slug.toLowerCase().replace(/\.json$/, "").replace(/[-_]/g, "");
}

function getTargetLearningLang(subject: string) {
  if (subject === "german") return "de";
  if (subject === "english") return "en";
  if (subject === "spanish") return "es";
  return subject;
}

function getStoriesDir(subject: string, level: string) {
  const targetLang = getTargetLearningLang(subject);
  return path.join(process.cwd(), "src", "data", "stories", targetLang, level);
}

// Her dil ve konu icin ayri keyword seti — hikaye detay sayfasi
const getStoryKeywords = (title: string, subject: string, level: string, lang: string) => {
  const common = [
    "memorlex", "interactive stories", "reading comprehension",
    "language learning", "learn with stories", "short stories",
    "listening comprehension", "vocabulary building", "podcast",
  ];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      "learngerman", "germanstories", "deutschegeschichten", "germanpodcast",
      "deutschlernen", "germanreading", "germanlistening", "germangrammar",
      // Entegrasyon odakli
      "integrationkurs", "telc", "goethe", "testdaf", "neulinie",
      "volkshochschule", "b1pruefung", "deutschintegration", "sprachkurs",
    ],
    english: [
      "learnenglish", "englishstories", "englishpodcast",
      "englishreading", "englishlistening", "esl", "esol",
      "ielts", "toefl", "toeic", "cambridgeenglish", "businessenglish",
    ],
    spanish: [
      "learnspanish", "spanishstories", "historiasenespañol",
      "spanishpodcast", "spanishreading", "aprenderespanol",
      "dele", "siele", "hablarespanol", "latinoamerica",
    ],
  };

  return [
    title,
    `${title} ${subject}`,
    `${subject} ${level} story`,
    `${subject} ${level} reading`,
    ...(subjectSpecific[subject] || []),
    ...common,
  ];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string; story: string }>;
}): Promise<Metadata> {
  const { lang, subject, level, story } = await params;
  const baseUrl = "https://memorlex.com";
  const dir = getStoriesDir(subject, level);

  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const matchedFile = files.find((f) => normalizeStorySlug(f) === story);
  if (!matchedFile) return {};

  const data = JSON.parse(
    fs.readFileSync(path.join(dir, matchedFile), "utf8")
  );
  const upperLvl = level.toUpperCase();
  const subName = getSubjectName(subject, lang);

  const seoData: Record<ValidLangs, { title: string; description: string }> = {
    tr: {
      title: `${data.title} — ${subName} ${upperLvl} Hikayesi | Memorlex`,
      description: `"${data.title}" hikayesiyle ${subName} öğrenin. Okuma metni, interaktif sorular, kelime flashcard ve yazma pratikleri. Telc, Goethe ve sınav hazırlığı için ideal.`,
    },
    en: {
      title: `${data.title} — ${subName} ${upperLvl} Story | Memorlex`,
      description: `Learn ${subName} with the story "${data.title}". Includes reading text, interactive questions, flashcards and writing practice. Great for IELTS, TOEFL, DELE, Telc and Goethe prep.`,
    },
    uk: {
      title: `${data.title} — ${subName} ${upperLvl} Оповідання | Memorlex`,
      description: `Вивчайте ${subName} з оповіданням "${data.title}". Текст для читання, інтерактивні запитання, картки та письмові вправи. Підготовка до Telc, Goethe, IELTS та DELE.`,
    },
    de: {
      title: `${data.title} — ${subName} ${upperLvl} Geschichte | Memorlex`,
      description: `Lerne ${subName} mit der Geschichte "${data.title}". Lesetext, interaktive Fragen, Karteikarten und Schreibübungen. Ideal für Telc, Goethe und Integrationskurs-Vorbereitung.`,
    },
    es: {
      title: `${data.title} — Historia de ${subName} ${upperLvl} | Memorlex`,
      description: `Aprende ${subName} con la historia "${data.title}". Texto de lectura, preguntas interactivas, tarjetas y ejercicios de escritura. Preparación para DELE, SIELE e IELTS.`,
    },
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: getStoryKeywords(data.title, subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}/stories/${story}`,
      languages: {
        tr: `${baseUrl}/tr/${subject}/${level}/stories/${story}`,
        en: `${baseUrl}/en/${subject}/${level}/stories/${story}`,
        de: `${baseUrl}/de/${subject}/${level}/stories/${story}`,
        uk: `${baseUrl}/uk/${subject}/${level}/stories/${story}`,
        es: `${baseUrl}/es/${subject}/${level}/stories/${story}`,
        "x-default": `${baseUrl}/en/${subject}/${level}/stories/${story}`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `${baseUrl}/${lang}/${subject}/${level}/stories/${story}`,
      siteName: "Memorlex",
      type: "article",
      locale: lang,
    },
  };
}

export async function generateStaticParams() {
  const uiLangs: ValidLangs[] = ["en", "tr", "de", "uk", "es"];
  const base = path.join(process.cwd(), "src", "data", "stories");
  if (!fs.existsSync(base)) return [];

  const params: {
    lang: string;
    subject: string;
    level: string;
    story: string;
  }[] = [];

  const learningLangDirs = fs
    .readdirSync(base)
    .filter((d) => fs.lstatSync(path.join(base, d)).isDirectory());

  for (const ll of learningLangDirs) {
    const subject =
      ll === "de" ? "german"
      : ll === "en" ? "english"
      : ll === "es" ? "spanish"
      : ll;
    const subjectDir = path.join(base, ll);
    const levels = fs
      .readdirSync(subjectDir)
      .filter((lvl) =>
        fs.lstatSync(path.join(subjectDir, lvl)).isDirectory()
      );

    for (const lvl of levels) {
      const levelDir = path.join(subjectDir, lvl);
      const files = fs
        .readdirSync(levelDir)
        .filter((f) => f.endsWith(".json"));

      for (const file of files) {
        const storySlug = normalizeStorySlug(file);
        for (const lang of uiLangs) {
          params.push({ lang, subject, level: lvl, story: storySlug });
        }
      }
    }
  }
  return params;
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{
    lang: string;
    subject: string;
    level: string;
    story: string;
  }>;
}) {
  const { lang, subject, level, story } = await params;

  const dict = await getDictionary(lang as ValidLangs);
  const dir = getStoriesDir(subject, level);

  if (!fs.existsSync(dir)) return notFound();

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const matchedIndex = files.findIndex(
    (f) => normalizeStorySlug(f) === story
  );

  if (matchedIndex === -1) return notFound();

  const matchedFileName = files[matchedIndex];
  const data = JSON.parse(
    fs.readFileSync(path.join(dir, matchedFileName), "utf8")
  );

  const currentNum = matchedIndex + 1;
  const nextFile = files[matchedIndex + 1];
  const nextStorySlug = nextFile ? normalizeStorySlug(nextFile) : null;
  const nextNum = matchedIndex + 2;

  // Video Schema (Google Video Search)
  const videoSchema = data.youtubeId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: data.title,
        description: `Language learning story for ${subject} ${level}`,
        thumbnailUrl: `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`,
        contentUrl: `https://www.youtube.com/watch?v=${data.youtubeId}`,
        embedUrl: `https://www.youtube.com/embed/${data.youtubeId}`,
        uploadDate: "2026-01-14T08:00:00+08:00",
      }
    : null;

  // Dile gore etiketler
  const chapterLabel =
    lang === "tr" ? "BÖLÜM"
    : lang === "uk" ? "РОЗДІЛ"
    : lang === "de" ? "KAPITEL"
    : lang === "es" ? "CAPÍTULO"
    : "CHAPTER";

  const studyVocabLabel =
    lang === "tr" ? "Bu hikayede yer alan önemli kelimeleri çalış"
    : lang === "uk" ? "Вивчіть важливі слова з цього оповідання"
    : lang === "de" ? "Lerne die wichtigen Wörter aus dieser Geschichte"
    : lang === "es" ? "Estudia las palabras importantes de esta historia"
    : "Study important words from this story";

  const flashcardBtn =
    lang === "tr" ? "FLASHCARD İLE ÇALIŞ"
    : lang === "uk" ? "ВЧИТИ З КАРТКАМИ"
    : lang === "de" ? "MIT KARTEIKARTEN LERNEN"
    : lang === "es" ? "ESTUDIAR CON TARJETAS"
    : "STUDY WITH FLASHCARDS";

  const writingBtn =
    lang === "tr" ? "YAZARAK ÇALIŞ"
    : lang === "uk" ? "ВЧИТИ НАПИСАННЯМ"
    : lang === "de" ? "DURCH SCHREIBEN LERNEN"
    : lang === "es" ? "ESTUDIAR ESCRIBIENDO"
    : "STUDY BY WRITING";

  const nextLabel =
    lang === "tr" ? "Sıradaki Hikaye"
    : lang === "uk" ? "Наступне оповідання"
    : lang === "de" ? "Nächste Geschichte"
    : lang === "es" ? "Siguiente Historia"
    : "Next Story";

  const finishedLabel =
    lang === "tr" ? "Tüm hikaye serisini tamamladın!"
    : lang === "uk" ? "Ви завершили всю серію оповідань!"
    : lang === "de" ? "Du hast die gesamte Serie abgeschlossen!"
    : lang === "es" ? "¡Has completado toda la serie!"
    : "You completed the entire series!";

  const backLabel =
    lang === "tr" ? "Hikayelere Dön"
    : lang === "uk" ? "Назад до оповідань"
    : lang === "de" ? "Zurück zu den Geschichten"
    : lang === "es" ? "Volver a Historias"
    : "Back to Stories";

  return (
    <main className="min-h-screen p-6 md:p-10 bg-white dark:bg-slate-950 dark:text-white transition-colors duration-300">

      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}

      <div className="max-w-3xl mx-auto">

        {/* Ust bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {level.toUpperCase()} Stories
          </div>
          <div className="bg-amber-500/10 text-amber-500 text-[10px] px-4 py-1.5 rounded-full font-black italic uppercase border border-amber-500/20">
            {chapterLabel} {currentNum}
          </div>
        </div>

        {/* Baslik */}
        <h1 className="text-4xl md:text-5xl font-black text-amber-500 italic uppercase mb-10 leading-tight tracking-tighter">
          {data.title}
        </h1>

        {/* YouTube Video */}
        {data.youtubeId && (
          <div className="mb-12 aspect-video w-full rounded-[30px] overflow-hidden shadow-2xl border-4 border-slate-50 dark:border-slate-900 bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${data.youtubeId}?rel=0&modestbranding=1`}
              title={data.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Metin */}
        <div className="space-y-6 text-xl leading-relaxed font-medium text-slate-700 dark:text-slate-200 mb-16">
          {Array.isArray(data.text) ? (
            data.text.map((p: string, i: number) => <p key={i}>{p}</p>)
          ) : (
            <p>{data.text}</p>
          )}
        </div>

        {/* Sorular */}
        {data.questions && (
          <div className="mb-20">
            <StoryQuestions questions={data.questions} lang={lang} />
          </div>
        )}

        {/* Kelime Calisma Butonlari */}
        <div className="pt-12 border-t-8 border-slate-50 dark:border-slate-900">
          <div className="text-center mb-12">
            <h2 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 italic leading-relaxed">
              {studyVocabLabel}
            </h2>
            <PracticeAccordion
              vocab={data.vocab || data.vocabulary || []}
              uiLang={lang}
              subject={subject}
              dict={dict}
            />
          </div>

          {/* Sonraki Hikaye */}
          {nextStorySlug ? (
            <div className="mt-16 group">
              <Link
                href={`/${lang}/${subject}/${level}/stories/${nextStorySlug}`}
                className="block w-full p-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[40px] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 relative overflow-hidden"
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">
                      {nextLabel}
                    </span>
                    <span className="text-2xl md:text-4xl font-black italic uppercase leading-none tracking-tighter">
                      {chapterLabel} {nextNum} &rarr;
                    </span>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-9xl font-black italic opacity-[0.05] pointer-events-none uppercase select-none">
                  NEXT
                </div>
              </Link>
            </div>
          ) : (
            <div className="mt-12 p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] text-center border-4 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-sm font-black text-slate-300 italic uppercase tracking-[0.3em]">
                {finishedLabel}
              </span>
            </div>
          )}
        </div>

        {/* Vocab linkleri */}
        <div className="mt-12 p-6 rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            {lang === 'tr' ? 'Kelime Listelerini Çalış' 
             : lang === 'es' ? 'Estudiar Vocabulario'
             : lang === 'de' ? 'Vokabeln Lernen'
             : lang === 'uk' ? 'Вивчати слова'
             : 'Study Vocabulary'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {[`/${lang}/${subject}/${level}/topic`, `/${lang}/${subject}/${level}/integration`, `/${lang}/${subject}/${level}/work`].map((href) => {
              const cat = href.split('/').pop() || '';
              return (
                <a key={cat} href={href}
                   className="px-4 py-2 text-xs font-black uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20">
                  {cat === 'topic' 
                    ? (lang === 'tr' ? '📚 Konu Bazlı' : lang === 'es' ? '📚 Por Temas' : '📚 Topic Based')
                    : cat === 'integration'
                    ? (lang === 'tr' ? '🏫 Entegrasyon' : lang === 'es' ? '🏫 Integración' : '🏫 Integration')
                    : (lang === 'tr' ? '💼 İş Dünyası' : lang === 'es' ? '💼 Trabajo' : '💼 Work')}
                </a>
              );
            })}
          </div>
        </div>

        {/* Geri Butonu */}
        <div className="mt-12 text-center">
          <Link
            href={`/${lang}/${subject}/${level}/stories`}
            className="text-slate-500 font-bold italic hover:text-amber-500 transition-colors uppercase text-xs tracking-widest"
          >
            ← {backLabel}
          </Link>
        </div>

      </div>
    </main>
  );
}
