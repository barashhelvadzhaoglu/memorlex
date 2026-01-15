import fs from 'fs';
import path from 'path';

export async function getVocab(lang: string, subject: string, level: string, category: string, unit: string) {
  // 1. Öğrenilen dile göre ana klasörü belirle (Örn: german -> de)
  const targetSub = subject === 'german' ? 'de' : subject;
  
  // 2. Dosya yolu (Artık tüm çeviriler tek bir merkezde: /de/ klasöründe)
  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    'vocabulary',
    targetSub, // Öğrenilen dil klasörü (de)
    level,
    category,
    `${unit}.json`
  );

  if (!fs.existsSync(filePath)) {
    console.error("❌ Vocab dosyası bulunamadı:", filePath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // 3. Veriyi bileşene gönderirken URL'den gelen 'lang' bilgisini de içine ekleyelim
    // Böylece bileşen hangi 'meaning_...' alanını okuyacağını bilir.
    return {
      ...data,
      uiLang: lang // URL'den gelen dil (tr, en, uk)
    };
  } catch (error) {
    console.error("❌ JSON ayrıştırma hatası:", error);
    return null;
  }
}