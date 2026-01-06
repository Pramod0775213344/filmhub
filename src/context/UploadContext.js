"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [activeUpload, setActiveUpload] = useState(null); // { id, file, progress, status, movieTitle, movieId, type, cancelToken }
  const [accessToken, setAccessToken] = useState(null);
  const tokenClient = useRef(null);
  const supabase = createClient();

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize Google Auth
  useEffect(() => {
    const initializeTokenClient = () => {
      if (typeof window !== "undefined" && window.google) {
        tokenClient.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: (resp) => {
            if (resp.error) {
              console.error("Auth Error:", resp);
              return;
            }
            setAccessToken(resp.access_token);
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

  const requestAuth = () => {
    if (tokenClient.current) {
      tokenClient.current.requestAccessToken();
    } else {
      alert("Google Services are still loading. Please wait a moment.");
    }
  };

  const startUpload = async (file, movieId, movieTitle, type = "movies") => {
    if (!accessToken) {
      alert("Please connect Google Drive first (Click the Cloud icon in the widget).");
      requestAuth();
      return;
    }

    // Set initial state
    setActiveUpload({
      id: Date.now(),
      file,
      progress: 0,
      status: "preparing",
      movieTitle,
      movieId,
      type
    });

    try {
      // 1. Initiate Resumable Upload
      const metadata = {
        name: file.name,
        mimeType: file.type || "video/mp4",
      };

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

      if (!response.ok) throw new Error("Failed to initiate upload");

      const uploadUrl = response.headers.get("Location");

      // 2. Upload File
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setActiveUpload(prev => prev ? ({ ...prev, progress: percent, status: "uploading" }) : null);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.response);
          const fileId = data.id;

          // 3. Make Public
          try {
            await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: "reader", type: "anyone" }),
            });
          } catch (e) {
            console.warn("Permission update failed", e);
          }

          const viewLink = `https://drive.google.com/file/d/${fileId}/view`;

          // 4. Update Supabase
          const { error } = await supabase
            .from(type) // 'movies' or 'tv_episodes' etc
            .update({ video_url: viewLink })
            .eq("id", movieId);

          if (!error) {
            setActiveUpload(prev => ({ ...prev, progress: 100, status: "complete" }));
            alert(`Upload Successful for "${movieTitle}"!`);
            // Auto-clear after 5 seconds
            setTimeout(() => setActiveUpload(null), 5000);
          } else {
             setActiveUpload(prev => ({ ...prev, status: "error", error: "Database Update Failed" }));
          }
        } else {
          setActiveUpload(prev => ({ ...prev, status: "error", error: "Upload Failed" }));
        }
      };

      xhr.onerror = () => {
         setActiveUpload(prev => ({ ...prev, status: "error", error: "Network Error" }));
      };

      xhr.send(file);

    } catch (err) {
      console.error(err);
      setActiveUpload(prev => ({ ...prev, status: "error", error: err.message }));
    }
  };

  const cancelUpload = () => {
    // Basic cancel: clear state. XHR cancellation requires ref tracking which we can add if needed.
    // For now, this just hides the UI.
    setActiveUpload(null); 
  };

  return (
    <UploadContext.Provider value={{ activeUpload, startUpload, cancelUpload, accessToken, requestAuth }}>
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => useContext(UploadContext);
