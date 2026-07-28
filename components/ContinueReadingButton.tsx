'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Props {
  novelId: string
  firstChapterNum: number
}

export default function ContinueReadingButton({ novelId, firstChapterNum }: Props) {
  const [savedChapter, setSavedChapter] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`novel_progress_${novelId}`)
      if (saved) {
        setSavedChapter(parseInt(saved, 10))
      }
    }
  }, [novelId])

  const targetChapter = savedChapter || firstChapterNum

  return (
    <div className="mt-4">
      <Link
        href={`/novel/${novelId}/${targetChapter}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md transition text-sm"
      >
        <span>📖</span>
        <span>
          {savedChapter ? `Continue Reading (Chapter ${savedChapter})` : 'Start Reading (Chapter 1)'}
        </span>
      </Link>
    </div>
  )
}