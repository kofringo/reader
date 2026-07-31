import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 pt-8 mt-12 pb-6 text-blue-500 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 max-w-7xl mx-auto text-center">
        <div>
          <h3 className="text-red-500 font-extrabold text-base mb-2">Web Novel Reader</h3>
          <p className="text-[11px] text-gray-500">&copy; 2026 Web Novel Reader</p>
        </div>
        <div className="space-y-2">
          <Link href="/popular" className="block hover:text-white transition">&gt; Most Popular</Link>
          <Link href="/genre" className="block hover:text-white transition">&gt; Genres</Link>
          <Link href="/new" className="block hover:text-white transition">&gt; Recent Novels</Link>
        </div>
        
        <div className="space-y-2">
          <Link href="#" className="block hover:text-white transition">&gt; Privacy Policy</Link>
          <Link href="#" className="block hover:text-white transition">&gt; Terms of Service</Link>
          <Link href="#" className="block hover:text-white transition">&gt; Contact Us</Link>
        </div>
      </div>
    </footer>
  )
}