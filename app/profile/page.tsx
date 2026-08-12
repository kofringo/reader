'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('Inbox')
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) return <div className="p-8 text-white">Loading profile...</div>

  // Clean username or fallback
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
            <p className="text-xs text-gray-400">Reader &bull; {user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600/20 border border-red-800 text-red-300 hover:bg-red-600 hover:text-white px-4 py-2 rounded text-xs font-semibold transition"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs with proper spacing */}
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
        <p className="text-xs text-gray-400 mb-6">
          Manage your account data and interact with community notifications.
        </p>
        <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
          No items found in {activeTab.toLowerCase()} yet.
        </div>
      </div>
    </main>
  )
}