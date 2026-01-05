"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdManager() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserEmail(session?.user?.email);
      } catch (error) {
        console.error("Error checking ad status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes to update ad status immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Strictly block ads on specific technical pages
  const isTechnicalPage = pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  if (isTechnicalPage) {
    return null;
  }

  // 2. Wait for auth check to complete
  // If we don't wait, ads might load for a split second before we know the user is an admin.
  // Once loaded, external scripts are hard to remove.
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
      {/* <Script
        id="adsterra-social-bar"
        strategy="afterInteractive"
        src="https://pl28402819.effectivegatecpm.com/36/34/3c/36343c27af3a082c6657e27a6566cde1.js" 
      /> */}
      
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
