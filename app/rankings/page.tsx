import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Crown, PlusCircle, User, Calendar } from 'lucide-react'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function RankingsPage() {
  cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch rankings including the slug column
  const { data: rankings, error } = await supabase
    .from('user_rankings')
    .select(`
      id,
      title,
      description,
      slug,
      created_at,
      created_by
    `)
    .order('created_at', { ascending: false })

  // Fetch profiles separately to safely map creator names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')

  const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-100">
            <Crown className="w-8 h-8 text-gray-100" /> Community Rankings
          </h1>
          <p className="text-gray-100 mt-1">Explore custom novel lists curated and voted on by readers.</p>
        </div>
        
        <Link 
          href="/rankings/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <PlusCircle className="w-5 h-5" /> Create Ranking
        </Link>
      </div>

      <div className="grid gap-4">
        {rankings?.map((list: any) => {
          const authorName = profileMap.get(list.created_by) || 'Anonymous Reader'
          return (
            <Link 
              key={list.id} 
              href={`/rankings/${list.slug}`}
              className="bg-gray-900 border border-gray-200 hover:border-blue-500 rounded-2xl p-6 shadow-sm transition block group"
            >
              <h2 className="text-xl font-bold text-gray-100 group-hover:text-blue-600 transition mb-1">
                {list.title}
              </h2>
              {list.description && (
                <p className="text-gray-100 text-sm mb-4 line-clamp-2">{list.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-100 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1 font-medium text-gray-100">
                  <User className="w-3.5 h-3.5 text-gray-100" /> By {authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-100" /> {new Date(list.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          )
        })}

        {(!rankings || rankings.length === 0) && (
          <p className="text-center text-gray-500 py-12">No custom rankings found yet. Be the first to create one!</p>
        )}
      </div>
    </div>
  )
}