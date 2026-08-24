import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

// This forces Next.js to bypass the cache and fetch fresh data every time we test
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.webnovelreader.com'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // DEBUG 1: Checks if Vercel is failing to load the environment variables
  if (!supabaseUrl || !supabaseKey) {
    return [{ url: `${baseUrl}/DEBUG-ERROR-MISSING-ENV-VARS` }]
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: novels, error } = await supabase
    .from('novels')
    .select('slug, updated_at')
    .range(0, 999)

  // DEBUG 2: Checks if Supabase is rejecting the query
  if (error) {
    return [{ url: `${baseUrl}/DEBUG-ERROR-DB-REJECTED-QUERY` }]
  }

  // DEBUG 3: Checks if Supabase is silently returning 0 novels (usually an RLS policy issue)
  if (!novels || novels.length === 0) {
    return [{ url: `${baseUrl}/DEBUG-ERROR-ZERO-NOVELS-RETURNED` }]
  }

  // If NO errors occur, build the full sitemap!
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/new`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/completed`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const novelPages: MetadataRoute.Sitemap = novels.map((novel) => ({
    url: `${baseUrl}/novel/${novel.slug}`,
    lastModified: novel.updated_at ? new Date(novel.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticPages, ...novelPages]
}