import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Novels",
};
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

export default async function NewNovelsPage({
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

  // Optimized query using the pre-calculated chapter_count column
  const { data: novels, error } = await supabase
    .from('novels')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return (
      <div className="p-8 text-red-500 font-mono max-w-7xl mx-auto">
        ✕ Error loading new novels: {error.message}
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    pages.push('<<')

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

    pages.push('>>')
    pages.push(totalPages)

    return pages
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
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
              <span className="text-gray-400">New Novels</span>
            </div>
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">New Novels</h1>
        </div>
      </div>

      {/* Horizontal List Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {novels?.map((novel) => {
          const chapterCount = novel.chapter_count || 0

          return (
            <Link
              key={novel.slug}
              href={`/novel/${novel.slug}`}
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
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
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
                  href={`/new?page=${targetPage}`}
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
                  href={`/new?page=${targetPage}`}
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
                href={`/new?page=${pageNum}`}
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