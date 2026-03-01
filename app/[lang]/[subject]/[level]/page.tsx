import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

// ✅ Desteklenen diller
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// SEO İçerik Havuzu (Genişletilmiş Hashtag ve Keyword Listesi)
const getLevelKeywords = (subject: string, level: string, lang: string) => {
  const upperLvl = level.toUpperCase();
  const common = ["memorlex", "language learning", "vocabulary units", "flashcards", "integration course", "daily news"];
  const regions = ["germany", "usa", "uk", "canada", "europe", "india", "egypt", "spain", "mexico", "turkey"];
  const methods = ["short stories", "reading comprehension", "listening practice", "pronunciation", "writing exercises"];

  const subjectSpecific: Record<string, string[]> = {
    german: [
      `learn german ${level}`, `deutsch lernen ${level}`, `german ${upperLvl} vocabulary`, `deutschkurs ${level}`,
      "german grammar", "german lessons", "studygerman", "germanvocabulary", "speakgerman", "learngermanpodcast",
      "integrationkurs", "vokabeln", "goetheinstitut", "telc", "testdaf", "dw_deutsch", "munich", "berlin",
      "german stories", "deutsch übungen"
    ],
    english: [
      `learn english ${level}`, `english ${upperLvl} vocabulary`, `english course ${level}`, `study english ${level}`,
      "english grammar", "english lessons", "speakenglish", "ielts", "toefl", "esl", "businessenglish",
      "cambridgeenglish", "oxfordenglish", "dailyenglish", "vocabularybuilding", "english stories", "english practice"
    ],
    spanish: [
      `learn spanish ${level}`, `spanish ${upperLvl} vocabulary`, `aprender español ${level}`, `curso de español ${level}`,
      "spanish grammar", "spanish lessons", "speakspanish", "dele", "vocabulario", "hablarespanol", "español",
      "cursodeespanol", "escritura", "spanish stories", "lectura español", "spain", "mexico"
    ]
  };

  return [...(subjectSpecific[subject] || []), ...common, ...regions, ...methods, `${subject} ${level} units`];
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }): Promise<Metadata> {
  const { lang, subject, level } = await params;
  const baseUrl = 'https://memorlex.com';
  const upperLvl = level.toUpperCase();

  const subName = subject === 'german' 
    ? (lang === 'tr' ? 'Almanca' : lang === 'es' ? 'Alemán' : 'German') 
    : (subject === 'spanish' ? (lang === 'tr' ? 'İspanyolca' : lang === 'en' ? 'Spanish' : 'Español') : (lang === 'tr' ? 'İngilizce' : lang === 'es' ? 'Inglés' : 'English'));

  const seoData: Record<string, { title: string, description: string }> = {
    tr: {
      title: `${subName} ${upperLvl} Seviyesi Tüm Üniteler ve Hikayeler | Memorlex`,
      description: `${subName} ${upperLvl} seviyesi için özel hazırlanmış kelime üniteleri, okuma parçaları ve hikayeler. Entegrasyon kursu ve günlük pratik için ideal.`
    },
    en: {
      title: `${subName} ${upperLvl} All Units and Stories | Memorlex`,
      description: `Complete list of ${subName} ${upperLvl} vocabulary units and short stories. Practice your language skills with writing and flashcards.`
    },
    uk: {
      title: `${subName} ${upperLvl} Усі розділи та історії | Memorlex`,
      description: `Вивчайте ${subName} ${upperLvl} за розділами: словниковий запас, цікаві історії та вправи для навчання.`
    },
    de: {
      title: `${subName} ${upperLvl} Alle Einheiten und Geschichten | Memorlex`,
      description: `Lerne ${subName} auf dem Niveau ${upperLvl} mit Vokabeleinheiten, Geschichten ve interaktiven Übungen.`
    },
    es: {
      title: `${subName} ${upperLvl} Todas las Unidades e Historias | Memorlex`,
      description: `Estudia las unidades de vocabulario y las historias de ${subName} nivel ${upperLvl}. Mejora tu fluidez con práctica diaria.`
    }
  };

  const current = seoData[lang as ValidLangs] || seoData.en;

  return {
    title: current.title,
    description: current.description,
    keywords: getLevelKeywords(subject, level, lang),
    alternates: {
      canonical: `${baseUrl}/${lang}/${subject}/${level}`,
      languages: {
        'tr': `${baseUrl}/tr/${subject}/${level}`,
        'en': `${baseUrl}/en/${subject}/${level}`,
        'de': `${baseUrl}/de/${subject}/${level}`,
        'uk': `${baseUrl}/uk/${subject}/${level}`,
        'es': `${baseUrl}/es/${subject}/${level}`,
        'x-default': `${baseUrl}/en/${subject}/${level}`
      }
    },
    openGraph: {
      title: current.title,
      description: current.description,
      locale: lang,
      type: 'website'
    }
  };
}

export async function generateStaticParams() {
  const languages = ['en', 'tr', 'de', 'uk', 'es'];
  const subjects = ['german', 'english', 'spanish'];
  const levels = ['a1', 'a2', 'b1'];

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

export default async function LevelPage({ params }: { params: Promise<{ lang: string, subject: string, level: string }> }) {
  const { lang, subject, level } = await params;
  const dict = await getDictionary(lang as ValidLangs);

  const subjectsDict = dict.subjects as Record<string, string> | undefined;
  const categoriesDict = dict.categories as Record<string, string> | undefined;

  const targetLang = subject === 'german' ? 'de' : (subject === 'spanish' ? 'es' : subject);
  const dataPath = path.join(process.cwd(), 'src', 'data', 'vocabulary', targetLang, level);

  let categories: string[] = [];
  if (fs.existsSync(dataPath)) {
    categories = fs.readdirSync(dataPath).filter(f =>
      fs.lstatSync(path.join(dataPath, f)).isDirectory()
    );
  }

  const storiesTitle = (dict as any)?.stories?.title || (lang === "tr" ? "HİKÂYELER" : lang === "es" ? "HISTORIAS" : lang === "de" ? "GESCHICHTEN" : "STORIES");
  const storiesSub = lang === "tr" ? "hikayeler →" : lang === "es" ? "historias →" : "stories →";

  // ✅ Google Rich Snippets (Breadcrumb List)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Memorlex", "item": `https://memorlex.com/${lang}` },
      { "@type": "ListItem", "position": 2, "name": subjectsDict?.[subject] || subject, "item": `https://memorlex.com/${lang}/${subject}` },
      { "@type": "ListItem", "position": 3, "name": level.toUpperCase(), "item": `https://memorlex.com/${lang}/${subject}/${level}` }
    ]
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10 transition-colors duration-300">
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-amber-500">
          {subjectsDict?.[subject] || subject} - {level.toUpperCase()}
        </h1>

        <div className="grid gap-6">
          {/* STORIES CARD */}
          <Link
            href={`/${lang}/${subject}/${level}/stories`}
            className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                       bg-slate-50 border-slate-200 text-slate-900
                       dark:bg-slate-900 dark:border-slate-800 dark:text-white
                       hover:bg-amber-500 hover:text-black hover:border-amber-500
                       border-2 shadow-sm"
          >
            <span className="text-2xl font-black uppercase tracking-widest">
              📖 {storiesTitle}
            </span>
            <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">
              {storiesSub}
            </span>
          </Link>

          {/* MEVCUT KATEGORİLER */}
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${lang}/${subject}/${level}/${cat}`}
              className="p-8 rounded-[32px] transition-all flex justify-between items-center group
                       bg-slate-50 border-slate-200 text-slate-900
                       dark:bg-slate-900 dark:border-slate-800 dark:text-white
                       hover:bg-amber-500 hover:text-black hover:border-amber-500
                       border-2 shadow-sm"
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {categoriesDict?.[cat] || cat.toUpperCase()}
              </span>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">{cat} →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href={`/${lang}/${subject}`} className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white font-bold italic transition-colors">
            ← {dict.navigation?.back || (lang === "es" ? "Volver" : "Back")}
          </Link>
        </div>
      </div>
    </main>
  );
}