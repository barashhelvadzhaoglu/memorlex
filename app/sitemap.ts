import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://memorlex.com';
  const languages = ['en', 'tr', 'de', 'uk'];
  const baseDir = path.join(process.cwd(), 'src/data/vocabulary');
  
  const routes: MetadataRoute.Sitemap = [];

  // 1. Ana Dil Sayfalarını Ekle (/tr, /en, vb.)
  languages.forEach((lang) => {
    routes.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // 2. Dosya Sistemini Tara ve Tüm Ünite Linklerini Üret
  if (fs.existsSync(baseDir)) {
    const learningLanguages = ['de']; // page.tsx'teki mantığın aynısı

    learningLanguages.forEach((subDir) => {
      const subjectPath = path.join(baseDir, subDir);
      if (!fs.existsSync(subjectPath) || !fs.lstatSync(subjectPath).isDirectory()) return;

      const subjectParam = subDir === 'de' ? 'german' : subDir;
      const levels = fs.readdirSync(subjectPath);

      levels.forEach((lvl) => {
        const levelPath = path.join(subjectPath, lvl);
        if (!fs.lstatSync(levelPath).isDirectory()) return;

        const categories = fs.readdirSync(levelPath);
        for (const cat of categories) {
          const catPath = path.join(levelPath, cat);
          if (!fs.lstatSync(catPath).isDirectory()) return;

          const units = fs.readdirSync(catPath)
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));

          for (const unit of units) {
            for (const lang of languages) {
              routes.push({
                url: `${baseUrl}/${lang}/${subjectParam}/${lvl}/${cat}/${unit}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            }
          }
        }
      });
    });
  }

  return routes;
}