'use client'

import { useEffect, useRef } from 'react'

export default function AdBanner728() {
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
        'key' : '4e5051b1ad7936538afe7261378b2831',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `

    // 2. Create and set up invoke script
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.async = true
    invokeScript.src = 'https://behavecurlescalator.com/4e5051b1ad7936538afe7261378b2831/invoke.js'

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