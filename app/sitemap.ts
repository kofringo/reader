import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'
  const supabase = await createClient()

  // 1. Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/popular`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/completed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // 2. Fetch all novels for sitemap entries
  const { data: novels } = await supabase
    .from('novels')
    .select('slug, updated_at')

  const novelPages: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // 3. (Optional) Fetch recent or key chapters if you want them indexed directly
  // Note: If you have tens of thousands of chapters, it's best to split sitemaps, 
  // but for starting out, you can include recent chapters or let Google find them via novel pages.

  return [...staticPages, ...novelPages]
}