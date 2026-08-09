"use client";

import { useEffect } from "react";

export default function MonetagPush() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://5gvci.com/act/files/tag.min.js?z=11539941";
    script.setAttribute("data-cfasync", "false");
    script.async = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}