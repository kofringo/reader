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

interface PageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const genreName = decodeURIComponent(resolvedParams.name || '')
  
  const currentPage = Number(resolvedSearchParams.page) || 1
  const pageSize = 22 // 11 rows * 2 columns = 22 items per page[cite: 7]
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize - 1

  const supabase = await createClient()

  // Fetch total count for pagination[cite: 7]
  const { count: totalCount } = await supabase
    .from('novels')
    .select('*', { count: 'exact', head: true })
    .ilike('genre', `%${genreName}%`)

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1

  // Fetch paginated novels matching the genre tag[cite: 7]
  const { data: novels, error } = await supabase
    .from('novels')
    .select(`
      *,
      chapters (count)
    `)
    .ilike('genre', `%${genreName}%`)
    .order('views', { ascending: false })
    .range(startIndex, endIndex)

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

    // >> jump forward 5 pages
    pages.push('>>')

    // Always include last page
    pages.push(totalPages)

    return pages
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-extrabold text-white capitalize">
              Genre: {genreName}
            </h1>
            <p className="text-sm text-gray-400">
              Browsing all novels tagged under <span className="text-white">&ldquo;{genreName}&rdquo;</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-500 font-mono bg-gray-900 border border-gray-800 rounded-lg mb-6">
            ✕ Error fetching genre: {error.message}
          </div>
        )}

        {novels && novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl mb-3 shadow-inner">
              🏷️
            </div>
            <h2 className="text-base font-bold text-white mb-1">No novels found</h2>
            <p className="text-sm text-gray-300 max-w-sm">
              There are currently no novels listed under the <span className="font-semibold text-white">&ldquo;{genreName}&rdquo;</span> genre.
            </p>
          </div>
        ) : (
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

                  <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition mb-1.5">
                        {novel.title}
                      </h2>
                      <div className="space-y-1 text-sm text-gray-300 mb-2">
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
                    </div>

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
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1.5 mt-8 mb-4">
          {getPageNumbers().map((item, index) => {
            if (item === '<<') {
              const targetPage = Math.max(1, currentPage - 5)
              return (
                <Link
                  key={`jump-prev-${index}`}
                  href={`/genre/${encodeURIComponent(genreName)}?page=${targetPage}`}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-white text-gray-100 border border-gray-300 hover:bg-gray-100 transition shadow-sm"
                >
                  &lt;&lt;
                </Link>
              )
            }

            if (item === '>>') {
              const targetPage = Math.min(totalPages, currentPage + 5)
              return (
                <Link
                  key={`jump-next-${index}`}
                  href={`/genre/${encodeURIComponent(genreName)}?page=${targetPage}`}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-white text-gray-100 border border-gray-300 hover:bg-gray-100 transition shadow-sm"
                >
                  &gt;&gt;
                </Link>
              )
            }

            const pageNum = Number(item)
            const isCurrent = pageNum === currentPage

            return (
              <Link
                key={pageNum}
                href={`/genre/${encodeURIComponent(genreName)}?page=${pageNum}`}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition border shadow-sm ${
                  isCurrent
                    ? 'bg-gray-300 text-gray-100 border-gray-400 font-extrabold'
                    : 'bg-white text-gray-100 border-gray-300 hover:bg-gray-100'
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