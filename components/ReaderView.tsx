'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdBanner from '@/components/AdBanner'

interface Chapter {
  chapter_number: number
  title: string
  content: string
}

interface ReaderViewProps {
  novelSlug: string
  novelTitle: string
  chapter: Chapter
  prevChapterNum?: number
  nextChapterNum?: number
}

export default function ReaderView({
  novelSlug,
  novelTitle,
  chapter,
  prevChapterNum,
  nextChapterNum,
}: ReaderViewProps) {
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg')
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark')

  // Load saved preferences and history progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('reader_theme') as 'dark' | 'sepia' | 'light'
      if (savedTheme) setTheme(savedTheme)

      const savedFontSize = localStorage.getItem('reader_fontsize') as 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'
      if (savedFontSize) setFontSize(savedFontSize)

      if (novelSlug && chapter.chapter_number) {
        localStorage.setItem(`novel_progress_${novelSlug}`, chapter.chapter_number.toString())
      }
    }
  }, [novelSlug, chapter.chapter_number])

  const changeTheme = (newTheme: 'dark' | 'sepia' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('reader_theme', newTheme)
  }

  const changeFontSize = (newSize: 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl') => {
    setFontSize(newSize)
    localStorage.setItem('reader_fontsize', newSize)
  }

  const themeClasses = {
    dark: 'bg-black text-gray-400',
    sepia: 'bg-[#fbf0d9] text-[#5f4b32]',
    light: 'bg-white text-gray-900',
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]}`}>
      
      <main className="max-w-3xl mx-auto p-6 leading-relaxed">
        {/* Top Header & Settings Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-700/40 pb-4 mb-6 gap-4 text-center md:text-left">
          
          {/* Novel Title Link */}
          <Link
            href={`/novel/${novelSlug}`}
            className="text-blue-500 hover:underline text-sm font-bold truncate max-w-full md:max-w-[250px]"
            title={novelTitle}
          >
             {novelTitle}
          </Link>

          {/* Centered Prev / Next Navigation for Mobile & Desktop */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold w-full md:w-auto">
            {prevChapterNum ? (
              <Link
                href={`/novel/${novelSlug}/${prevChapterNum}`}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-50 rounded transition"
              >
                &lt; Prev 
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-gray-800 text-gray-50 border border-gray-700/50 rounded cursor-not-allowed opacity-50">
                &lt; Prev
              </button>
            )}

            {nextChapterNum ? (
              <Link
                href={`/novel/${novelSlug}/${nextChapterNum}`}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-50 rounded transition"
              >
                Next &gt;
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-gray-800 text-gray-50 border border-gray-700/50 rounded cursor-not-allowed opacity-50">
                Next &gt;
              </button>
            )}
          </div>

          {/* Customization Controls */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold w-full md:w-auto">
            {/* Font Size Controls */}
            <div className="flex border border-gray-700 rounded overflow-hidden">
              <button
                onClick={() => changeFontSize('text-base')}
                className={`px-2 py-1 ${fontSize === 'text-base' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A-
              </button>
              <button
                onClick={() => changeFontSize('text-lg')}
                className={`px-2 py-1 ${fontSize === 'text-lg' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A
              </button>
              <button
                onClick={() => changeFontSize('text-xl')}
                className={`px-2 py-1 ${fontSize === 'text-xl' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                A+
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex border border-gray-700 rounded overflow-hidden">
              <button
                onClick={() => changeTheme('dark')}
                className={`px-2 py-1 ${theme === 'dark' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Dark
              </button>
              <button
                onClick={() => changeTheme('sepia')}
                className={`px-2 py-1 ${theme === 'sepia' ? 'bg-amber-700 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => changeTheme('light')}
                className={`px-2 py-1 ${theme === 'light' ? 'bg-blue-600 text-gray-50' : 'bg-gray-800 text-gray-50'}`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Ad Banner Widget */}
        <AdBanner />
        
        <p className="text-2xl md:text-3xl font-bold mb-8 text-center">{chapter.title}</p>
       
        {/* Dynamic Text Content */}
        <article className={`space-y-6 ${fontSize} leading-8 whitespace-pre-line font-serif`}>
          {chapter.content}
        </article>

        {/* Bottom Chapter Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-700/40">
          {prevChapterNum ? (
            <Link
              href={`/novel/${novelSlug}/${prevChapterNum}`}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-600 text-gray-50 rounded transition text-sm font-semibold"
            >
              Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {nextChapterNum ? (
            <Link
              href={`/novel/${novelSlug}/${nextChapterNum}`}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-500 text-gray-50 rounded transition text-sm font-semibold"
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