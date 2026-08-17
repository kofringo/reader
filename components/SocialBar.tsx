'use client'

import { useEffect } from 'react'

export default function SocialBar() {
  useEffect(() => {
    const scriptId = 'adsterra-social-bar'
    
    // If the script is already loaded anywhere in the DOM, don't duplicate it
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://behavecurlescalator.com/2f/d2/8b/2fd28be4c1e7ea427fdac80b69fc0222.js'

    document.body.appendChild(script)

    // ❌ REMOVE any return cleanup function here so the script stays active while reading chapters
  }, [])

  return null
}