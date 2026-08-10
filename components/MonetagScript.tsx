"use client";

import { useEffect } from "react";

export default function MonetagScript() {
  useEffect(() => {
    // 1. Completely exclude mobile devices (screen width less than 768px)
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return; 
    }

    // 2. Limit ads to once every 15 minutes using localStorage[cite: 2]
    const lastAdTime = localStorage.getItem("last_monetag_time");
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    if (lastAdTime && now - parseInt(lastAdTime) < fifteenMinutes) {
      return; 
    }

    // 3. Inject the Monetag script if it passes the checks[cite: 2]
    const script = document.createElement("script");
    script.innerHTML = "(function(s){s.dataset.zone='11539685',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
    document.head.appendChild(script);

    // Save current timestamp for the cooldown[cite: 2]
    localStorage.setItem("last_monetag_time", now.toString());

    return () => {
      script.remove();
    };
  }, []);

  return null;
}