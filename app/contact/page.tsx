import type { Metadata } from "next";
import Link from 'next/link'
export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col ">
            {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-400 mb-4">
        <Link href="/" className="flex items-center gap-0.5 hover:text-blue-400 transition">
          <svg
            className="w-4.5 h-4.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Home</span>
        </Link>
        <span>›</span>
        <span className="text-gray-400">Contact</span>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-black text-white mb-4">Contact Us</h1>
        
        <div className="space-y-4 text-gray-100 text-sm leading-relaxed">
          <p>
            If you require any more information or have questions or suggestions, please feel free to contact us by email:
          </p>
          
          <p>
            <a 
              href="mailto:wnreader8@gmail.com" 
              className="text-blue-400 font-semibold hover:underline"
            >
              wnreader8@gmail.com
            </a>
          </p>

          <ul className="list-disc list-inside pt-4 text-gray-400 space-y-1">
           {/* <li>Please don&apos;t send emails to urge for updates.</li> */}
          </ul>
        </div>
      </div>
    </main>
  )
}