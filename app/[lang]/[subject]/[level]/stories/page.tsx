import Link from "next/link";
import fs from "fs";
import path from "path";
import { getDictionary } from "@/dictionaries";
import { Metadata } from "next";

type ValidLangs = "en" | "tr" | "de" | "uk";

type StoryMeta = {
  id?: string;
  title: string;
  summary?: string;
  tags?: string[];
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
  const targetLang = subject === "german" ? "de" : subject === "english" ? "en" : subject;
  return path.join(process.cwd(), "src", "data", "stories", targetLang, level);
}

export async function generateMetadata({ params }: { params: Promise<any> }): Promise<Metadata> {
  const { lang, subject, level } = await params;
  const subName = subject === "german" ? (lang === "tr" ? "Almanca" : "German") : (lang === "tr" ? "İngilizce" : "English");
  return { title: `${subName} ${level.toUpperCase()} Hikâyeler | Memorlex` };
}

export async function generateStaticParams() {
  const uiLangs = ["en", "tr", "de", "uk"];
  const storiesBase = path.join(process.cwd(), "src", "data", "stories");
  if (!fs.existsSync(storiesBase)) return [];
  const params: any[] = [];
  const learningLangs = fs.readdirSync(storiesBase).filter((d) => fs.lstatSync(path.join(storiesBase, d)).isDirectory());

  for (const ll of learningLangs) {
    const subject = ll === "de" ? "german" : ll === "en" ? "english" : ll;
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

    // ✅ SIRALAMA: Slug içindeki rakama göre (Bölüm 1, 2, 3...) sayısal sıralama yapar
    stories.sort((a, b) => {
      const numA = parseInt(a.slug.replace(/[^0-9]/g, "")) || 0;
      const numB = parseInt(b.slug.replace(/[^0-9]/g, "")) || 0;
      return numA - numB;
    });
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-3 uppercase italic tracking-tighter text-amber-500">
          {dict?.stories?.title || "Hikâyeler"} - {level.toUpperCase()}
        </h1>
        <div className="grid gap-6 mt-10">
          {stories.map(({ slug, meta }) => (
            <Link key={slug} href={`/${lang}/${subject}/${level}/stories/${slug}`} className="p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-amber-500 transition-all group shadow-sm flex justify-between items-center">
              <div>
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Bölüm {parseInt(slug.replace(/[^0-9]/g, "")) || "?"}
                </span>
                <div className="text-2xl font-black mt-2 group-hover:text-amber-500">{meta.title}</div>
                <p className="mt-2 text-slate-500 italic text-sm">{meta.summary}</p>
              </div>
              <span className="text-xl font-bold italic opacity-40 group-hover:opacity-100">
                {lang === "tr" ? "Oku →" : "Read →"}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link href={`/${lang}/${subject}/${level}`} className="text-slate-500 font-bold italic hover:text-amber-500">
            ← {dict.navigation?.back || "Geri"}
          </Link>
        </div>
      </div>
    </main>
  );
}