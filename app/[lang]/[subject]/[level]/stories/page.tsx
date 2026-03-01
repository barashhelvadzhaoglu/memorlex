import Link from "next/link";
import fs from "fs";
import path from "path";
import { getDictionary } from "@/dictionaries";
import { Metadata } from "next";

// ✅ Desteklenen diller
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

type StoryMeta = {
  id?: string;
  title: string;
  summary?: string;
  tags?: string[];
};

// SEO İçerik Havuzu - Hikaye Odaklı Genişletilmiş Liste
const getStoriesKeywords = (subject: string, level: string, lang: string) => {
  const upperLvl = level.toUpperCase();
  const common = ["memorlex", "reading practice", "short stories", "language stories", "audio stories", "podcast", "daily news"];
  const methods = ["reading comprehension", "vocabulary building", "fluent reading", "native speaker", "okuma pratiği", "hikaye ile öğren"];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      "#learngerman", "#deutschlernen", "#germanstories", "#deutschegeschichten", "#germanpodcast", "#germany", 
      "#deutschkurs", "vokabeln lernen", "munich", "berlin", "goetheinstitut", "telc", "b1 prüfung", "a1 deutsch",
      "deutsch für anfänger", "integrationkurs", "dw_deutsch", "germangrammar"
    ],
    english: [
      "#learnenglish", "#englishstories", "#englishpodcast", "#usa", "#uk", "#canada", "#ielts", "#toefl", 
      "english vocabulary", "reading english", "esl stories", "cambridge english", "oxford reading"
    ],
    spanish: [
      "#learnspanish", "#historiasenespañol", "#spanishpodcast", "#spain", "#mexico", "#dele", 
      "vocabulario español", "leer español", "aprender español", "cuentos cortos", "hablar español"
    ]
  };

  return [
    `${subject} ${level} stories`,
    `${subject} ${level} hikayeler`,
    ...(subjectSpecific[subject] || []),
    ...common,
    ...methods
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
  const targetLang = subject === "german" ? "de" : subject === "english" ? "en" : subject === "spanish" ? "es" : subject;
  return path.join(process.cwd(), "src", "data", "stories", targetLang, level);
}

export async function generateMetadata({ params }: { params: Promise<any> }): Promise<Metadata> {
  const { lang, subject, level } = await params;
  const baseUrl = 'https://memorlex.com';
  
  const subName = subject === "german" 
    ? (lang === "tr" ? "Almanca" : lang === "es" ? "Alemán" : "German") 
    : (subject === "spanish" ? (lang === "tr" ? "İspanyolca" : "Spanish") : (lang === "tr" ? "İngilizce" : "English"));
  
  const titleText = lang === "es" ? `Historias` : lang === "tr" ? "Hikâyeler" : "Stories";
  const upperLvl = level.toUpperCase();

  const descriptions: Record<ValidLangs, string> = {
    tr: `${subName} ${upperLvl} seviyesi okuma parçaları ve hikayeler. Kelime dağarcığınızı gerçek metinlerle geliştirin.`,
    en: `${subName} ${upperLvl} reading passages and short stories. Improve your vocabulary with real-life texts.`,
    es: `${subName} ${upperLvl} historias y cuentos cortos. Mejora tu vocabulario con textos reales.`,
    uk: `${subName} ${upperLvl} історії та тексти для читання. Покращуйте свій словниковий запас.`,
    de: `${subName} ${upperLvl} Geschichten und Lesetexte. Verbessern Sie Ihren Wortschatz mit echten Texten.`
  };

  return { 
    title: `${subName} ${upperLvl} ${titleText} | Memorlex`,
    description: descriptions[lang as ValidLangs] || descriptions.en,
    keywords: getStoriesKeywords(subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}/stories`,
      languages: {
        'tr': `${baseUrl}/tr/${subject}/${level}/stories`,
        'en': `${baseUrl}/en/${subject}/${level}/stories`,
        'de': `${baseUrl}/de/${subject}/${level}/stories`,
        'uk': `${baseUrl}/uk/${subject}/${level}/stories`,
        'es': `${baseUrl}/es/${subject}/${level}/stories`,
        'x-default': `${baseUrl}/en/${subject}/${level}/stories`
      }
    }
  };
}

export async function generateStaticParams() {
  const uiLangs = ["en", "tr", "de", "uk", "es"];
  const storiesBase = path.join(process.cwd(), "src", "data", "stories");
  if (!fs.existsSync(storiesBase)) return [];
  const params: any[] = [];
  const learningLangs = fs.readdirSync(storiesBase).filter((d) => fs.lstatSync(path.join(storiesBase, d)).isDirectory());

  for (const ll of learningLangs) {
    const subject = ll === "de" ? "german" : ll === "en" ? "english" : ll === "es" ? "spanish" : ll;
    const levels = fs.readdirSync(path.join(storiesBase, ll)).filter((lvl) => fs.lstatSync(path.join(storiesBase, ll, lvl)).isDirectory());
    for (const level of levels) {
      for (const lang of uiLangs) {
        params.push({ lang, subject, level });
      }
    }
  }
  return params;
}

export default async function StoriesLevelPage({ params }: { params: Promise<{ lang: string; subject: string; level: string }> }) {
  const { lang, subject, level } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const storiesDir = getStoriesDir(subject, level);

  let stories: { slug: string; meta: StoryMeta }[] = [];

  if (fs.existsSync(storiesDir)) {
    const files = fs.readdirSync(storiesDir).filter((f) => f.endsWith(".json"));
    stories = files.map((file) => {
      const canonicalSlug = normalizeStorySlug(file);
      const meta = safeReadStoryMeta(path.join(storiesDir, file));
      return meta ? { slug: canonicalSlug, meta } : null;
    }).filter(Boolean) as any[];

    stories.sort((a, b) => {
      const numA = parseInt(a.slug.replace(/[^0-9]/g, "")) || 0;
      const numB = parseInt(b.slug.replace(/[^0-9]/g, "")) || 0;
      return numA - numB;
    });
  }

  const storiesTitle = (dict as any)?.stories?.title || 
    (lang === "tr" ? "Hikâyeler" : lang === "es" ? "Historias" : lang === "de" ? "Geschichten" : "Stories");

  // ✅ Google Rich Snippets (ItemList Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${storiesTitle} - ${level.toUpperCase()}`,
    "itemListElement": stories.map((s, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://memorlex.com/${lang}/${subject}/${level}/stories/${s.slug}`,
      "name": s.meta.title
    }))
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-3 uppercase italic tracking-tighter text-amber-500">
          {storiesTitle} - {level.toUpperCase()}
        </h1>
        
        {/* SEO Alt Başlık */}
        <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-8">
            {lang === 'tr' ? `Seviyenize uygun ${subject} hikayeleri ile kelime bilginizi okuyarak geliştirin.` : `Improve your ${subject} vocabulary by reading stories suited to your level.`}
        </p>

        <div className="grid gap-6 mt-10">
          {stories.map(({ slug, meta }) => (
            <Link key={slug} href={`/${lang}/${subject}/${level}/stories/${slug}`} className="p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-amber-500 transition-all group shadow-sm flex justify-between items-center">
              <div>
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  {lang === "tr" ? "Bölüm" : lang === "es" ? "Capítulo" : "Chapter"} {parseInt(slug.replace(/[^0-9]/g, "")) || "?"}
                </span>
                <div className="text-2xl font-black mt-2 group-hover:text-amber-500">{meta.title}</div>
                <p className="mt-2 text-slate-500 italic text-sm line-clamp-2">{meta.summary}</p>
                {/* Etiketleri SEO için küçükçe ekleyelim */}
                <div className="mt-3 flex gap-2">
                    {meta.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] text-slate-400 uppercase font-bold">#{tag}</span>
                    ))}
                </div>
              </div>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100 whitespace-nowrap ml-4">
                {lang === "tr" ? "Oku →" : lang === "es" ? "Leer →" : lang === "de" ? "Lesen →" : lang === "uk" ? "Читати →" : "Read →"}
              </span>
            </Link>
          ))}
          {stories.length === 0 && (
            <div className="text-center py-20 opacity-30 font-black italic uppercase tracking-widest">
                {lang === "tr" ? "Henüz hikaye eklenmedi" : lang === "es" ? "Aún no hay historias" : "No stories yet"}
            </div>
          )}
        </div>
        
        <div className="mt-10">
          <Link href={`/${lang}/${subject}/${level}`} className="text-slate-500 font-bold italic hover:text-amber-500 transition-colors uppercase text-xs tracking-widest">
            ← {dict.navigation?.back || (lang === "es" ? "Volver" : "Back")}
          </Link>
        </div>
      </div>
    </main>
  );
}