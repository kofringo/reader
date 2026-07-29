'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  novelId: string
  firstChapterNum: number
}

export default function ContinueReadingButton({ novelId, firstChapterNum }: Props) {
  const [savedChapter, setSavedChapter] = useState<number | null>(null)
  const router = useRouter()

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
    <button
      onClick={() => router.push(`/novel/${novelId}/${targetChapter}`)}
      className="px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 bg-red-800 hover:bg-gray-700 text-gray-200 shadow-md"
    >
      <span>📖</span>
      <span>
        {savedChapter ? `Continue Reading (Chapter ${savedChapter})` : `Start Reading (Chapter ${firstChapterNum})`}
      </span>
    </button>
  )
}