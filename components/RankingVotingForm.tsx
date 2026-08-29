'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import RankItemSelect from './VoteButton'
import { Send, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RankingVotingForm({ 
  rankingId, 
  items, 
  voteCounts 
}: { 
  rankingId: string, 
  items: any[], 
  voteCounts: Record<string, any> 
}) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient() // Uses your configured browser client

  const handleSelect = (itemId: string) => {
    if (submitted) return
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleSubmitVotes = async () => {
    if (selectedItemIds.length === 0 || submitting) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    // If user is not logged in, redirect them to /auth
    if (!user) {
      router.push('/auth')
      return
    }

    const votesToInsert = selectedItemIds.map((itemId, index) => ({
      ranking_item_id: itemId,
      position: index + 1,
      user_id: user.id
    }))

    const { error } = await supabase
      .from('ranking_votes')
      .insert(votesToInsert)

    if (!error) {
      setSubmitted(true)
      router.refresh()
    } else {
      alert('Error submitting votes. You may have already voted on this list.')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        {items.map((item: any, idx: number) => {
          const selectedIndex = selectedItemIds.indexOf(item.id)
          const rankNumber = selectedIndex !== -1 ? selectedIndex + 1 : null

          return (
            <RankItemSelect
              key={item.id}
              itemId={item.id}
              novelTitle={item.novels?.title || 'Unknown Novel'}
              novelSlug={item.novels?.slug}
              originalRank={idx + 1}
              itemStats={voteCounts[item.id]}
              selectedRank={rankNumber}
              onSelect={handleSelect}
            />
          )
        })}
      </div>

      {!submitted ? (
        <div className="flex items-center justify-between bg-gray-900 border border-gray-200 p-4 rounded-xl">
          <p className="text-sm text-gray-100 font-medium">
            {selectedItemIds.length === 0 
              ? 'Click items to arrange them in your preferred order.' 
              : `${selectedItemIds.length} item(s) selected for your vote.`}
          </p>
          <button
            onClick={handleSubmitVotes}
            disabled={selectedItemIds.length === 0 || submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-sm"
          >
            <Send className="w-4 h-4" /> Submit Vote
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Your votes have been recorded!
        </div>
      )}
    </div>
  )
}