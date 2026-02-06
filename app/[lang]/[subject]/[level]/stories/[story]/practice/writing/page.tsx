import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import StoryPracticeClient from "../../StoryPracticeClient";

type ValidLangs = "en" | "tr" | "de" | "uk";

function normalizeStorySlug(slug: string) {
  return slug.toLowerCase().replace(/\.json$/, "").replace(/[-_]/g, "");
}

function getTargetLearningLang(subject: string) {
  if (subject === "german") return "de";
  if (subject === "english") return "en";
  return subject;
}

function readStory(subject: string, level: string, storySlug: string) {
  const targetLang = getTargetLearningLang(subject);
  const dir = path.join(process.cwd(), "src", "data", "stories", targetLang, level);
  if (!fs.existsSync(dir)) return null;
  
  const normalizedSlug = normalizeStorySlug(storySlug);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const matchedFile = files.find((file) => normalizeStorySlug(file) === normalizedSlug);
  
  if (!matchedFile) return null;
  const raw = fs.readFileSync(path.join(dir, matchedFile), "utf8");
  return JSON.parse(raw);
}

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
    const levels = fs.readdirSync(path.join(base, lLang)).filter((lvl) => 
      fs.lstatSync(path.join(base, lLang, lvl)).isDirectory()
    );

    for (const lvl of levels) {
      const files = fs.readdirSync(path.join(base, lLang, lvl)).filter((f) => f.endsWith(".json"));
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

export default async function WritingPracticePage({
  params,
}: {
  params: Promise<{ lang: string; subject: string; level: string; story: string }>;
}) {
  const { lang, subject, level, story } = await params;
  const dict = await getDictionary(lang as ValidLangs);
  const data = readStory(subject, level, story);

  if (!data) return notFound();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
             <h1 className="text-3xl font-black text-amber-500 uppercase italic tracking-tighter">
                {data.title}
             </h1>
             <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-2">
                ✍️ YAZARAK ÇALIŞMA
             </p>
        </div>

        <StoryPracticeClient 
          vocab={data.vocab || data.vocabulary || []} 
          uiLang={lang} 
          subject={subject} 
          dict={dict} 
          mode="writing" // 🔑 Kritik: Burada "writing" olduğundan emin olun
        />
      </div>
    </main>
  );
}