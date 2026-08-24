import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'
  
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/new`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/completed`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  // Explicitly reference the env variables so Next.js bundles them into the build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in sitemap')
    return staticPages
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: novels, error } = await supabase
    .from('novels')
    .select('slug, updated_at')
    .range(0, 999)

  if (error) {
    console.error('Sitemap DB Error:', error)
    return staticPages
  }

  const novelPages: MetadataRoute.Sitemap = (novels || []).map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticPages, ...novelPages]
}