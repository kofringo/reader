import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function timeAgo(dateString: string) {
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

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch popular novels sorted by views
  const { data: popularNovels } = await supabase
    .from('novels')
    .select('*')
    .limit(6)
    .order('views', { ascending: false })

  // Fetch newly added novels sorted by creation date
  const { data: newNovels } = await supabase
    .from('novels')
    .select('*')
    .limit(6)
    .order('created_at', { ascending: false })

  // Fetch recently added chapters (3 columns x 11 rows = 33 chapters) joining with novels
  const { data: recentChapters } = await supabase
    .from('chapters')
    .select(`
      id,
      chapter_number,
      created_at,
      novel_id,
      novels (
        id,
        title,
        cover_url
      )
    `)
    .limit(33)
    .order('created_at', { ascending: false })

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Most Popular Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Most Popular</h2>
              <p className="text-sm text-gray-400">Popular Novels Selected by Users</p>
            </div>
          </div>
          <Link
            href="/popular"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularNovels?.map((novel) => (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
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
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded shadow">
                  Ongoing
                </span>
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
      </section>

      {/* New to Web Novels Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">New to Web Novels</h2>
              <p className="text-sm text-gray-400">Latest recently added light novels</p>
            </div>
          </div>
          <Link
            href="/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newNovels?.map((novel) => (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
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
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded shadow">
                  Ongoing
                </span>
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
      </section>

      {/* Recently Added Chapters Section (3 Columns Layout with Time Ago) */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Recently Added Chapters</h2>
            <p className="text-sm text-gray-400">Latest Translated Chapters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentChapters?.map((item: any) => {
            const novel = item.novels
            if (!novel) return null
            return (
              <Link
                key={item.id}
                href={`/novel/${novel.id}/${item.chapter_number}`}
                className="flex bg-gray-900 border border-gray-800 rounded-lg p-3 gap-3 hover:border-gray-700 transition group"
              >
                <div className="w-16 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                  {novel.cover_url ? (
                    <img src={novel.cover_url} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition">
                    {novel.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Update {timeAgo(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                      <span>🍃</span>
                      <span>Chapter {item.chapter_number}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}