'use client';

import { useEffect } from 'react';

export default function AdcashWidget() {
  useEffect(() => {
    // Check if the library script is already injected to avoid duplication
    if (!document.getElementById('aclib')) {
      const libScript = document.createElement('script');
      libScript.id = 'aclib';
      libScript.type = 'text/javascript';
      libScript.src = '//acscdn.com/script/aclib.js';
      document.head.appendChild(libScript);

      libScript.onload = () => {
        runAutotag();
      };
    } else {
      runAutotag();
    }

    function runAutotag() {
      // Prevent duplicate zone injection if component re-renders
      if (!document.getElementById('adcash-autotag-script')) {
        const tagScript = document.createElement('script');
        tagScript.id = 'adcash-autotag-script';
        tagScript.type = 'text/javascript';
        tagScript.text = `
          aclib.runAutoTag({
            zoneId: 'epnkuzh5fg',
          });
        `;
        document.body.appendChild(tagScript);
      }
    }
  }, []);

  return <div id="adcash-container" className="my-4 flex justify-center" />;
}