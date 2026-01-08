"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdsterraBanner() {
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

  const adHtml = `
    <html>
      <body style="margin:0;padding:0;">
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
    <div className={`w-full flex justify-start my-6 overflow-hidden min-h-[60px] ${loading ? 'animate-pulse bg-zinc-900/10 rounded' : ''}`}>
      <div style={{ width: "468px", height: "60px" }}>
        {!loading && !isAdmin && (
          <iframe
            srcDoc={adHtml}
            width="468"
            height="60"
            frameBorder="0"
            scrolling="no"
            className="bg-transparent"
            title="Adsterra Banner"
          />
        )}
      </div>
    </div>
  );
}
