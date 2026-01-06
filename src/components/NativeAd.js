"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";

export default function NativeAd() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email;
        const adminEmails = ["admin@gmail.com", "pramodravishanka3344@gmail.com"];
        setIsAdmin(userEmail && adminEmails.includes(userEmail));
      } catch (error) {
        console.error("Error checking ad status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading || isAdmin) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-8">
      <div className="w-full max-w-[1200px]">
        {/* Adsterra Native Banner Script */}
        <Script 
          id="adsterra-native-banner"
          async={true}
          data-cfasync="false"
          src="https://pl28411527.effectivegatecpm.com/ed748cb852d8ea797434391a6baa58cd/invoke.js"
          strategy="afterInteractive"
        />
        <div id="container-ed748cb852d8ea797434391a6baa58cd" className="w-full">
        </div>
      </div>
    </div>
  );
}
