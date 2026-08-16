import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReaderView from '@/components/ReaderView'

interface PageProps {
  params: Promise<{ slug: string; chapter_number: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // Single join query for metadata instead of multiple lookups
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

  return {
    title: data?.title && novel?.title ? `${data.title} - ${novel.title}` : `Chapter ${currentChapterNum}`,
  }
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // 1. Fetch novel and current chapter in parallel to cut down wait times
  const [novelRes, chapterRes] = await Promise.all([
    supabase.from('novels').select('id').eq('slug', slug).single(),
    supabase.from('chapters').select('*').eq('novels.slug', slug).eq('chapter_number', currentChapterNum).single() // Note: handled via separate query below if needed, let's keep it safe:
  ])

  // Proper optimized fetch sequence using foreign keys/joins
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('id')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const novelId = novel.id

  // 2. Fetch current chapter, prev chapter, and next chapter concurrently
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

  // 3. Fire-and-forget background analytics/history updates so they don't block the page response
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

  // Execute background tasks asynchronously without blocking the render return
  Promise.all(backgroundTasks).catch((err) => console.error('Background task error:', err))

  return (
    <div className="flex flex-col items-center">
      <ReaderView
        novelSlug={slug}
        chapter={chapter}
        prevChapterNum={prevChapterRes.data?.chapter_number}
        nextChapterNum={nextChapterRes.data?.chapter_number}
      />
    </div>
  )
}