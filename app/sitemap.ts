import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'

  // 1. Core static and category pages
  const corePages = [
    '',
    '/',
    '/rankings',
    '/popular',
    '/completed',
    '/new',
    '/genre/Ecchi',
    '/genre/Smut',
    '/genre/Harem',
    '/genre/Sci-fi',
    '/genre/Action',
    '/genre/Adventure',
    '/genre/Comedy',
    '/genre/Drama',
    '/genre/Fantasy',
    '/genre/Romance',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 2. Dynamically fetch all novels from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: novels } = await supabase
    .from('novels')
    .select('slug, created_at')

  const novelPages = (novels || []).map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Combine core pages and dynamic novel pages into a single flat sitemap
  return [...corePages, ...novelPages]
}