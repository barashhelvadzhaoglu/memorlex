import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://memorlex.com'
  const languages = ['tr', 'en', 'de', 'uk']
  const lastModified = new Date()

  // Ana sayfalar için sitemap girişleri oluştur
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
    // Gelecekte buraya subject/unit verilerini bir API veya veritabanından çekip push edebilirsin
  ]
}