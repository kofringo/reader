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

  const { data: novel } = await supabase
    .from('novels')
    .select('id, title')
    .eq('slug', slug)
    .single()

  if (!novel) {
    return { title: 'Chapter Reader' }
  }

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

  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select('id')
    .eq('slug', slug)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const novelId = novel.id

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('novel_id', novelId)
    .eq('chapter_number', currentChapterNum)
    .single()

  if (error || !chapter) {
    notFound()
  }

  await supabase.rpc('increment_novel_views', { row_id: novelId })

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
    <div className="flex flex-col items-center">
      <ReaderView
        novelSlug={slug}
        chapter={chapter}
        prevChapterNum={prevChapter?.chapter_number}
        nextChapterNum={nextChapter?.chapter_number}
      />
    </div>
  )
}