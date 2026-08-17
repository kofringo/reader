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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.q?.trim() || ''
  const supabase = await createClient()

  // Log the search query directly using await so the serverless function doesn't exit early
  if (query.length > 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('search_logs').insert({
        query: query.toLowerCase(),
        user_id: user?.id || null,
      })
    } catch (err) {
      console.error('Failed to log search:', err)
    }
  }

  // Fetch novels matching the search title query
  const { data: novels, error } = await supabase
    .from('novels')
    .select('*')
    .ilike('title', `%${query}%`)
    .order('views', { ascending: false })

  return (
    <main className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Search Results</h1>
          <p className="text-sm text-gray-400">
            Showing results for &ldquo;<span className="text-white">{query}</span>&rdquo;
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 text-red-500 font-mono bg-gray-900 border border-gray-800 rounded-lg mb-6">
          ✕ Error executing search: {error.message}
        </div>
      )}

      {novels && novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900 border border-slate-200 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3 shadow-inner">
            🔍
          </div>
          <h2 className="text-base font-bold text-white mb-1">No novels found</h2>
          <p className="text-sm text-white max-w-sm">
            We couldn&apos;t find any novels matching &ldquo;<span className="font-semibold text-white">{query}</span>&rdquo;. Try searching with a different title or keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {novels?.map((novel) => {
            const chapterCount = novel.chapter_count || 0

            return (
              <Link
                key={novel.slug}
                href={`/novel/${novel.slug}`}
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
    </main>
  )
}