"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdManager() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAggressiveAds, setShowAggressiveAds] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Shared check similar to AdsterraBanner
    if (window._isAdminStatus !== undefined) {
      setUserEmail(window._isAdminStatus ? "admin@gmail.com" : null); 
      setLoading(false);
    } else {
      const checkUser = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const email = session?.user?.email;
          const adminEmails = ["admin@gmail.com", "pramodravishanka3344@gmail.com"];
          window._isAdminStatus = !!(email && adminEmails.includes(email));
          setUserEmail(email);
        } catch (error) {
          console.error("Error checking ad status:", error);
        } finally {
          setLoading(false);
        }
      };

      checkUser();
    }

    // Delay aggressive ads (Social Bar, etc.) by 15 seconds on mobile, 5s on desktop for better UX
    const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;
    const adTimer = setTimeout(() => {
      setShowAggressiveAds(true);
    }, isMobileDevice ? 15000 : 5000);

    // Listen for auth changes to update ad status immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(adTimer);
    };
  }, []);

  // 1. Strictly block ads on specific technical pages
  const isTechnicalPage = pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  if (isTechnicalPage) {
    return null;
  }

  // 2. Wait for auth check to complete
  if (loading) {
    return null;
  }

  // 2. Block ads if the user is an Admin
  const adminEmails = ["admin@gmail.com", "pramodravishanka3344@gmail.com"];
  if (userEmail && adminEmails.includes(userEmail)) {
    return null;
  }

  // 3. Render ads for everyone else (Normal users + Guests)
  return (
    <>
      {showAggressiveAds && (
        <Script
          id="adsterra-social-bar"
          strategy="lazyOnload"
          src="https://pl28402819.effectivegatecpm.com/36/34/3c/36343c27af3a082c6657e27a6566cde1.js" 
        />
      )}
      
      {/* PropellerAds Popunder Script */}
      {/* <Script id="propeller-ads-popunder" strategy="afterInteractive">
        {`
          (function(s){
            s.dataset.zone='10418767';
            s.src='https://al5sm.com/tag.min.js';
          })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
        `}
      </Script> */}
    </>
  );
}

