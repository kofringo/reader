import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const PAGE_SIZE = 40_000

export async function generateSitemaps() {
  const { count, error } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })

  if (error) console.error('Supabase Count Error:', error.message)

  const totalChapters = count || 0
  const totalSitemaps = Math.ceil(totalChapters / PAGE_SIZE)

  return Array.from({ length: Math.max(1, totalSitemaps) }, (_, id) => ({ id }))
}

export default async function sitemap(props: {
  id: Promise<string | number> | string | number
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = Number(await Promise.resolve(props.id))
  const baseUrl = 'https://www.webnovelreader.com'

  if (resolvedId === 0) {
    const staticRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/completed`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ]

    const { data: novels, error: novelError } = await supabase.from('novels').select('slug, created_at')
    if (novelError) console.error('Supabase Novels Error:', novelError.message)

    const novelRoutes: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
      url: `${baseUrl}/novel/${novel.slug}`,
      lastModified: novel.created_at ? new Date(novel.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...novelRoutes]
  }

  const start = (resolvedId - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const { data: chapters, error: chapterError } = await supabase
    .from('chapters')
    .select(`
      chapter_number,
      created_at,
      novels (
        slug
      )
    `)
    .range(start, end)

  if (chapterError) console.error('Supabase Chapters Error:', chapterError.message)

  return (chapters || []).map((chapter: any) => {
    const novelSlug = chapter.novels?.slug || 'unknown'
    
    return {
      url: `${baseUrl}/novel/${novelSlug}/${chapter.chapter_number}`,
      lastModified: chapter.created_at ? new Date(chapter.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  })
}