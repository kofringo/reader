import { createClient } from '@/lib/supabase/server'
import NovelList from '@/components/NovelList'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Tag, Clock, Moon, LogIn, Bookmark } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: novels, error } = await supabase.from('novels').select('*')
  const { data: { user } } = await supabase.auth.getUser()

  if (error) {
    return (
      <div className="p-8 text-red-500 font-mono">
        ✕ Error connecting to database: {error.message}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100">
      {/* --- TOP NAVBAR --- */}
      <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-purple-600/30 group-hover:bg-purple-500 transition">
              W
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-purple-400 transition">
                Web Novel Reader
              </span>
              <p className="text-[10px] text-green-400 font-medium -mt-1">
                ✓ Connected to Supabase
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300">
              <Search className="w-4 h-4" /> Search
            </Link>
            <Link href="/" className="flex items-center gap-1.5 hover:text-white transition">
              <BookOpen className="w-4 h-4" /> Categories
            </Link>
            <Link href="/" className="flex items-center gap-1.5 hover:text-white transition">
              <Tag className="w-4 h-4" /> Tags
            </Link>
            <Link href="/" className="flex items-center gap-1.5 hover:text-white transition">
              <Clock className="w-4 h-4" /> Updates
            </Link>
          </nav>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Toggle Theme">
              <Moon className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/library"
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
                >
                  <Bookmark className="w-3.5 h-3.5" /> My Library
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-xs text-gray-400 hover:text-white font-semibold px-2 py-1"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
              >
                <LogIn className="w-3.5 h-3.5" /> SIGN IN
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-gray-400 py-12 text-center">Loading novels...</div>}>
          <NovelList initialNovels={novels || []} />
        </Suspense>
      </main>
    </div>
  )
}