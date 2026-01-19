import { MetadataRoute } from 'next'

// Cloudflare Pages statik export için bu satır şart:
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://memorlex.com'
  const languages = ['tr', 'en', 'de', 'uk']
  const lastModified = new Date()

  const languageEntries = languages.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...languageEntries,
  ]
}