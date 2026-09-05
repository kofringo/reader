import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genres",
};
export default async function GenresPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const selectedGenre = resolvedSearchParams.genre || 'All'
  const currentPage = Number(resolvedSearchParams.page) || 1

  // 11 rows * 5 columns = 55 novels per page
  const ITEMS_PER_PAGE = 55
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch all novels to dynamically build the genre list tags
  const { data: allNovels } = await supabase
    .from('novels')
    .select('genre')

  const genreSet = new Set<string>()
  genreSet.add('All')

  allNovels?.forEach((novel) => {
    if (novel.genre) {
      novel.genre.split(',').forEach((g: string) => {
        const trimmed = g.trim()
        if (trimmed) genreSet.add(trimmed)
      })
    }
  })

  const genresList = Array.from(genreSet)

  // Build the database query with pagination & filtering (including slug)
  let query = supabase
    .from('novels')
    .select('id, title, slug, cover_url, author, genre, views, created_at', { count: 'exact' })

  if (selectedGenre !== 'All') {
    query = query.ilike('genre', `%${selectedGenre}%`)
  }

  // Apply pagination range
  const { data: filteredNovels, count } = await query
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

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

  const getPageHref = (pageNum: number) => {
    return selectedGenre === 'All'
      ? `/genres?page=${pageNum}`
      : `/genres?genre=${encodeURIComponent(selectedGenre)}&page=${pageNum}`
  }

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
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
                    <span className="text-gray-400">Genre / Category</span>
                  </div>
      <div>
        {/* Header / Title */}
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>📚</span> Genre / Category
          </h1>
        </div>

        {/* Genre Pills Cloud */}
        <div className="flex flex-wrap gap-2 mb-12">
          {genresList.map((g) => {
            const isSelected = selectedGenre === g
            const targetHref =
              g === 'All' ? '/genres' : `/genres?genre=${encodeURIComponent(g)}`
            return (
              <Link
                key={g}
                href={targetHref}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                {g}
              </Link>
            )
          })}
        </div>

        {/* Novels Display Section (Strictly 5 Columns) */}
        <div>
          <h2 className="text-lg font-bold text-white mb-6">
            Showing novels for: <span className="text-blue-400">{selectedGenre}</span>
          </h2>

          {filteredNovels && filteredNovels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredNovels.map((novel) => (
                <Link
                  key={novel.slug}
                  href={`/novel/${novel.slug}`}
                  className="group flex flex-col bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-800">
                    {novel.cover_url ? (
                      <img
                        src={novel.cover_url}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition line-clamp-2 mb-1">
                      {novel.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 truncate">
                      {novel.author || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
              <p className="text-gray-400 text-sm">No novels found for this genre.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sliding Window Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1.5 mt-12 pt-6 border-t border-gray-800">
          {getPageNumbers().map((item, index) => {
            if (item === '<<') {
              const targetPage = Math.max(1, currentPage - 5)
              return (
                <Link
                  key={`jump-prev-${index}`}
                  href={getPageHref(targetPage)}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
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
                  href={getPageHref(targetPage)}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
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
                href={getPageHref(pageNum)}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition border shadow-sm ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
                    : 'bg-gray-900 text-gray-100 border-gray-800 hover:bg-gray-800 hover:text-white'
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