"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Cloud, CheckCircle2, Loader2, X, AlertCircle, PlayCircle } from "lucide-react";

export default function GoogleDriveUploader({ onUploadComplete, onProgress, folderId = "" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, authenticating, uploading, complete, error
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState(null);
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
              setStatus("error");
              return;
            }
            setAccessToken(resp.access_token);
            setStatus("idle");
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
  }, [CLIENT_ID]);

  const handleAuth = () => {
    if (!CLIENT_ID) {
        alert("Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.");
        return;
    }
    tokenClient.current.requestAccessToken();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!accessToken) {
      alert("Please connect to Google Drive first.");
      return;
    }

    startResumableUpload(file);
  };

  const startResumableUpload = async (file) => {
    setIsUploading(true);
    setStatus("uploading");
    setProgress(0);
    setError("");

    try {
      // 1. Initial request to get upload URL
      const metadata = {
        name: file.name,
        mimeType: file.type || "video/mp4",
      };
      
      if (folderId) {
        metadata.parents = [folderId];
      }

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) throw new Error("Could not initiate upload.");

      const uploadUrl = response.headers.get("Location");

      // 2. Perform the upload using XHR to track progress
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          const rounded = Math.round(percentComplete);
          setProgress(rounded);
          if (onProgress) onProgress(rounded);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.response);
          const fileId = data.id;
          
          // Make the file readable by anyone
          try {
            await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                role: "reader",
                type: "anyone",
              }),
            });
          } catch (permErr) {
            console.warn("Could not set permissions automatically:", permErr);
          }

          const viewLink = `https://drive.google.com/file/d/${fileId}/view`;
          
          setStatus("complete");
          onUploadComplete(viewLink, fileId);
        } else {
          setError("Upload failed.");
          setStatus("error");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setError("Network error occurred.");
        setStatus("error");
        setIsUploading(false);
      };

      xhr.send(file);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus("error");
      setIsUploading(false);
    }
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
          
          {status === "idle" && (
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
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Storage: Free Space</p>
              </div>
            </button>
          )}

          {status === "uploading" && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={20} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Uploading Video...</span>
                </div>
                <span className="text-xs font-black text-primary">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#e50914]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {status === "complete" && (
            <div className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3 text-green-500">
                <CheckCircle2 size={24} />
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">Upload Finished!</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase">Link added to URL field</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 text-[10px] font-black text-zinc-500 uppercase hover:text-white"
              >
                Upload another?
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle size={24} />
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">Upload Error</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase">{error}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 text-[10px] font-black text-zinc-500 uppercase hover:text-white underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
