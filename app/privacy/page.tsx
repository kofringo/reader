import type { Metadata } from "next";
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy Policy - Web Novel Reader",
  description: "Read the Privacy Policy of Web Novel Reader to understand how we collect, use, and protect your personal data and browsing information.",
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center">
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
        <span className="text-gray-400">Privacy Policy</span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-100 mb-6">Last updated: August 1, 2026</p>
        
        <div className="space-y-4 text-gray-100 text-sm leading-relaxed">
          <p>
            Welcome to Web Novel Reader. We respect your privacy and are deeply committed to protecting any personal data you share with us. This comprehensive privacy policy outlines how we collect, utilize, safeguard, and handle your information whenever you browse our website, read light novels, or use our interactive features.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">1. Information We Collect</h2>
          <p>
            When you visit Web Novel Reader, our servers automatically log basic technical data. This may include your device&apos;s Internet Protocol (IP) address, browser version, operating system type, page navigation paths, timestamps, and aggregate usage data regarding how you discover and interact with our web novel library.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">2. How We Use Your Information</h2>
          <p>
            The information and analytics we collect are utilized exclusively to maintain, secure, and continuously improve our digital reading platform. We use this data to diagnose performance issues, prevent abuse, ensure smooth chapter loading speeds, and optimize user experience across all devices.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">3. Cookies and External Links</h2>
          <p>
            Our website may use standard cookies or local storage preferences to remember your reading settings. Additionally, our platform may contain links to external third-party sites or partner resources over which we hold no direct operational control. We encourage you to review the individual privacy statements of any external websites you visit.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">4. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled on our platform, please feel free to reach out to our administration team directly at  {' '}
            <a 
              href="mailto:wnreader8@gmail.com" 
              className="text-blue-400 font-semibold hover:underline"
            >
              wnreader8@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </main>
  )
}