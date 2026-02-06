import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import StoryPracticeClient from "../StoryPracticeClient";

type ValidLangs = "en" | "tr" | "de" | "uk";

/**
 * Slug normalizasyonu - URL ile dosya adı arasındaki eşleşmeyi sağlar.
 */
function normalizeStorySlug(slug: string) {
  return slug
    .toLowerCase()
    .replace(/\.json$/, "")
    .replace(/[^a-z0-9]/g, "");
}

function getTargetLearningLang(subject: string) {
  if (subject === "german") return "de";
  if (subject === "english") return "en";
  return subject;
}

/**
 * 🔑 HATAYI ÇÖZEN KRİTİK FONKSİYON: generateStaticParams
 * Statik export modunda tüm dinamik yolları Next.js'e bildirir.
 */
export async function generateStaticParams() {
  const uiLangs: ValidLangs[] = ["en", "tr", "de", "uk"];
  const base = path.join(process.cwd(), "src", "data", "stories");
  
  if (!fs.existsSync(base)) return [];

  const params: any[] = [];
  const learningLangDirs = fs.readdirSync(base).filter((d) => 
    fs.lstatSync(path.join(base, d)).isDirectory()
  );

  for (const lLang of learningLangDirs) {
    const subject = lLang === "de" ? "german" : lLang === "en" ? "english" : lLang;
    const subjectDir = path.join(base, lLang);
    const levels = fs.readdirSync(subjectDir).filter((lvl) => 
      fs.lstatSync(path.join(subjectDir, lvl)).isDirectory()
    );

    for (const lvl of levels) {
      const levelDir = path.join(subjectDir, lvl);
      const files = fs.readdirSync(levelDir).filter((f) => f.endsWith(".json"));
      
      for (const file of files) {
        const storySlug = normalizeStorySlug(file);
        for (const lang of uiLangs) {
          params.push({ 
            lang, 
            subject, 
            level: lvl, 
            story: storySlug 
          });
        }
      }
    }
  }
  return params;
}

export default async function PracticePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: string; subject: string; level: string; story: string }>, 
  searchParams: Promise<{ mode?: string }> 
}) {
  // Next.js 15: params ve searchParams await edilmelidir
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { lang, subject, level, story } = resolvedParams;
  // URL'den gelen ?mode=writing veya flashcard bilgisini alır
  const mode = (resolvedSearchParams.mode as "writing" | "flashcard") || "flashcard";
  
  const dict = await getDictionary(lang as ValidLangs);
  const targetLL = getTargetLearningLang(subject);
  const dir = path.join(process.cwd(), "src", "data", "stories", targetLL, level);
  
  if (!fs.existsSync(dir)) return notFound();
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  const matchedFile = files.find(f => normalizeStorySlug(f) === story);
  
  if (!matchedFile) return notFound();

  // Hikaye verisini oku
  const rawData = fs.readFileSync(path.join(dir, matchedFile), "utf8");
  const storyData = JSON.parse(rawData);

  // Kelime listesini 'vocab', 'vocabulary' veya 'words' anahtarları altında arar
  const vocab = storyData.vocab || storyData.vocabulary || storyData.words || [];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <StoryPracticeClient 
          vocab={vocab} 
          uiLang={lang} 
          subject={subject} 
          dict={dict} 
          mode={mode}
        />
      </div>
    </main>
  );
}