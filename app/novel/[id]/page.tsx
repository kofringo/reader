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

  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('*')
    .eq('id', id)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title')
    .eq('novel_id', id)
    .order('chapter_number', { ascending: true })

  const genreList = novel.genre
    ? novel.genre.split(',').map((g: string) => g.trim())
    : []

  const firstChapterNum = chapters && chapters.length > 0 ? chapters[0].chapter_number : 1

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white dark:bg-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-200 transition-colors duration-200">
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block font-semibold"
      >
        ← Back to All Novels
      </Link>

      {/* Main Details Panel */}
      {/* Main Details Panel */}
      <div className="bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-6">
        {/* Cover Image */}
        {novel.cover_url && (
          <div className="w-44 h-64 flex-shrink-0 mx-auto md:mx-0 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
            <img
              src={novel.cover_url}
              alt={novel.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}

        {/* Metadata Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {novel.title}
            </h1>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
              <p>Author: <span className="text-gray-900 dark:text-gray-200 font-medium">{novel.author || 'Unknown'}</span></p>
              {genreList.length > 0 && (
                <p>Genres: <span className="text-blue-600 dark:text-blue-400 font-medium">{genreList.join(', ')}</span></p>
              )}
            </div>

            {/* Summary */}
            {novel.summary && (
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#1a1a1a] p-3.5 rounded border border-gray-200 dark:border-gray-700 mb-6">
                {novel.summary}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="[&>button]:bg-red-600 [&>button]:hover:bg-red-500 [&>button]:text-white [&>button]:px-4 [&>button]:py-2 [&>button]:rounded [&>button]:text-sm [&>button]:font-bold [&>button]:shadow-sm">
              <ContinueReadingButton novelId={id} firstChapterNum={firstChapterNum} />
            </div>
            <div className="[&>button]:bg-amber-500 [&>button]:hover:bg-amber-400 [&>button]:text-white [&>button]:px-4 [&>button]:py-2 [&>button]:rounded [&>button]:text-sm [&>button]:font-bold [&>button]:shadow-sm">
              <BookmarkButton novelId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      <div className="bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-2">
            <span>📑</span> CHAPTER LIST
          </h2>
        </div>

        {chapters && chapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {chapters.map((chap) => (
              <Link
                key={chap.id}
                href={`/novel/${id}/${chap.chapter_number}`}
                className="py-3 px-3 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded shadow-sm flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Chapter Number Badge on the Left */}
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-10 text-right shrink-0">
                    {chap.chapter_number}
                  </span>

                  {/* Title and Timestamp */}
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs md:text-sm text-gray-800 dark:text-gray-200 font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {chap.title}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      800 days ago
                    </span>
                  </div>
                </div>

                <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition text-xs shrink-0 pl-2">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic text-sm">No chapters available yet.</p>
        )}
      </div>
    </main>
  )
}