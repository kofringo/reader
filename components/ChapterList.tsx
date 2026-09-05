'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Chapter {
  id: string
  chapter_number: number
  title: string
}

interface ChapterListProps {
  chapters: Chapter[]
  novelSlug: string
}

const CHAPTERS_PER_PAGE = 50

export default function ChapterList({ chapters, novelSlug }: ChapterListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(chapters.length / CHAPTERS_PER_PAGE)
  const startIndex = (currentPage - 1) * CHAPTERS_PER_PAGE
  const currentChapters = chapters.slice(startIndex, startIndex + CHAPTERS_PER_PAGE)

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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-sm mt-6">
      <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
        <span>📑</span> CHAPTER LIST ({chapters.length})
      </h2>

      {currentChapters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {currentChapters.map((chap) => (
            <Link
              key={chap.id}
              href={`/novel/${novelSlug}/${chap.chapter_number}`}
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
              return (
                <button
                  key={`jump-prev-${index}`}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 5))}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
                >
                  &lt;&lt;
                </button>
              )
            }

            if (item === '>>') {
              return (
                <button
                  key={`jump-next-${index}`}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 5))}
                  className="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold bg-gray-900 text-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition shadow-sm"
                >
                  &gt;&gt;
                </button>
              )
            }

            const pageNum = Number(item)
            const isCurrent = pageNum === currentPage

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition border shadow-sm ${
                  isCurrent 
                  ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
                  : 'bg-gray-900 text-gray-100 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}