"use client";

import { useEffect } from "react";

export default function MonetagScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = "(function(s){s.dataset.zone='11539685',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
    document.head.appendChild(script);

    return () => {
      // Optional cleanup if you want it removed when leaving the page
      script.remove();
    };
  }, []);

  return null;
}