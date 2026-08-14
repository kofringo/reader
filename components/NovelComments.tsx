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
  parent_id: string | null
  likes_count: number
  profiles?: {
    username?: string
    full_name?: string
  }
}

interface NovelCommentsProps {
  novelId: string
}

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

  // Reply tracking state
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyIsSpoiler, setReplyIsSpoiler] = useState(false)

  // Track which comments current user liked
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    const fetchUserDataAndComments = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        // Fetch user's likes
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', session.user.id)
        
        if (likesData) {
          setLikedCommentIds(new Set(likesData.map(l => l.comment_id)))
        }
      }

      setLoading(true)
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

    fetchUserDataAndComments()
  }, [novelId, supabase])

  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    const content = parentId ? replyContent : newComment
    if (!content.trim() || !user) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('novel_comments')
      .insert([
        {
          novel_id: novelId,
          user_id: user.id,
          content: content.trim(),
          is_spoiler: parentId ? replyIsSpoiler : isSpoiler,
          parent_id: parentId,
        }
      ])
      .select(`
        *,
        profiles:user_id (username, full_name)
      `)

    if (!error && data) {
      setComments([data[0] as unknown as Comment, ...comments])
      if (parentId) {
        setReplyingToId(null)
        setReplyContent('')
        setReplyIsSpoiler(false)
      } else {
        setNewComment('')
        setIsSpoiler(false)
      }
    } else {
      alert(error?.message || 'Error posting comment')
    }
    setSubmitting(false)
  }

  const handleLike = async (commentId: string) => {
    if (!user) {
      alert('Please sign in to like comments.')
      return
    }

    const hasLiked = likedCommentIds.has(commentId)
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    const newLikesCount = hasLiked ? Math.max(0, comment.likes_count - 1) : comment.likes_count + 1

    // Optimistic UI update
    setComments(comments.map(c => c.id === commentId ? { ...c, likes_count: newLikesCount } : c))
    const updatedLikes = new Set(likedCommentIds)
    if (hasLiked) {
      updatedLikes.delete(commentId)
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
    } else {
      updatedLikes.add(commentId)
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
    }
    setLikedCommentIds(updatedLikes)

    await supabase.from('novel_comments').update({ likes_count: newLikesCount }).eq('id', commentId)
  }

  // Separate top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parent_id)
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  return (
    <div className="mt-12 text-gray-200">
      <div className="flex justify-between items-center border-b border-gray-700/60 pb-3 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
          💬 COMMENTS
        </h3>
      </div>

      {/* Main Comment Input Box */}
      {user ? (
        <form onSubmit={(e) => handlePostComment(e, null)} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 shadow-md">
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
      ) : topLevelComments.length > 0 ? (
        <div className="space-y-4">
          {topLevelComments.map((comment) => {
            const username = comment.profiles?.username || comment.profiles?.full_name || 'Reader'
            const replies = getReplies(comment.id)
            const isLiked = likedCommentIds.has(comment.id)

            return (
              <div key={comment.id} className="bg-gray-900 border border-gray-800/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
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

                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${isLiked ? 'text-blue-400 bg-gray-900' : 'text-gray-400 hover:text-white'}`}
                  >
                    👍 {comment.likes_count || 0}
                  </button>
                </div>

                <p className={`text-sm text-gray-100 pl-11 whitespace-pre-line ${comment.is_spoiler ? 'bg-gray-900 p-2 rounded blur-sm hover:blur-none transition cursor-pointer' : ''}`}>
                  {comment.is_spoiler ? '[Spoiler] ' : ''}{comment.content}
                </p>

                <div className="pl-11 mt-2">
                  <button
                    onClick={() => {
                      setReplyingToId(replyingToId === comment.id ? null : comment.id)
                      setReplyContent('')
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Input Form */}
                {replyingToId === comment.id && user && (
                  <form onSubmit={(e) => handlePostComment(e, comment.id)} className="mt-3 ml-11 bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <textarea
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Share your thoughts."
                      className="w-full bg-black/60 border border-gray-800 rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500 resize-none mb-2"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={replyIsSpoiler}
                          onChange={(e) => setReplyIsSpoiler(e.target.checked)}
                          className="rounded bg-black border-gray-700 text-blue-600 focus:ring-0"
                        />
                        Spoiler
                      </label>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded text-[10px] uppercase tracking-wider transition disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Nested Replies Rendering */}
                {replies.length > 0 && (
                  <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-800 pl-4">
                    {replies.map((reply) => {
                      const replyUsername = reply.profiles?.username || reply.profiles?.full_name || 'Reader'
                      const isReplyLiked = likedCommentIds.has(reply.id)

                      return (
                        <div key={reply.id} className="bg-gray-900 border border-gray-900 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center font-bold text-[10px] uppercase text-white">
                                {replyUsername[0]}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white">{replyUsername}</span>
                                <span className="text-[9px] text-gray-100 block">
                                  {timeAgo(reply.created_at)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLike(reply.id)}
                              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition ${isReplyLiked ? 'text-blue-400 bg-gray-900' : 'text-gray-400 hover:text-white'}`}
                            >
                              👍 {reply.likes_count || 0}
                            </button>
                          </div>
                          <p className={`text-xs text-gray-100 pl-8 whitespace-pre-line ${reply.is_spoiler ? 'bg-gray-900 p-1.5 rounded blur-sm hover:blur-none transition cursor-pointer' : ''}`}>
                            {reply.is_spoiler ? '[Spoiler] ' : ''}{reply.content}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-800 rounded-lg">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  )
}