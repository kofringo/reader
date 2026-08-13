'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Comment {
  id: string
  content: string
  created_at: string
  is_spoiler: boolean
  user_id: string
  profiles?: {
    username?: string
    full_name?: string
  }
}

interface NovelCommentsProps {
  novelId: string
}

// Helper function for relative time (e.g., "8 months ago")
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return `${Math.floor(interval)} years ago`
  
  interval = seconds / 2592000
  if (interval > 1) return `${Math.floor(interval)} months ago`
  
  interval = seconds / 86400
  if (interval > 1) return `${Math.floor(interval)} days ago`
  
  interval = seconds / 3600
  if (interval > 1) return `${Math.floor(interval)} hours ago`
  
  interval = seconds / 60
  if (interval > 1) return `${Math.floor(interval)} minutes ago`
  
  return 'Just now'
}

export default function NovelComments({ novelId }: NovelCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndComments = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setUser(session.user)

      setLoading(true)
      // Fetch comments and join with the public profiles table using user_id
      const { data, error } = await supabase
        .from('novel_comments')
        .select(`
          *,
          profiles:user_id (username, full_name)
        `)
        .eq('novel_id', novelId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setComments(data as unknown as Comment[])
      }
      setLoading(false)
    }

    fetchUserAndComments()
  }, [novelId, supabase])

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('novel_comments')
      .insert([
        {
          novel_id: novelId,
          user_id: user.id,
          content: newComment.trim(),
          is_spoiler: isSpoiler,
        }
      ])
      .select(`
        *,
        profiles:user_id (username, full_name)
      `)

    if (!error && data) {
      setComments([data[0] as unknown as Comment, ...comments])
      setNewComment('')
      setIsSpoiler(false)
    } else {
      alert(error?.message || 'Error posting comment')
    }
    setSubmitting(false)
  }

  return (
    <div className="mt-12 text-gray-200">
      <div className="flex justify-between items-center border-b border-gray-700/60 pb-3 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
          💬 COMMENTS
        </h3>
        
      </div>

      {/* Comment Input Box */}
      {user ? (
        <form onSubmit={handlePostComment} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 shadow-md">
          <textarea
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this novel."
            className="w-full bg-black/40 border border-gray-800 rounded p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none mb-3"
            required
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded bg-black border-gray-700 text-blue-600 focus:ring-0"
              />
              Spoiler
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded text-xs uppercase tracking-wider transition disabled:opacity-50 shadow"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 text-center text-sm text-gray-400">
          Please <a href="/auth" className="text-blue-400 underline font-semibold">sign in</a> to share your thoughts on this novel.
        </div>
      )}

      {/* Comments List Header */}
      <div className="flex justify-between items-center mb-4 text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2">
        <span>{comments.length} Comments</span>
        
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const username = comment.profiles?.username || comment.profiles?.full_name || 'Reader'
            return (
              <div key={comment.id} className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center font-bold text-xs uppercase text-white">
                    {username[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{username}</span>
                    <span className="text-[10px] text-gray-100 block">
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm text-gray-300 pl-11 whitespace-pre-line ${comment.is_spoiler ? 'bg-gray-800 p-2 rounded blur-sm hover:blur-none transition cursor-pointer' : ''}`}>
                  {comment.is_spoiler ? '[Spoiler] ' : ''}{comment.content}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-gray-100 border border-dashed border-gray-900 rounded-lg">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  )
}