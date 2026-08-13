"use client";

import { useEffect, useRef } from "react";

export default function AdBanner32050() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    // Prevent duplicate injection if it renders twice
    if (bannerRef.current.firstChild) return;

    // 1. Create atOptions script with your 320x50 key
    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : 'dfc0e1c79cad7e6bb47a5615a8e47ac6',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    // 2. Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.async = true;
    invokeScript.src = "https://behavecurlescalator.com/dfc0e1c79cad7e6bb47a5615a8e47ac6/invoke.js";

    // 3. Append scripts to container ref
    bannerRef.current.appendChild(atOptionsScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden">
      <div ref={bannerRef} style={{ width: "320px", height: "50px" }} />
    </div>
  );
}