'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookmarkButtonProps {
  novelId: string
}

export default function BookmarkButton({ novelId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('user_library')
          .select('id')
          .eq('user_id', user.id)
          .eq('novel_id', novelId)
          .single()

        if (data) setIsBookmarked(true)
      }
      setLoading(false)
    }
    checkStatus()
  }, [novelId, supabase])

  const toggleBookmark = async () => {
    if (!userId) {
      router.push('/auth')
      return
    }

    setLoading(true)

    if (isBookmarked) {
      await supabase
        .from('user_library')
        .delete()
        .eq('user_id', userId)
        .eq('novel_id', novelId)
      setIsBookmarked(false)
    } else {
      await supabase
        .from('user_library')
        .insert({ user_id: userId, novel_id: novelId })
      setIsBookmarked(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
        isBookmarked
          ? 'bg-amber-600 hover:bg-amber-500 text-white'
          : 'bg-blue-600 hover:bg-gray-700 text-gray-200 border border-gray-700'
      }`}
    >
      <span>{isBookmarked ? '★ Bookmarked' : '☆ Add to Library'}</span>
    </button>
  )
}