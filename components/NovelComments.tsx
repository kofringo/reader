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
    avatar_url?: string
  } | { username?: string; full_name?: string; avatar_url?: string }[]
}

interface NovelCommentsProps {
  novelId: string
}

const POPULAR_STICKERS = [
  '/stickers/4742-pika-luffy-face.webp',
  '/stickers/ZeroTwoFightMe.webp',
  '/stickers/4352_DiCaprioLaugh.webp',
  '/stickers/PeepoSignbruh.webp',
  '/stickers/laugh_naruto.webp',
  '/stickers/crying-pepe-1024x1024-1.jpg',
  '/stickers/anime_boy_serious.webp',
  '/stickers/owoembarrassed.webp',
  '/stickers/2810-schoolgirlgod.webp',
  '/stickers/7730-towapanikboom.gif',
  '/stickers/9184-im-out.webp',
  '/stickers/ezgif-4-4c8e538c86.gif',
  '/stickers/1514-gendo-hmm.webp',
  '/stickers/2_Anime_Saitama_OK.webp',
  '/stickers/8c003218-41ff-47e2-9be4-45886b598348-1-min.gif',
  '/stickers/ezgif-4-4c8e538c86.gif',
  '/stickers/ZeroTwo_Heart.webp',
  '/stickers/988425-ohmygod.gif',
  '/stickers/16794-jhu.gif',
  '/stickers/668887-afrogisreadingabook.png',
  '/stickers/veryPog.webp',
  '/stickers/ZeroTwo1.webp',
]

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

  // Sticker picker states
  const [showStickers, setShowStickers] = useState(false)
  const [replyingStickersOpen, setReplyingStickersOpen] = useState<string | null>(null)

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
          profiles:user_id (username, full_name, avatar_url)
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

  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null, customContent?: string, customSpoiler?: boolean) => {
    if (e) e.preventDefault()
    const content = customContent !== undefined ? customContent : (parentId ? replyContent : newComment)
    const spoiler = customSpoiler !== undefined ? customSpoiler : (parentId ? replyIsSpoiler : isSpoiler)

    if (!content.trim() || !user) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('novel_comments')
      .insert([
        {
          novel_id: novelId,
          user_id: user.id,
          content: content.trim(),
          is_spoiler: spoiler,
          parent_id: parentId,
        }
      ])
      .select(`
        *,
        profiles:user_id (username, full_name, avatar_url)
      `)

    if (!error && data) {
      setComments([data[0] as unknown as Comment, ...comments])
      if (parentId) {
        setReplyingToId(null)
        setReplyContent('')
        setReplyIsSpoiler(false)
        setReplyingStickersOpen(null)
      } else {
        setNewComment('')
        setIsSpoiler(false)
        setShowStickers(false)
      }
    } else {
      alert(error?.message || 'Error posting comment')
    }
    setSubmitting(false)
  }

  const handleSelectSticker = (url: string, parentId: string | null = null) => {
    const stickerMarkdown = `![sticker](${url})`
    if (parentId) {
      handlePostComment({ preventDefault: () => {} } as React.FormEvent, parentId, stickerMarkdown, replyIsSpoiler)
    } else {
      handlePostComment({ preventDefault: () => {} } as React.FormEvent, null, stickerMarkdown, isSpoiler)
    }
  }

  const renderCommentContent = (content: string, isSpoilerField: boolean) => {
    const stickerRegex = /^!\[sticker\]\((.+)\)$/
    const match = content.trim().match(stickerRegex)

    if (match) {
      const stickerUrl = match[1]
      return (
        <div className="pl-11 mt-1">
          <img 
            src={stickerUrl} 
            alt="sticker" 
            className="w-28 h-28 object-contain rounded-lg border border-gray-800 bg-black/20" 
          />
        </div>
      )
    }

    return (
      <p className={`text-sm text-gray-100 pl-11 whitespace-pre-line ${isSpoilerField ? 'bg-gray-900 p-2 rounded blur-sm hover:blur-none transition cursor-pointer' : ''}`}>
        {isSpoilerField ? '[Spoiler] ' : ''}{content}
      </p>
    )
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
        <form onSubmit={(e) => handlePostComment(e, null)} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 shadow-md relative">
          <textarea
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this novel."
            className="w-full bg-black/40 border border-gray-800 rounded p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none mb-3"
            required
          />

          {/* Sticker Picker Popup for Main Form */}
          {showStickers && (
            <div className="absolute left-4 bottom-16 z-50 w-72 bg-gray-950 border border-gray-800 rounded-lg shadow-2xl p-3 max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                <span className="text-xs font-bold text-gray-300">Choose a Sticker</span>
                <button 
                  type="button" 
                  onClick={() => setShowStickers(false)}
                  className="text-gray-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR_STICKERS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSticker(url, null)}
                    className="hover:bg-gray-800 p-1.5 rounded transition flex items-center justify-center border border-transparent hover:border-gray-700"
                  >
                    <img src={url} alt="sticker" className="w-12 h-12 object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="rounded bg-black border-gray-700 text-blue-600 focus:ring-0"
                />
                Spoiler
              </label>

              {/* Sticker Toggle Button */}
              <button
                type="button"
                onClick={() => setShowStickers(!showStickers)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-amber-400 px-3 py-1.5 rounded border border-gray-700 transition font-semibold flex items-center gap-1.5 shadow"
              >
                😀 Stickers
              </button>
            </div>

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
            const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
            const username = profile?.username || profile?.full_name || 'Reader'
            const replies = getReplies(comment.id)
            const isLiked = likedCommentIds.has(comment.id)

            return (
              <div key={comment.id} className="bg-gray-900 border border-gray-800/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-700 flex items-center justify-center font-bold text-xs uppercase text-white flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        username[0]
                      )}
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

                {renderCommentContent(comment.content, comment.is_spoiler)}

                <div className="pl-11 mt-2">
                  <button
                    onClick={() => {
                      setReplyingToId(replyingToId === comment.id ? null : comment.id)
                      setReplyContent('')
                      setReplyingStickersOpen(null)
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Input Form */}
                {replyingToId === comment.id && user && (
                  <form onSubmit={(e) => handlePostComment(e, comment.id)} className="mt-3 ml-11 bg-gray-900 border border-gray-800 rounded-lg p-3 relative">
                    <textarea
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Share your thoughts."
                      className="w-full bg-black/60 border border-gray-800 rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500 resize-none mb-2"
                      required
                    />

                    {/* Sticker Picker Popup for Reply Form */}
                    {replyingStickersOpen === comment.id && (
                      <div className="absolute left-3 bottom-14 z-50 w-72 bg-gray-950 border border-gray-800 rounded-lg shadow-2xl p-3 max-h-60 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                          <span className="text-xs font-bold text-gray-300">Choose a Sticker</span>
                          <button 
                            type="button" 
                            onClick={() => setReplyingStickersOpen(null)}
                            className="text-gray-400 hover:text-white text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {POPULAR_STICKERS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSticker(url, comment.id)}
                              className="hover:bg-gray-800 p-1.5 rounded transition flex items-center justify-center border border-transparent hover:border-gray-700"
                            >
                              <img src={url} alt="sticker" className="w-12 h-12 object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
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
                          type="button"
                          onClick={() => setReplyingStickersOpen(replyingStickersOpen === comment.id ? null : comment.id)}
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-amber-400 px-2.5 py-1 rounded border border-gray-700 transition font-semibold flex items-center gap-1 shadow"
                        >
                          😀 Stickers
                        </button>
                      </div>

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
                  <div className="ml-8 mt-3 space-y-3  pl-4">
                    {replies.map((reply) => {
                      const replyProfile = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles
                      const replyUsername = replyProfile?.username || replyProfile?.full_name || 'Reader'
                      const isReplyLiked = likedCommentIds.has(reply.id)

                      return (
                        <div key={reply.id} className="bg-gray-900 border border-gray-900 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center font-bold text-[10px] uppercase text-white flex-shrink-0">
                                {replyProfile?.avatar_url ? (
                                  <img src={replyProfile.avatar_url} alt={replyUsername} className="w-full h-full object-cover" />
                                ) : (
                                  replyUsername[0]
                                )}
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
                          {renderCommentContent(reply.content, reply.is_spoiler)}
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