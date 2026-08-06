"use client";
import { useEffect, useRef } from "react";

export default function AdBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    // Clear to prevent duplicate injections on re-render
    bannerRef.current.innerHTML = "";

    // 1. Create the configuration script
    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '2daae70426275507cf34b426b755d5d6',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    // 2. Create the invocation script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/2daae70426275507cf34b426b755d5d6/invoke.js";
    invokeScript.async = true;

    // 3. Append both scripts into the container
    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return <div ref={bannerRef} className="flex justify-center my-4 overflow-hidden" />;
}