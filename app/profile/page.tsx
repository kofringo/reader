'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('Info')
  
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Profile Settings Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [aboutInput, setAboutInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
        setUsernameInput(session.user.user_metadata?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '')
        setAboutInput(session.user.user_metadata?.about || '')
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

  // Fetch history items whenever the active tab changes to 'History'
  useEffect(() => {
    if (activeTab === 'History' && user) {
      const fetchHistory = async () => {
        setHistoryLoading(true)
        const { data, error } = await supabase
          .from('user_history')
          .select(`
            id,
            updated_at,
            novels (
              title,
              slug,
              cover_url
            ),
            chapters (
              chapter_number,
              title
            )
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(15)

        if (!error && data) {
          setHistoryItems(data)
        }
        setHistoryLoading(false)
      }
      fetchHistory()
    }
  }, [activeTab, user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })

    if (passwordInput && passwordInput !== confirmPasswordInput) {
      setMessage({ text: 'Passwords do not match.', type: 'error' })
      return
    }

    setSaving(true)
    const updates: any = {
      data: {
        username: usernameInput,
        about: aboutInput,
      }
    }

    if (passwordInput) {
      updates.password = passwordInput
    }

    const { data, error } = await supabase.auth.updateUser(updates)

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setUser(data.user)
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setPasswordInput('')
      setConfirmPasswordInput('')
      setTimeout(() => {
        setIsEditOpen(false)
        setMessage({ text: '', type: '' })
      }, 1500)
    }
    setSaving(false)
  }

  if (!user) return <div className="p-8 text-white">Loading profile...</div>

  const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]
  const aboutText = user.user_metadata?.about || ''
  const registeredDate = user.created_at ? new Date(user.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) : '-'

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-white relative">
      <Link href="/" className="text-sm text-blue-400 hover:underline mb-6 inline-block font-semibold">
        ← Back to Home
      </Link>

      {/* Profile Header Card */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between mb-8 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase text-white overflow-hidden">
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
        {activeTab === 'Info' && (
          <div>
            <h2 className="text-base font-bold mb-4 text-gray-200 border-b border-gray-800 pb-2">Profile</h2>
            <div className="divide-y divide-gray-800 text-sm">
              <div className="flex py-3">
                <span className="w-1/3 text-gray-400 font-medium">Username</span>
                <span className="w-2/3 text-white">{displayName}</span>
              </div>
              
              <div className="flex py-3">
                <span className="w-1/3 text-gray-400 font-medium">E-mail</span>
                <span className="w-2/3 text-white">{user.email}</span>
              </div>
              <div className="flex py-3">
                <span className="w-1/3 text-gray-400 font-medium">About</span>
                <span className={`w-2/3 ${aboutText ? 'text-white' : 'text-gray-500 italic'}`}>
                  {aboutText || 'No information given.'}
                </span>
              </div>
              <div className="flex py-3">
                <span className="w-1/3 text-gray-400 font-medium">Registered</span>
                <span className="w-2/3 text-white">{registeredDate}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-800">
           
              <button
                onClick={() => setIsEditOpen(true)}
                className="bg-blue-700 hover:bg-blue-600 text-gray-50 px-4 py-2 rounded text-xs font-semibold transition shadow"
              >
                UPDATE PROFILE
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Library' && (
          <div>
            <h2 className="text-base font-bold mb-4 text-gray-200 border-b border-gray-800 pb-2">Library</h2>
            {libraryLoading ? (
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
            )}
          </div>
        )}

        {activeTab === 'History' && (
          <div>
            <h2 className="text-base font-bold mb-4 text-gray-200 border-b border-gray-800 pb-2">History</h2>
            {historyLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading history...</div>
            ) : historyItems.length > 0 ? (
              <div className="space-y-3">
                {historyItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/novel/${item.novels?.slug}/${item.chapters?.chapter_number}`}
                    className="flex items-center gap-4 bg-gray-950 border border-gray-800 hover:border-blue-500 p-3 rounded-lg transition group"
                  >
                    {item.novels?.cover_url && (
                      <img src={item.novels.cover_url} alt={item.novels?.title} className="w-12 h-16 object-cover rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-xs font-bold truncate group-hover:text-blue-400">
                        {item.novels?.title}
                      </h3>
                      <p className="text-xs text-blue-400 font-medium mt-0.5">
                        Chapter {item.chapters?.chapter_number}: {item.chapters?.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Read on: {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
                No items found in history yet.
              </div>
            )}
          </div>
        )}

        {activeTab !== 'Info' && activeTab !== 'Library' && activeTab !== 'History' && (
          <div>
            <h2 className="text-base font-bold mb-4 text-gray-200 border-b border-gray-800 pb-2">{activeTab}</h2>
            <div className="p-8 text-center border border-dashed border-gray-800 rounded text-gray-500 text-sm">
              No items found in {activeTab.toLowerCase()} yet.
            </div>
          </div>
        )}
      </div>

      {/* UPDATE PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-lg max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-lg"
            >
              &#10005;
            </button>

            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Profile Settings</h2>

            {message.text && (
              <div className={`mb-4 p-3 rounded text-xs font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">About you</label>
                <textarea
                  rows={4}
                  value={aboutInput}
                  onChange={(e) => setAboutInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Write something about yourself..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-gray-50 font-semibold px-6 py-2.5 rounded shadow transition text-xs tracking-wider uppercase disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}