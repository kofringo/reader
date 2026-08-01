export default function ContactPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center">
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