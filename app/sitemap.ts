import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const BASE_URL = 'https://memorlex.com';
const UI_LANGS = ['en', 'tr', 'de', 'uk', 'es'];

function normalizeStorySlug(slug: string) {
  return slug.toLowerCase().replace(/\.json$/, '').replace(/[-_]/g, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // ── 1. Kök ve dil ana sayfaları ──────────────────────────────────────────
  routes.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  for (const lang of UI_LANGS) {
    routes.push({
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // About / Contact / Privacy
    for (const page of ['about', 'contact', 'privacy']) {
      routes.push({
        url: `${BASE_URL}/${lang}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      });
    }
  }

  // ── 2. Vocabulary sayfaları ───────────────────────────────────────────────
  const vocabBase = path.join(process.cwd(), 'src/data/vocabulary');

  const learningLangMap: Record<string, string> = {
    de: 'german',
    en: 'english',
    es: 'spanish',
  };

  if (fs.existsSync(vocabBase)) {
    for (const [subDir, subjectParam] of Object.entries(learningLangMap)) {
      const subjectPath = path.join(vocabBase, subDir);
      if (!fs.existsSync(subjectPath) || !fs.lstatSync(subjectPath).isDirectory()) continue;

      const levels = fs.readdirSync(subjectPath).filter(f =>
        fs.lstatSync(path.join(subjectPath, f)).isDirectory()
      );

      for (const lvl of levels) {
        const levelPath = path.join(subjectPath, lvl);

        // /[lang]/[subject]/[level]
        for (const lang of UI_LANGS) {
          routes.push({
            url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }

        const categories = fs.readdirSync(levelPath).filter(f =>
          fs.lstatSync(path.join(levelPath, f)).isDirectory()
        );

        for (const cat of categories) {
          const catPath = path.join(levelPath, cat);

          // /[lang]/[subject]/[level]/[category]
          for (const lang of UI_LANGS) {
            routes.push({
              url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/${cat}`,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.75,
            });
          }

          const units = fs.readdirSync(catPath)
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));

          for (const unit of units) {
            for (const lang of UI_LANGS) {
              routes.push({
                url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/${cat}/${unit}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            }
          }
        }
      }
    }
  }

  // ── 3. Stories sayfaları ─────────────────────────────────────────────────
  const storiesBase = path.join(process.cwd(), 'src/data/stories');

  const storyLangMap: Record<string, string> = {
    de: 'german',
    en: 'english',
    es: 'spanish',
  };

  if (fs.existsSync(storiesBase)) {
    const storyLangDirs = fs.readdirSync(storiesBase).filter(d =>
      fs.lstatSync(path.join(storiesBase, d)).isDirectory()
    );

    for (const ll of storyLangDirs) {
      const subjectParam = storyLangMap[ll] || ll;
      const subjectDir = path.join(storiesBase, ll);

      const levels = fs.readdirSync(subjectDir).filter(lvl =>
        fs.lstatSync(path.join(subjectDir, lvl)).isDirectory()
      );

      for (const lvl of levels) {
        const levelDir = path.join(subjectDir, lvl);

        // /[lang]/[subject]/[level]/stories
        for (const lang of UI_LANGS) {
          routes.push({
            url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/stories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }

        const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json'));

        for (const file of files) {
          const slug = normalizeStorySlug(file);

          for (const lang of UI_LANGS) {
            // /[lang]/[subject]/[level]/stories/[story]
            routes.push({
              url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/stories/${slug}`,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.65,
            });

            // /[lang]/[subject]/[level]/stories/[story]/practice/flashcard
            routes.push({
              url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/stories/${slug}/practice/flashcard`,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.5,
            });

            // /[lang]/[subject]/[level]/stories/[story]/practice/writing
            routes.push({
              url: `${BASE_URL}/${lang}/${subjectParam}/${lvl}/stories/${slug}/practice/writing`,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.5,
            });
          }
        }
      }
    }
  }

  return routes;
}