'use client'

import { useEffect, useRef } from 'react'

export default function AdBanner32050() {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bannerDiv = bannerRef.current
    if (!bannerDiv) return

    // Clear previous contents to prevent duplicate scripts on re-renders
    bannerDiv.innerHTML = ''

    // 1. Create and set up atOptions script
    const atOptionsScript = document.createElement('script')
    atOptionsScript.type = 'text/javascript'
    atOptionsScript.text = `
      atOptions = {
        'key' : 'dfc0e1c79cad7e6bb47a5615a8e47ac6',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `

    // 2. Create and set up invoke script
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.async = true
    invokeScript.src = 'https://behavecurlescalator.com/dfc0e1c79cad7e6bb47a5615a8e47ac6/invoke.js'

    // Append both scripts to the container div
    bannerDiv.appendChild(atOptionsScript)
    bannerDiv.appendChild(invokeScript)
  }, [])

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden">
      <div ref={bannerRef} />
    </div>
  )
}