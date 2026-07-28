'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setSearchQuery(currentSearch)
  }, [currentSearch])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    
    router.push(`/?${params.toString()}`)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    // Optional: add root class toggling if you support light theme styles
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
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search novels by title..."
              className="w-full bg-slate-900/90 text-sm text-gray-200 placeholder-gray-500 rounded-xl px-4 py-2 pl-10 border border-slate-800 focus:outline-none focus:border-blue-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>
        </div>

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