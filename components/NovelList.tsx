'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

interface Novel {
  id: string
  title: string
  author: string
  cover_url: string | null
  genres?: string[] | string | null
  genre?: string[] | string | null
  description: string | null
}

const STATIC_GENRES = [
  'Action', 'Adult', 'Adventure', 'Comedy', 'Drama', 'Eastern',
  'Ecchi', 'Fantasy', 'Game', 'Gender Bender', 'Harem', 'Historical',
  'Horror', 'Josei', 'Martial Arts', 'Mature', 'Mecha', 'Mystery',
  'Psychological', 'Reincarnation', 'Romance', 'School Life', 'Sci-fi',
  'Seinen', 'Shoujo', 'Shounen Ai', 'Shounen', 'Slice of Life',
  'Supernatural', 'Xianxia', 'Xuanhuan'
]

const GENRE_COLORS: Record<string, string> = {
  'Action': 'text-emerald-400 hover:text-emerald-300',
  'Fantasy': 'text-purple-400 hover:text-purple-300',
  'Game': 'text-amber-500 hover:text-amber-400',
  'Martial Arts': 'text-blue-400 hover:text-blue-300',
  'Romance': 'text-rose-400 hover:text-rose-300',
}

export default function NovelList({ initialNovels }: { initialNovels: Novel[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get('search') || ''
  const selectedGenre = searchParams.get('genre') || ''

  const checkHasGenre = (novel: Novel, targetGenre: string): boolean => {
    const rawData = novel.genres || novel.genre
    if (!rawData) return false

    const target = targetGenre.trim().toLowerCase()

    if (Array.isArray(rawData)) {
      return rawData.some((g) => String(g).trim().toLowerCase() === target)
    }

    if (typeof rawData === 'string') {
      return rawData
        .toLowerCase()
        .split(/[,|]/)
        .some((g) => g.trim() === target)
    }

    return false
  }

  const filteredNovels = initialNovels.filter((novel) => {
    const matchesSearch = novel.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())

    const matchesGenre = selectedGenre
      ? checkHasGenre(novel, selectedGenre)
      : true

    return matchesSearch && matchesGenre
  })

  const handleGenreClick = (genre: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedGenre.toLowerCase() === genre.toLowerCase()) {
      params.delete('genre')
    } else {
      params.set('genre', genre)
    }
    router.push(`/?${params.toString()}`)
  }

  const clearGenre = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('genre')
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1">
        {selectedGenre || searchQuery ? (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {searchQuery && (
              <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded flex items-center gap-2">
                Search: <strong>"{searchQuery}"</strong>
              </span>
            )}
            {selectedGenre && (
              <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-800 text-purple-200 text-xs px-2.5 py-1 rounded">
                <span>Filter: <strong>{selectedGenre}</strong></span>
                <button 
                  onClick={clearGenre} 
                  className="text-purple-400 hover:text-white font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ) : null}

        {filteredNovels.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-gray-400 text-sm">No novels found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredNovels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novel/${novel.id}`}
                className="group relative bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                  {novel.cover_url ? (
                    <Image
                      src={novel.cover_url}
                      alt={novel.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No Cover
                    </div>
                  )}
                </div>

                <div className="p-2.5 flex flex-col flex-1 justify-between bg-slate-900">
                  <div>
                    <h2 className="font-bold text-slate-100 text-[12px] leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {novel.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {novel.author || 'Unknown'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FreeWebNovel Style Compact Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden sticky top-20">
          
          {/* Header */}
          <div className="border-b border-slate-800 px-3 py-2 bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-xs">📑</span>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                GENRES
              </h3>
            </div>
            {selectedGenre && (
              <button
                onClick={clearGenre}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-medium underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Ultra-Compact Grid */}
          <div className="grid grid-cols-2 divide-x divide-slate-800/60">
            {STATIC_GENRES.map((genre) => {
              const isActive = selectedGenre.toLowerCase() === genre.toLowerCase()
              const colorClass = GENRE_COLORS[genre] || 'text-slate-400 hover:text-slate-200'

              return (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border-b border-slate-800/50 text-left transition hover:bg-slate-800/40 ${
                    isActive 
                      ? 'bg-purple-950/60 text-purple-300 font-semibold' 
                      : colorClass
                  }`}
                >
                  <span className={`text-[9px] ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                    {isActive ? '✔' : '🔘'}
                  </span>
                  <span className="truncate">{genre}</span>
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}