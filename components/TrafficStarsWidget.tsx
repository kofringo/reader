// components/TrafficStarsWidget.tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    RnInPagePush?: (config: any) => void
  }
}

export default function TrafficStarsWidget() {
  useEffect(() => {
    const sdkScriptId = 'trafficstars-sdk'
    
    // 1. Load the main SDK script if it isn't already present
    if (!document.getElementById(sdkScriptId)) {
      const sdkScript = document.createElement('script')
      sdkScript.id = sdkScriptId
      sdkScript.src = '//cdn.runative-syndicate.com/sdk/v1/inpage.push.js'
      sdkScript.async = true
      
      // Optional: Initialize once the script successfully loads
      sdkScript.onload = () => {
        if (window.RnInPagePush) {
          window.RnInPagePush({
            spot: "8c765a4bb6494f2cbb344d58a78da7e2",
            cookieExpires: 25,
            verticalPosition: "bottom",
            delay: 2,
          })
        }
      }

      document.body.appendChild(sdkScript)
    } else {
      // If script is already cached/loaded, run immediately
      if (window.RnInPagePush) {
        window.RnInPagePush({
          spot: "8c765a4bb6494f2cbb344d58a78da7e2",
          cookieExpires: 25,
          verticalPosition: "bottom",
          delay: 2,
        })
      }
    }
  }, [])

  return null
}