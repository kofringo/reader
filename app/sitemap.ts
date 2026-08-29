import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const PAGE_SIZE = 40_000 // Safely under Google's 50k limit per file

export async function generateSitemaps() {
  const { count } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })

  const totalChapters = count || 0
  const totalSitemaps = Math.ceil(totalChapters / PAGE_SIZE)

  return Array.from({ length: Math.max(1, totalSitemaps) }, (_, id) => ({ id }))
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await props.id
  const id = Number(resolvedId)
  const baseUrl = 'https://www.webnovelreader.com'

  // ID 0 handles static pages and all parent novel pages
  if (id === 0) {
    const staticRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/completed`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ]

    const { data: novels } = await supabase.from('novels').select('slug, updated_at')
    const novelRoutes: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
      url: `${baseUrl}/novel/${novel.slug}`,
      lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...novelRoutes]
  }

  // IDs 1+ paginate through your 466k+ chapters using chunks
  const start = (id - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const { data: chapters } = await supabase
    .from('chapters')
    .select(`
      chapter_number,
      updated_at,
      novels (
        slug
      )
    `)
    .range(start, end)

  return (chapters || []).map((chapter: any) => {
    // Handle Supabase foreign key join structure
    const novelSlug = chapter.novels?.slug || 'unknown'
    
    return {
      url: `${baseUrl}/novel/${novelSlug}/${chapter.chapter_number}`,
      lastModified: chapter.updated_at ? new Date(chapter.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  })
}