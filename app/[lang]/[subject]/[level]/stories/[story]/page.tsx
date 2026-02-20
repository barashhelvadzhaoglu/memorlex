import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import StoryQuestions from "./StoryQuestions";

// ✅ "es" eklendi
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// --- YARDIMCI FONKSİYONLAR ---
function normalizeStorySlug(slug: string) {
  return slug.toLowerCase().replace(/\.json$/, "").replace(/[-_]/g, "");
}

function getTargetLearningLang(subject: string) {
  if (subject === "german") return "de";
  if (subject === "english") return "en";
  return subject;
}

function getStoriesDir(subject: string, level: string) {
  const targetLang = getTargetLearningLang(subject);
  return path.join(process.cwd(), "src", "data", "stories", targetLang, level);
}

// --- 🔑 STATIC EXPORT İÇİN ŞART ---
export async function generateStaticParams() {
  // ✅ "es" eklendi
  const uiLangs: ValidLangs[] = ["en", "tr", "de", "uk", "es"];
  const base = path.join(process.cwd(), "src", "data", "stories");
  if (!fs.existsSync(base)) return [];

  const params: any[] = [];
  const learningLangDirs = fs.readdirSync(base).filter((d) => 
    fs.lstatSync(path.join(base, d)).isDirectory()
  );

  for (const ll of learningLangDirs) {
    const subject = ll === "de" ? "german" : ll === "en" ? "english" : ll;
    const subjectDir = path.join(base, ll);
    const levels = fs.readdirSync(subjectDir).filter((lvl) => 
      fs.lstatSync(path.join(subjectDir, lvl)).isDirectory()
    );

    for (const lvl of levels) {
      const levelDir = path.join(subjectDir, lvl);
      const files = fs.readdirSync(levelDir).filter((f) => f.endsWith(".json"));
      
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

// --- PAGE COMPONENT ---
export default async function StoryDetailPage({ 
  params 
}: { 
  params: Promise<{ lang: string; subject: string; level: string; story: string }> 
}) {
  const resolvedParams = await params;
  const { lang, subject, level, story } = resolvedParams; 
  
  const dict = await getDictionary(lang as ValidLangs);
  const dir = getStoriesDir(subject, level);
  
  if (!fs.existsSync(dir)) return notFound();
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort();
  const matchedIndex = files.findIndex(f => normalizeStorySlug(f) === story);

  if (matchedIndex === -1) return notFound();
  
  const matchedFileName = files[matchedIndex];
  const data = JSON.parse(fs.readFileSync(path.join(dir, matchedFileName), "utf8"));
  
  const currentNum = matchedIndex + 1;
  const nextFile = files[matchedIndex + 1];
  const nextStorySlug = nextFile ? normalizeStorySlug(nextFile) : null;
  const nextNum = matchedIndex + 2;

  // Çeviri yardımcıları
  const chapterLabel = lang === 'tr' ? 'BÖLÜM' : lang === 'es' ? 'CAPÍTULO' : 'CHAPTER';
  const studyVocabLabel = lang === 'tr' 
    ? 'Bu hikayede yer alan önemli kelimeleri çalış' 
    : lang === 'es' 
    ? 'Estudia las palabras importantes de esta historia' 
    : 'Study important words from this story';
  
  const flashcardBtn = lang === 'tr' ? 'FLASHCARD İLE ÇALIŞ' : lang === 'es' ? 'ESTUDIAR CON TARJETAS' : 'STUDY WITH FLASHCARDS';
  const writingBtn = lang === 'tr' ? 'YAZARAK ÇALIŞ' : lang === 'es' ? 'ESTUDIAR ESCRIBIENDO' : 'STUDY BY WRITING';
  const nextLabel = lang === 'tr' ? 'Sıradaki Hikaye' : lang === 'es' ? 'Siguiente Historia' : 'Next Story';
  const finishedLabel = lang === 'tr' ? 'Tüm hikaye serisini tamamladın!' : lang === 'es' ? '¡Has completado toda la serie!' : 'You completed the entire series!';

  return (
    <main className="min-h-screen p-6 md:p-10 bg-white dark:bg-slate-950 dark:text-white">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {level.toUpperCase()} Stories
          </div>
          <div className="bg-amber-500/10 text-amber-500 text-[10px] px-4 py-1.5 rounded-full font-black italic uppercase border border-amber-500/20">
            {chapterLabel} {currentNum}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-amber-500 italic uppercase mb-10 leading-tight tracking-tighter">
          {data.title}
        </h1>

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

        <div className="space-y-6 text-xl leading-relaxed font-medium text-slate-700 dark:text-slate-200 mb-16">
          {Array.isArray(data.text) ? (
            data.text.map((p: string, i: number) => <p key={i}>{p}</p>)
          ) : (
            <p>{data.text}</p>
          )}
        </div>

        {data.questions && (
          <div className="mb-20">
            <StoryQuestions questions={data.questions} lang={lang} />
          </div>
        )}

        <div className="pt-12 border-t-8 border-slate-50 dark:border-slate-900">
          
          <div className="text-center mb-12">
            <h2 className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 italic leading-relaxed">
              {studyVocabLabel}
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <Link 
                href={`/${lang}/${subject}/${level}/stories/${story}/practice/flashcard`} 
                className="flex-1 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[30px] font-black italic uppercase transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <span className="text-xl">🎴</span> {flashcardBtn}
              </Link>
              
              <Link 
                href={`/${lang}/${subject}/${level}/stories/${story}/practice/writing`} 
                className="flex-1 py-6 bg-amber-500 hover:bg-amber-600 text-white rounded-[30px] font-black italic uppercase transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <span className="text-xl">✍️</span> {writingBtn}
              </Link>
            </div>
          </div>

          {nextStorySlug ? (
            <div className="mt-16 group">
              <Link 
                href={`/${lang}/${subject}/${level}/stories/${nextStorySlug}`}
                className="block w-full p-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[40px] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 relative overflow-hidden"
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">{nextLabel}</span>
                    <span className="text-2xl md:text-4xl font-black italic uppercase leading-none tracking-tighter">{chapterLabel} {nextNum} &rarr;</span>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-9xl font-black italic opacity-[0.05] pointer-events-none uppercase select-none">
                   NEXT
                </div>
              </Link>
            </div>
          ) : (
            <div className="mt-12 p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] text-center border-4 border-dashed border-slate-200 dark:border-slate-800">
               <span className="text-sm font-black text-slate-300 italic uppercase tracking-[0.3em]">{finishedLabel}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}