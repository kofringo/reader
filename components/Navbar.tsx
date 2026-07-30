'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setSearchQuery(currentSearch)
  }, [currentSearch])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push(`/search`)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    router.push('/new')
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }

  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md group-hover:bg-blue-500 transition">
            W
          </div>
          <div>
            <span className="font-extrabold text-lg text-white group-hover:text-blue-400 transition hidden sm:inline">
              Web Novel Reader
            </span>
          </div>
        </Link>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-auto">
          <div className="relative flex items-center bg-white rounded-full border border-slate-300 px-4 h-10 shadow-sm focus-within:border-blue-500 transition">
            
            {/* SVG Search Icon */}
            <svg
              className="w-4 h-4 text-gray-400 mr-2.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            
            {/* Input Box */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search novels by title..."
              className="w-full h-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />

            {/* Clear (X) Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 w-5 h-5 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-sm shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Right: Theme Toggle & Sign In */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Moon / Sun Theme Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 transition"
          >
            {isDark ? '🌙' : '☀️'}
          </button>

          <Link
            href="/auth"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            Sign In
          </Link>
        </div>

      </div>
    </header>
  )
}