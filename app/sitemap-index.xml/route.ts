import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const PAGE_SIZE = 40_000

  // Fetch the same count to know how many split files exist
  const { count } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })

  const totalChapters = count || 0
  const totalSitemaps = Math.ceil(totalChapters / PAGE_SIZE)
  const sitemapCount = Math.max(1, totalSitemaps)

  const baseUrl = 'https://www.webnovelreader.com'

  const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Array.from({ length: sitemapCount })
    .map(
      (_, id) => `
  <sitemap>
    <loc>${baseUrl}/sitemap/${id}.xml</loc>
  </sitemap>`
    )
    .join('')}
</sitemapindex>`

  return new Response(sitemapIndexXML, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}