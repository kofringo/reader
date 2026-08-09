import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ContinueReadingButton from '@/components/ContinueReadingButton'
import BookmarkButton from '@/components/BookmarkButton'
import AdBanner468 from '@/components/AdBanner468'
import MonetagPush from "@/components/MonetagPush";
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

// Generate metadata using the slug parameter
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: novel } = await supabase
    .from('novels')
    .select('title')
    .eq('slug', slug)
    .single()

  return {
    title: novel?.title || 'Novel Details',
  }
}

export default async function NovelDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1

  const CHAPTERS_PER_PAGE = 50
  const offset = (currentPage - 1) * CHAPTERS_PER_PAGE

  const supabase = await createClient()

  // 1. Fetch novel details by slug instead of ID
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('*')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  // Use novel.id for fetching chapters since chapters table references novel uuid
  const novelId = novel.id

  // 2. Fetch paginated chapters for this novel using novel.id
  const { data: chapters, count } = await supabase
    .from('chapters')
    .select('id, chapter_number, title', { count: 'exact' })
    .eq('novel_id', novelId)
    .order('chapter_number', { ascending: true })
    .range(offset, offset + CHAPTERS_PER_PAGE - 1)

  const totalPages = count ? Math.ceil(count / CHAPTERS_PER_PAGE) : 1

  const genreList = novel.genre
    ? novel.genre.split(',').map((g: string) => g.trim())
    : []

  const { data: allChapters } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('novel_id', novelId)
    .order('chapter_number', { ascending: true })

  const firstChapterNum = allChapters && allChapters.length > 0 ? allChapters[0].chapter_number : 1

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    pages.push('<<')

    let start = Math.max(2, currentPage - 2)
    let end = Math.min(totalPages - 1, currentPage + 2)

    if (currentPage <= 4) {
      end = Math.min(totalPages - 1, 6)
    } else if (currentPage >= totalPages - 3) {
      start = Math.max(2, totalPages - 5)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    pages.push('>>')
    pages.push(totalPages)

    return pages
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
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
                  className="px-3 py-1 bg-blue-950/80 hover:bg-blue-900 text-gray-100 border border-blue-800/50 hover:border-blue-500 text-xs font-semibold rounded-full"
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

      {/* 728x90 Ad Banner placed directly above the chapter list section */}
      <AdBanner468 />
      <MonetagPush/>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
          <span>📑</span> CHAPTER LIST ({count || 0})
        </h2>

        {chapters && chapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {chapters.map((chap) => (
              <Link
                key={chap.id}
                href={`/novel/${slug}/${chap.chapter_number}`}
                className="py-2.5 px-3 bg-transparent hover:bg-gray-800/50 border-b border-dashed border-gray-800 text-xs md:text-sm text-gray-100 font-normal flex items-center justify-between group transition"
              >
                <span className="truncate pr-2">
                  <span className="text-gray-100 mr-2">■</span>
                  {chap.title}
                </span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition text-xs shrink-0">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-100 italic text-sm">No chapters available yet.</p>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1.5 mt-8 pt-6 border-t border-gray-800">
            {getPageNumbers().map((item, index) => {
              if (item === '<<') {
                const targetPage = Math.max(1, currentPage - 5)
                return (
                  <Link key={`jump-prev-${index}`} href={`/novel/${slug}?page=${targetPage}`} className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm">
                    &lt;&lt;
                  </Link>
                )
              }

              if (item === '>>') {
                const targetPage = Math.min(totalPages, currentPage + 5)
                return (
                  <Link key={`jump-next-${index}`} href={`/novel/${slug}?page=${targetPage}`} className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm">
                    &gt;&gt;
                  </Link>
                )
              }

              const pageNum = Number(item)
              const isCurrent = pageNum === currentPage

              return (
                <Link
                  key={pageNum}
                  href={`/novel/${slug}?page=${pageNum}`}
                  className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition border shadow-sm ${
                    isCurrent 
                    ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
                    :  'bg-gray-900 text-gray-100 border-gray-800 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}