import { createClient } from '@/lib/supabase/server'
import NovelList from '@/components/NovelList'
import { Suspense } from 'react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: novels, error } = await supabase.from('novels').select('*')

  if (error) {
    return (
      <div className="p-8 text-red-500 font-mono max-w-6xl mx-auto">
        ✕ Error connecting to database: {error.message}
      </div>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <Suspense fallback={<div className="text-gray-400">Loading novels...</div>}>
        <NovelList initialNovels={novels || []} />
      </Suspense>
    </main>
  )
}