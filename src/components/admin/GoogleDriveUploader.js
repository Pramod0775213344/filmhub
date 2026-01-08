"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Cloud } from "lucide-react";

export default function GoogleDriveUploader({ externalToken = null, onTokenReceived, onFileSelect }) {
  const [error, setError] = useState("");
  const [localToken, setLocalToken] = useState(null);
  
  const accessToken = externalToken || localToken;
  const tokenClient = useRef(null);
  const fileInputRef = useRef(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const initializeTokenClient = () => {
      if (typeof window !== "undefined" && window.google) {
        tokenClient.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: (resp) => {
            if (resp.error) {
              setError("Google authentication failed.");
              return;
            }
            if (onTokenReceived) {
                onTokenReceived(resp.access_token);
            } else {
                setLocalToken(resp.access_token);
            }
          },
        });
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeTokenClient;
    document.body.appendChild(script);

    return () => {
      if (typeof document !== "undefined" && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [CLIENT_ID, onTokenReceived]);

  const handleAuth = () => {
    if (!CLIENT_ID) {
        alert("Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.");
        return;
    }
    if (tokenClient.current) {
        tokenClient.current.requestAccessToken();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!accessToken) {
      alert("Please connect to Google Drive first.");
      return;
    }

    if (onFileSelect) {
        onFileSelect(file, accessToken);
    }
    
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="w-full">
      {!accessToken ? (
        <button
          type="button"
          onClick={handleAuth}
          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 hover:border-primary/50 group"
        >
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Cloud size={24} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-white uppercase tracking-wider">Connect Google Drive</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">To upload movies directly</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-primary/10 border border-primary/20 p-6 transition-all hover:bg-primary/20 group"
          >
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(229,9,20,0.3)]">
              <Upload size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white uppercase tracking-wider">Select Movie File</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Global Background Upload</p>
            </div>
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}
