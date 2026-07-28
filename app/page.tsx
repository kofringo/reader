import { createClient } from '@/lib/supabase/server'
import NovelList from '@/components/NovelList'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: novels, error } = await supabase.from('novels').select('*')
  const { data: { user } } = await supabase.auth.getUser()

  if (error) {
    return (
      <div className="p-8 text-red-500 font-mono">
        ❌ Error connecting to database: {error.message}
      </div>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div>
          <Link href="/" className="inline-block group">
            <h1 className="text-4xl font-extrabold tracking-tight group-hover:text-blue-400 transition-colors">
              Web Novel Reader
            </h1>
          </Link>
          <p className="text-green-500 font-medium text-sm mt-1">
            ✓ Connected to Supabase
          </p>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/library"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition"
              >
                📚 My Library
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-xs text-gray-400 hover:text-white font-semibold"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold border border-gray-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="text-gray-400">Loading novels...</div>}>
        <NovelList initialNovels={novels || []} />
      </Suspense>
    </main>
  )
}