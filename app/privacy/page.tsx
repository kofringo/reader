import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};


export default function PrivacyPolicyPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-black text-white mb-4">Privacy Policy</h1>
        
        <div className="space-y-4 text-gray-100 text-sm leading-relaxed">
          <p>
            Last updated: August 1, 2026
          </p>

          <p>
            Welcome to Web Novel Reader. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you visit our website.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">1. Information We Collect</h2>
          <p>
            We may collect technical data such as your IP address, browser type, device information, and usage data regarding how you interact with our novels and pages.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">2. How We Use Your Information</h2>
          <p>
            The information we collect is used solely to maintain, secure, and improve our reading service and user experience.
          </p>

          <h2 className="text-lg font-bold text-white pt-2">3. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, feel free to reach out to us at{' '}
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