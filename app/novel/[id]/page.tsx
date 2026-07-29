import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContinueReadingButton from '@/components/ContinueReadingButton'
import BookmarkButton from '@/components/BookmarkButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NovelDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch novel details including genre, author, cover, and summary
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('*')
    .eq('id', id)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  // Fetch all chapters for this novel
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title')
    .eq('novel_id', id)
    .order('chapter_number', { ascending: true })

  // Parse genre string into an array
  const genreList = novel.genre
    ? novel.genre.split(',').map((g: string) => g.trim())
    : []

  const firstChapterNum = chapters && chapters.length > 0 ? chapters[0].chapter_number : 1

  return (
    <main className="max-w-5xl mx-auto p-6">
      <Link
        href="/"
        className="text-blue-400 hover:underline text-sm mb-6 inline-block font-semibold"
      >
        ← Back to All Novels
      </Link>

      {/* Novel Header Details Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 shadow-xl flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        {novel.cover_url && (
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden border border-gray-700 shadow-md">
            <img
              src={novel.cover_url}
              alt={novel.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Novel Metadata */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            {novel.title}
          </h1>

          <p className="text-gray-400 font-medium mb-4">
            Author: <span className="text-gray-100">{novel.author || 'Unknown'}</span>
          </p>

          {/* Genre Badges (Clickable Links) */}
          {genreList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {genreList.map((g: string, idx: number) => (
                <Link
                  key={idx}
                  href={`/?genre=${encodeURIComponent(g)}`}
                  className="px-3 py-1 bg-blue-950/80 hover:bg-blue-900 text-gray-100 border border-blue-800/50 hover:border-blue-500 text-xs font-semibold rounded-full"
                >
                  🏷️ {g}
                </Link>
              ))}
            </div>
          )}

          {/* Summary Box */}
          {novel.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-100 mb-2">
                Summary
              </h3>
              <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-line bg-gray-900 p-4 rounded-lg border border-gray-800">
                {novel.summary}
              </p>
            </div>
          )}

          {/* Reading & Bookmark Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <ContinueReadingButton novelId={id} firstChapterNum={firstChapterNum} />
            <BookmarkButton novelId={id} />
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
          <span>📑</span> CHAPTER LIST
        </h2>

        {chapters && chapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {chapters.map((chap) => (
              <Link
                key={chap.id}
                href={`/novel/${id}/${chap.chapter_number}`}
                className="py-2.5 px-3 bg-transparent hover:bg-gray-800/50 border-b border-dashed border-gray-800 text-xs md:text-sm text-gray-100 font-normal flex items-center justify-between group transition"
              >
                <span className="truncate pr-2">
                  <span className="text-gray-100 mr-2">■</span>
                  {chap.title}
                </span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition text-xs shrink-0">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-100 italic text-sm">No chapters available yet.</p>
        )}
      </div>
    </main>
  )
}