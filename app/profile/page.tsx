'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('Inbox')
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
    }
    fetchUser()
  }, [router, supabase])

  // Fetch library items whenever the active tab changes to 'Library'
  useEffect(() => {
    if (activeTab === 'Library' && user) {
      const fetchLibrary = async () => {
        setLibraryLoading(true)
        const { data, error } = await supabase
          .from('user_library')
          .select(`
            id,
            novels (
              id,
              title,
              author,
              cover_url,
              slug
            )
          `)
          .eq('user_id', user.id)

        if (!error && data) {
          const formattedItems = data.map((item: any) => item.novels).filter(Boolean)
          setLibraryItems(formattedItems)
        }
        setLibraryLoading(false)
      }
      fetchLibrary()
    }
  }, [activeTab, user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) return <div className="p-8 text-white">Loading profile...</div>

  const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-white">
      <Link href="/" className="text-sm text-blue-400 hover:underline mb-6 inline-block font-semibold">
        ← Back to Home
      </Link>

      {/* Profile Header Card */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between mb-8 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase text-white">
            {displayName ? displayName[0] : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-xs text-gray-100">Reader &bull; {user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600/20 border border-red-800 text-gray-100 hover:bg-red-600 hover:text-white px-4 py-2 rounded text-xs font-semibold transition"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-6 border-b border-gray-800 text-sm mb-8 pb-1">
        {['Info', 'Library', 'History', 'Comments', 'Inbox'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 font-medium transition px-1 ${
              activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
        <h2 className="text-lg font-bold mb-1">Your {activeTab}</h2>
        

        {activeTab === 'Library' ? (
          libraryLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading library...</div>
          ) : libraryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {libraryItems.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.slug}`}
                  className="bg-gray-950 border border-gray-800 hover:border-blue-500 rounded-lg p-3 flex flex-col transition group"
                >
                  <img src={novel.cover_url} alt={novel.title} className="w-full h-40 object-cover rounded mb-2" />
                  <h3 className="text-white text-xs font-bold truncate group-hover:text-blue-400">{novel.title}</h3>
                  <p className="text-[10px] text-gray-400 truncate">{novel.author}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
              No novels added to your library yet.
            </div>
          )
        ) : (
          <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
            No items found in {activeTab.toLowerCase()} yet.
          </div>
        )}
      </div>
    </main>
  )
}