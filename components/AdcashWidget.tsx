'use client';

import { useEffect, useState } from 'react';

export default function AdcashWidget() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const lastAdTime = localStorage.getItem('last_ad_shown_time');
    const now = new Date().getTime();
    const tenHoursInMs = 10 * 60 * 60 * 1000;

    // Check if 10 hours have passed since the last ad view
    if (!lastAdTime || now - parseInt(lastAdTime, 10) > tenHoursInMs) {
      setShowAd(true);
      localStorage.setItem('last_ad_shown_time', now.toString());

      // Inject Adcash scripts
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
    }

    function runAutotag() {
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

  // If within the 10-hour window, render nothing
  if (!showAd) {
    return null;
  }

  return <div id="adcash-container" className="my-4 flex justify-center" />;
}