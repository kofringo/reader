import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Crown, ArrowLeft, User } from 'lucide-react'
import RankingVotingForm from '@/components/RankingVotingForm'

export default async function RankingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: ranking, error } = await supabase
    .from('user_rankings')
    .select(`
      id,
      title,
      description,
      slug,
      created_at,
      created_by,
      ranking_items (
        id,
        position,
        novels (id, title, slug)
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single()

  if (error || !ranking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ranking Not Found</h1>
        <p className="text-gray-600 mb-6">This ranking list may have been removed or doesn't exist.</p>
        <Link href="/rankings" className="text-blue-600 hover:underline font-medium">← Back to Rankings</Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', ranking.created_by)
    .single()

  const authorName = profile?.username || 'Anonymous Reader'

  const itemIds = ranking.ranking_items?.map((item: any) => item.id) || []
  
  // Fetch votes including their submitted positions
  const { data: votesData } = await supabase
    .from('ranking_votes')
    .select('ranking_item_id, position')
    .in('ranking_item_id', itemIds)

  // Aggregate votes and determine the most frequent position for each item
  const voteStats: Record<string, { total: number, positions: Record<number, number> }> = {}
  let totalListVotes = 0

  votesData?.forEach((v: any) => {
    if (!voteStats[v.ranking_item_id]) {
      voteStats[v.ranking_item_id] = { total: 0, positions: {} }
    }
    voteStats[v.ranking_item_id].total += 1
    totalListVotes += 1

    if (v.position) {
      voteStats[v.ranking_item_id].positions[v.position] = (voteStats[v.ranking_item_id].positions[v.position] || 0) + 1
    }
  })

  // Calculate the dominant/most-voted position for each item to sort them dynamically
  const processedItems = ranking.ranking_items?.map((item: any) => {
    const stats = voteStats[item.id] || { total: 0, positions: {} }
    
    // Find which position got the highest count for this item
    let bestPosition = item.position // fallback to initial creation position
    let maxVotesAtPos = -1
    
    Object.entries(stats.positions).forEach(([pos, count]) => {
      if ((count as number) > maxVotesAtPos) {
        maxVotesAtPos = count as number
        bestPosition = Number(pos)
      }
    })

    return {
      ...item,
      computedRank: bestPosition,
      stats: {
        total: stats.total,
        topPosition: maxVotesAtPos > 0 ? bestPosition : undefined
      }
    }
  }) || []

  // Sort items dynamically by their computed community ranking position
  const sortedItems = processedItems.sort((a, b) => a.computedRank - b.computedRank)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/rankings" className="inline-flex items-center gap-2 text-sm text-gray-100 hover:text-gray-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Rankings
      </Link>

      <div className="bg-gray-900 border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-8 h-8 text-amber-500 shrink-0" />
          <h1 className="text-3xl font-extrabold text-gray-100">{ranking.title}</h1>
        </div>
        
        {ranking.description && (
          <p className="text-gray-100 mb-6">{ranking.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-100 pb-6 border-b mb-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-gray-100">
              <User className="w-3.5 h-3.5 text-gray-100" /> Created by {authorName}
            </span>
            <span>•</span>
            <span>Published on {new Date(ranking.created_at).toLocaleDateString()}</span>
          </div>
          <span className="font-semibold text-gray-100">{totalListVotes} Total Votes Cast</span>
        </div>

        <RankingVotingForm 
          rankingId={ranking.id} 
          items={sortedItems} 
          voteCounts={voteStats} 
        />
      </div>
    </div>
  )
}