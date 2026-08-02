import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReaderView from '@/components/ReaderView'

interface PageProps {
  params: Promise<{ slug: string; chapter_number: string }>
}

// Generate dynamic browser tab title for the reader page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // Find novel by slug first to get its UUID
  const { data: novel } = await supabase
    .from('novels')
    .select('id, title')
    .eq('slug', slug)
    .single()

  if (!novel) {
    return { title: 'Chapter Reader' }
  }

  // Fetch the specific chapter title
  const { data: chapter } = await supabase
    .from('chapters')
    .select('title')
    .eq('novel_id', novel.id)
    .eq('chapter_number', currentChapterNum)
    .single()

  return {
    title: chapter?.title ? `${chapter.title} - ${novel.title}` : `Chapter ${currentChapterNum}`,
  }
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // 1. Fetch novel by slug to get its uuid
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('id')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const novelId = novel.id

  // 2. Fetch Current Chapter using novel_id
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('novel_id', novelId)
    .eq('chapter_number', currentChapterNum)
    .single()

  if (error || !chapter) {
    notFound()
  }

  // Automatically increment view count for this novel
  await supabase.rpc('increment_novel_views', { row_id: novelId })

  // Check Prev / Next chapters
  const { data: prevChapter } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('novel_id', novelId)
    .eq('chapter_number', currentChapterNum - 1)
    .single()

  const { data: nextChapter } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('novel_id', novelId)
    .eq('chapter_number', currentChapterNum + 1)
    .single()

  return (
    <ReaderView
      novelSlug={slug}
      chapter={chapter}
      prevChapterNum={prevChapter?.chapter_number}
      nextChapterNum={nextChapter?.chapter_number}
    />
  )
}