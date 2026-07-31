import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function timeAgo(dateString: string) {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  
  return 'Just now'
}

export default async function PopularNovelsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const page = Number(resolvedSearchParams?.page) || 1
  
  const pageSize = 22 
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { count } = await supabase
    .from('novels')
    .select('*', { count: 'exact', head: true })

  const { data: novels, error } = await supabase
    .from('novels')
    .select(`
      *,
      chapters (count)
    `)
    .order('views', { ascending: false })
    .range(from, to)

  if (error) {
    return (
      <div className="p-8 text-red-500 font-mono max-w-7xl mx-auto">
        ✕ Error loading popular novels: {error.message}
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  // Helper logic to build the page window matching the reference style [1, <<, middle window, >>, totalPages]
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    // Always include 1
    pages.push(1)

    // << jump backward 5 pages
    pages.push('<<')

    // Sliding window of numbers around current page
    let start = Math.max(2, page - 2)
    let end = Math.min(totalPages - 1, page + 2)

    if (page <= 4) {
      end = Math.min(totalPages - 1, 6)
    } else if (page >= totalPages - 3) {
      start = Math.max(2, totalPages - 5)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // >> jump forward 5 pages
    pages.push('>>')

    // Always include last page
    pages.push(totalPages)

    return pages
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Most Popular Novels</h1>
        </div>
      </div>

      {/* Horizontal List Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {novels?.map((novel) => {
          const chapterCount = Array.isArray(novel.chapters) 
            ? novel.chapters[0]?.count || 0 
            : novel.chapters || 0

          return (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
              className="flex bg-gray-900 border border-gray-800 rounded-lg p-4 gap-4 hover:border-gray-700 transition group"
            >
              {/* Cover Image */}
              <div className="w-24 h-32 flex-shrink-0 bg-gray-800 rounded overflow-hidden shadow">
                {novel.cover_url ? (
                  <img
                    src={novel.cover_url}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No Cover
                  </div>
                )}
              </div>

              {/* Novel Info Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition mb-1.5">
                  {novel.title}
                </h2>

                {/* Metadata Details */}
                <div className="space-y-1 text-sm text-white mb-2">
                  <div className="flex items-center gap-2">
                    <span>📖</span>
                    <span>{chapterCount} Chapters</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <span>📚</span>
                    <span className="truncate">{novel.genre || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Update {timeAgo(novel.updated_at || novel.created_at)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span className="inline-block px-2 py-0.5 bg-red-600 text-gray-50 text-[11px] font-bold uppercase rounded">
                    {novel.status || 'Ongoing'}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-16">
          {getPageNumbers().map((item, index) => {
            if (item === '<<') {
              const targetPage = Math.max(1, page - 5)
              return (
                <Link
                  key={`jump-prev-${index}`}
                  href={`/popular?page=${targetPage}`}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
                >
                  &lt;&lt;
                </Link>
              )
            }

            if (item === '>>') {
              const targetPage = Math.min(totalPages, page + 5)
              return (
                <Link
                  key={`jump-next-${index}`}
                  href={`/popular?page=${targetPage}`}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
                >
                  &gt;&gt;
                </Link>
              )
            }

            const pageNum = Number(item)
            const isCurrent = pageNum === page

            return (
              <Link
                key={pageNum}
                href={`/popular?page=${pageNum}`}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition border shadow-sm ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
                    : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {pageNum}
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}