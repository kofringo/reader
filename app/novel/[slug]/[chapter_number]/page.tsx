import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReaderView from '@/components/ReaderView'
import ChapterComments from '@/components/ChapterComments'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string; chapter_number: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // Single join query for rich chapter and novel metadata[cite: 6, 8]
  const { data } = await supabase
    .from('chapters')
    .select(`
      title,
      novels!inner (
        title,
        slug
      )
    `)
    .eq('novels.slug', slug)
    .eq('chapter_number', currentChapterNum)
    .single()

  const novel = Array.isArray(data?.novels) ? data?.novels[0] : data?.novels

  if (!data || !novel) {
    return {
      title: `Chapter ${currentChapterNum} - Read Online`,
    }
  }

  const siteName = 'Web Novel Reader'
  const chapterTitle = data.title || `Chapter ${currentChapterNum}`
  const pageTitle = `${chapterTitle} - ${novel.title} Free Online | ${siteName}`
  const description = `Read ${novel.title} - ${chapterTitle} online for free. Explore more chapters and light novels on ${siteName}.`

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      url: `https://www.webnovelreader.com/novel/${slug}/${currentChapterNum}`,
      siteName: siteName,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: description,
    },
  }
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // 1. Fetch novel ID and title securely using slug[cite: 6, 8]
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('id, title')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const novelId = novel.id

  // 2. Fetch current chapter, prev chapter, next chapter, and user auth concurrently[cite: 6, 8]
  const [chapterResQuery, prevChapterRes, nextChapterRes, authRes] = await Promise.all([
    supabase.from('chapters').select('*').eq('novel_id', novelId).eq('chapter_number', currentChapterNum).single(),
    supabase.from('chapters').select('chapter_number').eq('novel_id', novelId).eq('chapter_number', currentChapterNum - 1).maybeSingle(),
    supabase.from('chapters').select('chapter_number').eq('novel_id', novelId).eq('chapter_number', currentChapterNum + 1).maybeSingle(),
    supabase.auth.getUser()
  ])

  const { data: chapter, error } = chapterResQuery
  if (error || !chapter) {
    notFound()
  }

  // 3. Fire-and-forget background analytics/history updates[cite: 6, 8]
  const user = authRes.data.user
  const backgroundTasks = [
    supabase.rpc('increment_novel_views', { row_id: novelId })
  ]

  if (user) {
    backgroundTasks.push(
      supabase.from('user_history').upsert({
        user_id: user.id,
        novel_id: novelId,
        chapter_id: chapter.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,novel_id,chapter_id' }) as any
    )
  }

  Promise.all(backgroundTasks).catch((err) => console.error('Background task error:', err))

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl flex flex-col px-4 py-6 space-y-8">
        <ReaderView
          novelSlug={slug}
          novelTitle={novel.title}
          chapter={chapter}
          prevChapterNum={prevChapterRes.data?.chapter_number}
          nextChapterNum={nextChapterRes.data?.chapter_number}
        />

        {/* Chapter Comments Section */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <ChapterComments chapterId={chapter.id} />
        </div>
      </div>
    </div>
  )
}