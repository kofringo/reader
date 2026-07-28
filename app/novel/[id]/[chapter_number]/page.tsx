import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReaderView from '@/components/ReaderView'

interface PageProps {
  params: Promise<{ id: string; chapter_number: string }>
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { id, chapter_number } = await params
  const currentChapterNum = parseInt(chapter_number, 10)
  const supabase = await createClient()

  // Fetch Current Chapter
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('novel_id', id)
    .eq('chapter_number', currentChapterNum)
    .single()

  if (error || !chapter) {
    notFound()
  }

  // Check Prev / Next chapters
  const { data: prevChapter } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('novel_id', id)
    .eq('chapter_number', currentChapterNum - 1)
    .single()

  const { data: nextChapter } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('novel_id', id)
    .eq('chapter_number', currentChapterNum + 1)
    .single()

  return (
    <ReaderView
      novelId={id}
      chapter={chapter}
      prevChapterNum={prevChapter?.chapter_number}
      nextChapterNum={nextChapter?.chapter_number}
    />
  )
}