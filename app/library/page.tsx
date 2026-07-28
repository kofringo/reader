import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch bookmarked novels via user_library
  const { data: libraryItems } = await supabase
    .from('user_library')
    .select('novel_id, novels(*)')
    .eq('user_id', user.id)

  const novels = libraryItems ? libraryItems.map(item => item.novels) : []

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <Link href="/" className="text-blue-400 hover:underline text-sm font-semibold mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-white">📚 My Library</h1>
        </div>
      </div>

      {novels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {novels.map((novel: any) => (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
              className="group flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-200 shadow-lg"
            >
              <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden flex items-center justify-center">
                {novel.cover_url ? (
                  <img
                    src={novel.cover_url}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500 text-xs font-bold uppercase">No Cover</div>
                )}
              </div>
              <div className="p-3.5 flex flex-col flex-grow">
                <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-blue-400 transition">
                  {novel.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
          <p className="text-gray-400 font-medium">Your library is currently empty.</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
            Browse Novels
          </Link>
        </div>
      )}
    </main>
  )
}