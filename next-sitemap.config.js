/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://memorlex.com',
  generateRobotsTxt: true, // robots.txt dosyasını otomatik oluşturur
  sitemapSize: 7000,
  // A1-C1 seviyeleri gibi dinamik rotaların taranmasını sağlar
  exclude: ['/server-sitemap.xml'], 
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://memorlex.com/server-sitemap.xml', // Eğer ileride dinamik sitemap kullanırsan buraya eklenir
    ],
  },
}