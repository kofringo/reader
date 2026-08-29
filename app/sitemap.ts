import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'

  // 1. Static pages on your site
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/completed`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // 2. Fetch dynamic novel pages from Supabase
  // (Adjust 'novels', 'slug', and 'updated_at' to match your actual database column names)
  const { data: novels } = await supabase
    .from('novels')
    .select('slug, updated_at')

  const novelRoutes: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3. Fetch chapter pages from Supabase 
  // (Adjust fields based on how your chapter URLs are structured)
  const { data: chapters } = await supabase
    .from('chapters')
    .select('slug, updated_at, novel_slug') // or however you link chapters to novels

  const chapterRoutes: MetadataRoute.Sitemap = (chapters || []).map((chapter) => ({
    url: `${baseUrl}/novel/${chapter.novel_slug}/${chapter.slug}`,
    lastModified: chapter.updated_at ? new Date(chapter.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  // Combine everything into a single sitemap array
  return [...staticRoutes, ...novelRoutes, ...chapterRoutes]
}