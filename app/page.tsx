import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from "next"

export const revalidate = 60 

export const metadata: Metadata = {
  title: "Read Free Web Novels Online - Web Novel Reader",
  description: "Discover and read thousands of translated light novels, fantasy, action, and romance web novels online for free, updated daily.",
  alternates: {
    canonical: '/',
  },
}

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

  // Fetch all homepage data concurrently in parallel with strict limits to prevent timeouts
  const [popularRes, newRes, completedRes, rawChaptersRes] = await Promise.all([
    supabase.from('novels').select('slug, title, cover_url, author, views').order('views', { ascending: false }).limit(6),
    supabase.from('novels').select('slug, title, cover_url, author, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('novels').select('slug, title, cover_url, author, status').ilike('status', 'completed').order('created_at', { ascending: false }).limit(12),
    supabase.from('chapters').select('id, chapter_number, created_at, novel_id').order('created_at', { ascending: false }).limit(15)
  ])

  const popularNovels = popularRes.data || []
  const newNovels = newRes.data || []
  const completedNovels = completedRes.data || []
  const rawChapters = rawChaptersRes.data || []

  let recentChapters: any[] = []
  if (rawChapters.length > 0) {
    const novelIds = Array.from(new Set(rawChapters.map(c => c.novel_id)))
    const { data: novelsData } = await supabase
      .from('novels')
      .select('id, title, slug, cover_url, genre')
      .in('id', novelIds)

    const novelMap = new Map(novelsData?.map(n => [n.id, n]) || [])

    recentChapters = rawChapters.map(chap => ({
      ...chap,
      novels: novelMap.get(chap.novel_id) || null
    }))
  }

  return (
    <main className="px-8 pt-8 pb-4 max-w-7xl mx-auto">
      
      {/* Hidden or Styled Semantic H1 + Intro Text for SEO Text-to-HTML & Missing H1 Fix */}
      <header className="mb-10">
        <h1 className="text-3xl font-black text-blue-300 mb-2 tracking-tight">
          Read Free Web Novels & Translated Light Novels Online
        </h1>
        <p className="sr-only">
          Welcome to Web Novel Reader, your ultimate destination to explore and read thousands of action, fantasy, romance, and translated light novels online for free. Browse daily updates, trending series, and completed books instantly.
        </p>
      </header>

      {/* Most Popular Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Most Popular</h2>
            </div>
          </div>
          <Link
            href="/popular"
            className="px-4 py-2 bg-gray-900 hover:bg-indigo-300 text-blue-500 text-xs font-bold rounded-lg transition"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularNovels.map((novel) => (
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
      </section>

      {/* New Novels Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-white">New Novels</h2>
            </div>
          </div>
          <Link
            href="/new"
            className="px-4 py-2 bg-gray-900 hover:bg-indigo-300 text-blue-500 text-xs font-bold rounded-lg transition"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newNovels.map((novel) => (
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
      </section>

      {/* Recently Added Chapters Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recently Added Chapters</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentChapters.map((item: any) => {
            const novel = item.novels
            if (!novel || !novel.slug) return null
            return (
              <Link
                key={item.id}
                href={`/novel/${novel.slug}/${item.chapter_number}`}
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
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition">
                      {novel.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white truncate mt-0.5">
                      <span>📚</span>
                      <span className="truncate">{novel.genre || 'General'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-white">
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

      {/* Completed Novels Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Completed Novels</h2>
            </div>
          </div>
          <Link
            href="/completed"
            className="px-4 py-2 bg-gray-900 hover:bg-indigo-300 text-blue-500 text-xs font-bold rounded-lg transition"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {completedNovels.map((novel) => (
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
      </section>
      
    </main>
  )
}