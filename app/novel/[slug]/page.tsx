import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ContinueReadingButton from '@/components/ContinueReadingButton'
import BookmarkButton from '@/components/BookmarkButton'
import AdBanner728 from '@/components/AdBanner728'
import NovelComments from '@/components/NovelComments'
import ChapterList from '@/components/ChapterList'

export const revalidate = 60
interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: novel } = await supabase
    .from('novels')
    .select('title, summary, cover_url, author, genre')
    .eq('slug', slug)
    .single()

  if (!novel) {
    return { title: 'Novel Not Found' }
  }

  const siteName = 'Web Novel Reader'
  const description = novel.summary 
    ? novel.summary.slice(0, 160) + '...' 
    : `Read ${novel.title} light novel online for free. Author: ${novel.author || 'Unknown'}.`

  return {
    title: `${novel.title} - Read Online Free | ${siteName}`,
    description: description,
    openGraph: {
      title: `${novel.title} - Read Online Free`,
      description: description,
      url: `https://www.webnovelreader.com/novel/${slug}`,
      siteName: siteName,
      images: novel.cover_url ? [{ url: novel.cover_url }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${novel.title} - Read Online Free`,
      description: description,
      images: novel.cover_url ? [novel.cover_url] : [],
    },
  }
}

export default async function NovelDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('*')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const novelId = novel.id

  // Fetch all chapters for the novel to handle client-side page switching seamlessly
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title')
    .eq('novel_id', novelId)
    .order('chapter_number', { ascending: true })

  const genreList = novel.genre
    ? novel.genre.split(',').map((g: string) => g.trim())
    : []

  const firstChapterNum = chapters && chapters.length > 0 ? chapters[0].chapter_number : 1

  return (
    <main className="max-w-5xl mx-auto p-6">
            {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-400 mb-4">
        <Link href="/" className="flex items-center gap-0.5 hover:text-blue-400 transition">
          <svg
            className="w-4.5 h-4.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Home</span>
        </Link>
        <span>›</span>
        <Link
            href={`/novel/${slug}`}
            className="text-gray-400 hover:underline text-sm font-bold truncate max-w-full md:max-w-[250px]"
            title={novel.title}
          >
             {novel.title}
        </Link>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 shadow-xl flex flex-col md:flex-row gap-8">
        {novel.cover_url && (
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden border border-gray-700 shadow-md">
            <img src={novel.cover_url} alt={novel.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{novel.title}</h1>
          <p className="text-gray-400 font-medium mb-4">
            Author: <span className="text-gray-100">{novel.author || 'Unknown'}</span>
          </p>

          {genreList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {genreList.map((g: string, idx: number) => (
                <Link
                  key={idx}
                  href={`/genre/${encodeURIComponent(g)}`}
                  className="px-3 py-1 bg-gray-900 hover:bg-blue-900 text-gray-100 border border-blue-800/50 hover:border-blue-500 text-xs font-semibold rounded-full"
                >
                  🏷️ {g}
                </Link>
              ))}
            </div>
          )}

          {novel.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-100 mb-2">Summary</h3>
              <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-line bg-gray-900 p-4 rounded-lg border border-gray-800">
                {novel.summary}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <ContinueReadingButton novelId={novelId} firstChapterNum={firstChapterNum} />
            <BookmarkButton novelId={novelId} />
          </div>
        </div>
      </div>

      <AdBanner728 />

      {/* Render the clean client-side paginated chapter list component */}
      <ChapterList chapters={chapters || []} novelSlug={slug} />

      <NovelComments novelId={novelId} />
    </main>
  )
}