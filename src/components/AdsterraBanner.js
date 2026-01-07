"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdsterraBanner() {
  const containerRef = useRef(null);
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

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (loading || isAdmin || !currentContainer) return;

    // Clear any existing content
    currentContainer.innerHTML = "";

    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : 'd62819ea9606995cac6da328c4d8e460',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/d62819ea9606995cac6da328c4d8e460/invoke.js";

    currentContainer.appendChild(atOptionsScript);
    currentContainer.appendChild(invokeScript);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [loading, isAdmin]);

  if (loading || isAdmin) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-6 overflow-hidden">
      <div 
        ref={containerRef} 
        className="min-h-[60px] min-w-[468px] flex items-center justify-center bg-transparent"
        id="adsterra-banner-468x60"
      >
        {/* Ad will be injected here */}
      </div>
    </div>
  );
}
