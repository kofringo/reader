"use client";

import { useEffect, useRef } from "react";

type Props = {
  adKey: string;
  width: number;
  height: number;
};

let loadingQueue = Promise.resolve();

export default function AdsterraAd({
  adKey,
  width,
  height,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let cancelled = false;

    const previous = loadingQueue;

    const current = previous.then(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled) {
            resolve();
            return;
          }

          container.innerHTML = "";

          // IMPORTANT:
          // Set atOptions immediately before loading this ad.
          (window as any).atOptions = {
            key: adKey,
            format: "iframe",
            height,
            width,
            params: {},
          };

          const script = document.createElement("script");

          script.type = "text/javascript";
          script.src = `https://behavecurlescalator.com/${adKey}/invoke.js`;
          script.async = false;

          script.onload = () => {
            resolve();
          };

          script.onerror = () => {
            console.error(
              `Adsterra failed to load: ${adKey}`
            );
            resolve();
          };

          container.appendChild(script);
        })
    );

    loadingQueue = current;

    return () => {
      cancelled = true;
    };
  }, [adKey, width, height]);

  return (
    <div className="flex justify-center my-4 overflow-hidden">
      <div
        ref={containerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}