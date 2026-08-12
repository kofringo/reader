'use client'

import { useEffect } from 'react'

export default function SocialBar() {
  useEffect(() => {
    // Check if the script is already added to avoid duplicates on re-renders
    const scriptId = 'adsterra-social-bar'
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://behavecurlescalator.com/2f/d2/8b/2fd28be4c1e7ea427fdac80b69fc0222.js'

    document.body.appendChild(script)
  }, [])

  return null // The Social Bar floats automatically, nothing needs to be rendered visually here
}