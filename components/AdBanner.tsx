"use client";

import { useEffect, useRef } from "react";

export default function AdBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    // Prevent duplicate injection if it renders twice
    if (bannerRef.current.firstChild) return;

    // 1. Create atOptions script
    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : '2daae70426275507cf34b426b755d5d6',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    // 2. Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.async = true;
    invokeScript.src = "https://behavecurlescalator.com/2daae70426275507cf34b426b755d5d6/invoke.js";

    // 3. Append to the banner container ref
    bannerRef.current.appendChild(atOptionsScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden">
      <div ref={bannerRef} style={{ width: "300px", height: "250px" }} />
    </div>
  );
}