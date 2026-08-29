'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Crown, Plus, Trash2 } from 'lucide-react'

export default function CreateRankingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [novels, setNovels] = useState<any[]>([])
  const [selectedNovels, setSelectedNovels] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Check authentication status and fetch novels on mount
  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('novels')
        .select('id, title, slug')
        .order('title', { ascending: true })
        .limit(100)
      
      if (data) setNovels(data)
    }
    initPage()
  }, [router, supabase])

  const handleAddNovel = (novel: any) => {
    if (selectedNovels.some((n) => n.id === novel.id)) return
    setSelectedNovels([...selectedNovels, novel])
  }

  const handleRemoveNovel = (id: string) => {
    setSelectedNovels(selectedNovels.filter((n) => n.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || selectedNovels.length === 0) {
      alert('Please provide a title and select at least one novel.')
      return
    }

    setLoading(true)

    // 1. Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('You must be signed in to create a ranking.')
      setLoading(false)
      router.push('/auth')
      return
    }

    // 2. Generate clean slug from title + random short suffix to ensure uniqueness
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4)

    // 3. Insert into user_rankings
    const { data: rankingData, error: rankingError } = await supabase
      .from('user_rankings')
      .insert({
        title,
        description,
        slug,
        created_by: session.user.id
      })
      .select()
      .single()

    if (rankingError || !rankingData) {
      alert('Error creating ranking: ' + (rankingError?.message || 'Unknown error'))
      setLoading(false)
      return
    }

    // 4. Insert items into ranking_items with their positions
    const itemsToInsert = selectedNovels.map((novel, index) => ({
      ranking_id: rankingData.id,
      novel_id: novel.id,
      position: index + 1
    }))

    const { error: itemsError } = await supabase
      .from('ranking_items')
      .insert(itemsToInsert)

    if (itemsError) {
      alert('Error adding novels to ranking: ' + itemsError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push(`/rankings/${slug}`)
  }

  const filteredNovels = novels.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 text-white">
        <Crown className="w-7 h-7 text-amber-500" /> Create Custom Ranking
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-sm text-white">
        <div>
          <label className="block text-sm font-medium mb-2">Ranking Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Top 10 Worldbuilding Novels"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly explain what makes this list special..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Selected Novels (Ordered Rank)</label>
          {selectedNovels.length === 0 ? (
            <p className="text-gray-500 text-xs italic mb-4">No novels added yet. Search and select below.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {selectedNovels.map((novel, index) => (
                <div key={novel.id} className="flex items-center justify-between bg-gray-980 px-4 py-2 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-400">#{index + 1}</span>
                    <span className="text-sm font-medium">{novel.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNovel(novel.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search & Add Novels</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to find novels..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-800 rounded-xl p-2 bg-gray-900">
            {filteredNovels.map((novel) => {
              const isSelected = selectedNovels.some((n) => n.id === novel.id)
              return (
                <div key={novel.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-400 rounded-lg text-sm">
                  <span className="truncate">{novel.title}</span>
                  <button
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleAddNovel(novel)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-red-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> {isSelected ? 'Added' : 'Add'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/10"
        >
          {loading ? 'Publishing...' : 'Publish Ranking List'}
        </button>
      </form>
    </div>
  )
}