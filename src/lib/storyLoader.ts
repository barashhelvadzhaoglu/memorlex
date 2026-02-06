import fs from "fs";
import path from "path";

export type StoryWord = {
  term: string;
  type?: string;
  meaning?: string;        // fallback
  meaning_tr?: string;
  meaning_en?: string;
  meaning_uk?: string;
  example: string;
  [key: string]: any;
};

export type StoryData = {
  id?: string;
  title: string;
  summary?: string;
  text: string[] | string;
  vocab?: StoryWord[];
  tags?: string[];
  youtubeId?: string;
  uiLang?: string;
};

function readJson(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

export function listStories(subject: string, level: string) {
  const targetSub = subject === "german" ? "de" : subject;
  const dirPath = path.join(process.cwd(), "src", "data", "stories", targetSub, level);

  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export async function getStory(lang: string, subject: string, level: string, story: string) {
  const targetSub = subject === "german" ? "de" : subject;
  const filePath = path.join(process.cwd(), "src", "data", "stories", targetSub, level, `${story}.json`);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Story dosyası bulunamadı:", filePath);
    return null;
  }

  try {
    const data: StoryData = readJson(filePath);
    if (!data.id) data.id = story;
    if (typeof data.text === "string") data.text = [data.text];

    return { ...data, uiLang: lang };
  } catch (error) {
    console.error("❌ Story JSON ayrıştırma hatası:", error);
    return null;
  }
}

/**
 * Story vocab kelimelerini UI diline göre normalize eder.
 */
export function normalizeStoryVocab(vocab: StoryWord[] | undefined, uiLang: string) {
  if (!vocab) return [];
  
  return vocab.map((item) => ({
    ...item,
    // UI diline göre uygun anlamı 'meaning' alanına ata
    meaning: item[`meaning_${uiLang}`] || item.meaning || item.meaning_en || ""
  }));
}