import type { Metadata } from "next";
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Contact Us - Web Novel Reader",
  description: "Get in touch with Web Novel Reader. Reach out to us via email for inquiries, feedback, copyright issues, or suggestions regarding our web novel library.",
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col">
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
            Welcome to Web Novel Reader. If you require any more information, have general questions, content suggestions, or need to report a copyright concern regarding any of the translated light novels hosted on our platform, please feel free to reach out to us.
          </p>

          <p>
            We value feedback from our readers and strive to respond to all valid inquiries as quickly as possible. You can contact our support team directly via electronic mail at:
          </p>
          
          <div className="p-4 flex flex-row items-center gap-3 w-fit">
            <svg 
              className="w-5 h-5 text-blue-400 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <a 
              href="mailto:wnreader8@gmail.com" 
              className="text-blue-400 font-bold hover:underline text-base"
            >
              wnreader8@gmail.com
            </a>
          </div>

          <div className="pt-4 border-t border-gray-800/80 mt-6">
            <h2 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">Guidelines for Messaging</h2>
            <ul className="list-disc list-inside text-gray-100 space-y-1.5 text-xs">
              <li>Please include relevant details, URLs, or chapter numbers if you are reporting a broken link or translation error.</li>
              <li>For copyright removal requests, please provide official verification details so our team can process your notice promptly.</li>
              <li>Please avoid sending repetitive emails urging faster release schedules for ongoing translated chapters.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}