'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Chapter {
  chapter_number: number
  title: string
  content: string
}

interface ReaderViewProps {
  novelId: string
  chapter: Chapter
  prevChapterNum?: number
  nextChapterNum?: number
}

export default function ReaderView({
  novelId,
  chapter,
  prevChapterNum,
  nextChapterNum,
}: ReaderViewProps) {
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg')
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark')

  // Save progress in LocalStorage when reading a chapter
  useEffect(() => {
    if (typeof window !== 'undefined' && novelId && chapter.chapter_number) {
      localStorage.setItem(`novel_progress_${novelId}`, chapter.chapter_number.toString())
    }
  }, [novelId, chapter.chapter_number])

  const themeClasses = {
    dark: 'bg-black text-gray-200',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32]',
    light: 'bg-white text-gray-900',
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]}`}>
      <main className="max-w-3xl mx-auto p-6 leading-relaxed">
        {/* Top Header & Settings Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-700/40 pb-4 mb-6 gap-4">
          <Link
            href={`/novel/${novelId}`}
            className="text-blue-500 hover:underline text-sm font-bold"
          >
             Table of Contents
          </Link>

          {/* Top Prev / Next Navigation with separate rectangles and space */}
          <div className="flex items-center gap-9 text-xs font-semibold">
            {prevChapterNum ? (
              <Link
                href={`/novel/${novelId}/${prevChapterNum}`}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition"
              >
                &lt; Prev Chapter
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-gray-800/40 text-gray-500 border border-gray-700/50 rounded cursor-not-allowed">
                &lt; Prev
              </button>
            )}

            {nextChapterNum ? (
              <Link
                href={`/novel/${novelId}/${nextChapterNum}`}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition"
              >
                Next Chapter &gt;
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-gray-800/40 text-gray-500 border border-gray-700/50 rounded cursor-not-allowed">
                Next &gt;
              </button>
            )}
          </div>

          {/* Customization Controls */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Font Size Controls */}
            <div className="flex border border-gray-700 rounded overflow-hidden">
              <button
                onClick={() => setFontSize('text-base')}
                className={`px-2 py-1 ${fontSize === 'text-base' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('text-lg')}
                className={`px-2 py-1 ${fontSize === 'text-lg' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('text-xl')}
                className={`px-2 py-1 ${fontSize === 'text-xl' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A+
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex border border-gray-700 rounded overflow-hidden">
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 ${theme === 'dark' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`px-2 py-1 ${theme === 'sepia' ? 'bg-amber-700 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-1 ${theme === 'light' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        <p className="text-2xl md:text-3xl font-bold mb-8 text-center">{chapter.title}</p>

        {/* Dynamic Text Content */}
        <article className={`space-y-6 ${fontSize} leading-8 whitespace-pre-line font-serif`}>
          {chapter.content}
        </article>

        {/* Bottom Chapter Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-700/40">
          {prevChapterNum ? (
            <Link
              href={`/novel/${novelId}/${prevChapterNum}`}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition text-sm font-semibold"
            >
               Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {nextChapterNum ? (
            <Link
              href={`/novel/${novelId}/${nextChapterNum}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition text-sm font-semibold"
            >
              Next Chapter 
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  )
}
