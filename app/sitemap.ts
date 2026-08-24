import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch using the correct column name: created_at
  const { data: novels, error } = await supabase
    .from('novels')
    .select('slug, created_at')
    .range(0, 999)

  if (error) {
    console.error('Sitemap Error:', error.message)
    return [{ url: baseUrl }]
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/new`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/completed`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const novelPages: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.created_at ? new Date(novel.created_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticPages, ...novelPages]
}