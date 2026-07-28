'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Novel {
  id: string
  title: string
  author: string
  cover_url?: string
  genre?: string
}

export default function NovelList({ initialNovels }: { initialNovels: Novel[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  // Sync selectedGenre state with URL query parameter (?genre=Name)
  useEffect(() => {
    const genreParam = searchParams.get('genre')
    setSelectedGenre(genreParam)
  }, [searchParams])

  // Extract all unique genres across all novels
  const allGenres = Array.from(
    new Set(
      initialNovels
        .flatMap((n) => (n.genre ? n.genre.split(',').map((g) => g.trim()) : []))
        .filter(Boolean)
    )
  ).sort()

  // Filter novels by search query and genre selection
  const filteredNovels = initialNovels.filter((novel) => {
    const matchesSearch = novel.title.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = selectedGenre
      ? novel.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      : true
    return matchesSearch && matchesGenre
  })

  const clearGenre = () => {
    setSelectedGenre(null)
    router.push('/')
  }

  const handleGenreClick = (genre: string) => {
    if (selectedGenre?.toLowerCase() === genre.toLowerCase()) {
      clearGenre()
    } else {
      setSelectedGenre(genre)
      router.push(`/?genre=${encodeURIComponent(genre)}`)
    }
  }

  return (
    <div>
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
        <input
          type="text"
          placeholder="🔍 Search novels by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
        />

        {selectedGenre && (
          <div className="flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <span>Filter: <strong>{selectedGenre}</strong></span>
            <button
              onClick={clearGenre}
              className="text-gray-400 hover:text-white font-bold ml-1"
              title="Clear Filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT AREA: Novel Cards (Spans 3 columns on large screens) */}
        <div className="lg:col-span-3">
          {filteredNovels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {filteredNovels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="group flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                >
                  <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden flex items-center justify-center">
                    {novel.cover_url ? (
                      <img
                        src={novel.cover_url}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-xs font-bold uppercase tracking-wider">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col flex-grow">
                    <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-blue-400 transition">
                      {novel.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      By {novel.author || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-gray-400 font-medium">No novels found matching your filter.</p>
              <button
                onClick={clearGenre}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition"
              >
                View All Novels
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Genre Navigation Box */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                🏷️ Genres
              </h2>
              {selectedGenre && (
                <button
                  onClick={clearGenre}
                  className="text-xs text-blue-400 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={clearGenre}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-between ${
                  !selectedGenre
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>All Genres</span>
                <span className="text-[10px] opacity-75">{initialNovels.length}</span>
              </button>

              {allGenres.map((genre) => {
                const count = initialNovels.filter((n) =>
                  n.genre?.toLowerCase().includes(genre.toLowerCase())
                ).length

                const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase()

                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                    }`}
                  >
                    <span>{genre}</span>
                    <span className="text-[10px] text-gray-500">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}