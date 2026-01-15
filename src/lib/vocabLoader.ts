import fs from 'fs';
import path from 'path';

export async function getVocab(lang: string, subject: string, level: string, category: string, unit: string) {
  // german gelirse de klasörüne bak
  const targetSub = subject === 'german' ? 'de' : subject;
  
  // Örn: src/data/vocabulary/de/a1/integration/kapital12.json
  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    'vocabulary',
    targetSub,
    level,
    category,
    `${unit}.json`
  );

  if (!fs.existsSync(filePath)) {
    console.error("Dosya bulunamadı:", filePath);
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}