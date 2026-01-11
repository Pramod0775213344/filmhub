"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdsterraBanner() {
  // Shared state to avoid multiple session checks
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we already have the result in the window object (simple client-side cache)
    if (window._isAdminStatus !== undefined) {
      setIsAdmin(window._isAdminStatus);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email;
        const adminEmails = ["admin@gmail.com", "pramodravishanka3344@gmail.com"];
        const status = !!(userEmail && adminEmails.includes(userEmail));
        window._isAdminStatus = status;
        setIsAdmin(status);
      } catch (error) {
        console.error("Error checking ad status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const adHtml = `
    <html>
      <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
        <script type="text/javascript">
          atOptions = {
            'key' : 'd62819ea9606995cac6da328c4d8e460',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/d62819ea9606995cac6da328c4d8e460/invoke.js"></script>
      </body>
    </html>
  `;

  if (!loading && isAdmin) {
    return null;
  }

  return (
    <div className="w-full">
      {!loading && !isAdmin && (
        <div className="flex flex-wrap justify-start gap-4 md:gap-8">
          <div className="relative w-[468px] h-[60px] bg-zinc-900/5 rounded overflow-hidden">
            <iframe
              srcDoc={adHtml}
              width="468"
              height="60"
              frameBorder="0"
              scrolling="no"
              className="bg-transparent"
              title="Adsterra Banner 1"
              loading="lazy"
            />
          </div>
          {/* Maximum 2 ads on desktop only for stability */}
          <div className="hidden md:block relative w-[468px] h-[60px] bg-zinc-900/5 rounded overflow-hidden">
            <iframe
              srcDoc={adHtml}
              width="468"
              height="60"
              frameBorder="0"
              scrolling="no"
              className="bg-transparent"
              title="Adsterra Banner 2"
              loading="lazy"
            />
          </div>
        </div>
      )}
      {loading && (
        <div className="w-full h-[60px] animate-pulse bg-zinc-900/10 rounded" />
      )}
    </div>
  );
}
