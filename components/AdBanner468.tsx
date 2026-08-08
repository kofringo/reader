"use client";

import { useEffect, useRef } from "react";

export default function AdBanner468() {
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
        'key' : '6b1af66d700cbb8f20fc0a932916c8bd',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;

    // 2. Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.async = true;
    invokeScript.src = "https://behavecurlescalator.com/6b1af66d700cbb8f20fc0a932916c8bd/invoke.js";

    // 3. Append to the banner container ref
    bannerRef.current.appendChild(atOptionsScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden">
      <div ref={bannerRef} style={{ width: "468px", height: "60px" }} />
    </div>
  );
}