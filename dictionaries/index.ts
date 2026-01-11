const dictionaries = {
  tr: () => import('./tr.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
  de: () => import('./de.json').then((module) => module.default),
  uk: () => import('./uk.json').then((module) => module.default),
};

export const getDictionary = async (lang: 'tr' | 'en' | 'de' | 'uk') => {
  // dictionaries[lang] bir fonksiyon döner, onu () ile çağırıyoruz.
  if (!dictionaries[lang]) {
    return dictionaries['tr'](); // Dil bulunamazsa varsayılan olarak Türkçe döner.
  }
  return dictionaries[lang]();
};