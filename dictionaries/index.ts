const dictionaries = {
  tr: () => import('./tr.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
  de: () => import('./de.json').then((module) => module.default),
  uk: () => import('./uk.json').then((module) => module.default),
  es: () => import('./es.json').then((module) => module.default), // ✅ İspanyolca eklendi
};

// Tip tanımına 'es' eklendi
export const getDictionary = async (lang: 'tr' | 'en' | 'de' | 'uk' | 'es') => {
  if (!dictionaries[lang]) {
    // Dil bulunamazsa varsayılan olarak Türkçe döner.
    return dictionaries['tr'](); 
  }
  // Seçilen dili yükle ve döndür
  return dictionaries[lang]();
};