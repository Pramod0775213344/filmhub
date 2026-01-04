"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function AdManager() {
  const pathname = usePathname();

  // Do not show ads on admin dashboard routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        id="adsterra-social-bar"
        strategy="afterInteractive"
        src="https://pl28402819.effectivegatecpm.com/36/34/3c/36343c27af3a082c6657e27a6566cde1.js" 
      />
      
      {/* PropellerAds Popunder Script */}
      <Script id="propeller-ads-popunder" strategy="afterInteractive">
        {`
          (function(s){
            s.dataset.zone='10418767';
            s.src='https://al5sm.com/tag.min.js';
          })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
        `}
      </Script>
    </>
  );
}
