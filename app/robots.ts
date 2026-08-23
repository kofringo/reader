import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.webnovelreader.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow private or dynamic API routes if you have any
      disallow: ['/api/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}