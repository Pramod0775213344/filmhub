"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { getDriveAccessToken } from "@/app/actions/drive";

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const tokenClient = useRef(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // 1. Automatic Login Strategy
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // A. Try Server-Side Refresh (Persistent & Secure)
      // Requires GOOGLE_REFRESH_TOKEN in .env
      try {
        const serverToken = await getDriveAccessToken();
        if (serverToken) {
          console.log("Auto-login: Restored session from Server.");
          setAccessToken(serverToken);
          return;
        }
      } catch (e) { console.warn("Server auth check failed", e); }

      // B. Try LocalStorage (Short-term persistence)
      // Keeps you logged in on page reload within 1 hour
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("g_drive_token");
        const storedTime = localStorage.getItem("g_drive_token_time");
        if (stored && storedTime) {
          const age = Date.now() - parseInt(storedTime);
          if (age < 3500 * 1000) { // Valid for ~1 hour
             console.log("Auto-login: Restored session from LocalStorage.");
             setAccessToken(stored);
          }
        }
      }
    };
    attemptAutoLogin();
  }, []);

  // 2. Persist Token on Change
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("g_drive_token", accessToken);
      localStorage.setItem("g_drive_token_time", Date.now().toString());
    }
  }, [accessToken]);

  // 3. Initialize Google Identity Services (Manual Fallback)
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
      alert("Google Services are loading...");
    }
  };

  const startUpload = async (file, folderName) => {
    if (!accessToken) {
      alert("Please connect Google Drive first.");
      requestAuth();
      return;
    }

    const uploadId = Date.now();
    const newUpload = {
      id: uploadId,
      name: file.name,
      progress: 0,
      speed: "0 MB/s",
      status: "preparing", // Start as preparing
      link: "",
      loaded: 0,
      total: file.size,
      startTime: Date.now(),
      lastTime: Date.now(),
      lastLoaded: 0,
      movieTitle: folderName || "Untitled"
    };

    setUploadQueue(prev => [...prev, newUpload]);

    try {
        // 1. Find or Create Folder
        let folderId = null;
        if (folderName) {
            const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and trashed=false`;
            const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
                 headers: { Authorization: `Bearer ${accessToken}` }
            });
            const searchData = await searchRes.json();
            
            if (searchData.files && searchData.files.length > 0) {
                folderId = searchData.files[0].id;
            } else {
                const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        name: folderName, 
                        mimeType: "application/vnd.google-apps.folder"
                    })
                });
                const createData = await createRes.json();
                if (createData.id) folderId = createData.id;
            }
        }

        // 2. Init Resumable Upload
        const metadata = { 
            name: file.name, 
            mimeType: file.type || "video/mp4",
            parents: folderId ? [folderId] : []
        };
        
        const initRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(metadata)
        });

        if (!initRes.ok) throw new Error("Init failed");
        const uploadUrl = initRes.headers.get("Location");

        // 3. Start XHR Upload
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        
        xhr.upload.onprogress = (e) => {
           if (e.lengthComputable) {
              const now = Date.now();
              const loaded = e.loaded;
              const percent = Math.round((loaded / e.total) * 100);
              
              setUploadQueue(prev => prev.map(u => {
                 if (u.id !== uploadId) return u;
                 // Update status to uploading once bytes flow
                 let status = "uploading";
                 
                 let speed = u.speed;
                 if (now - u.lastTime > 500) {
                    const diffLoaded = loaded - u.lastLoaded;
                    const diffTime = (now - u.lastTime) / 1000;
                    const bps = diffLoaded / diffTime;
                    const mbps = (bps / (1024 * 1024)).toFixed(1);
                    speed = `${mbps} MB/s`;
                    return { ...u, status, progress: percent, speed, loaded, lastTime: now, lastLoaded: loaded };
                 }
                 return { ...u, status, progress: percent, loaded: loaded };
              }));
           }
        };

        xhr.onload = async () => {
             if (xhr.status === 200 || xhr.status === 201) {
                const data = JSON.parse(xhr.response);
                const fileId = data.id;
                try {
                    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                        method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ role: "reader", type: "anyone" })
                    });
                } catch(err) { console.warn("Perms failed", err); }
                
                const link = `https://drive.google.com/file/d/${fileId}/view`;
                setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: "complete", progress: 100, link } : u));
             } else {
                 setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error" } : u));
             }
        };
        
        xhr.onerror = () => setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error" } : u));
        xhr.send(file);
        
    } catch (err) {
        console.error(err);
        setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error" } : u));
    }
  };

  const removeUpload = (id) => {
      setUploadQueue(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UploadContext.Provider value={{ uploadQueue, startUpload, removeUpload, accessToken, setAccessToken, requestAuth }}>
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => useContext(UploadContext);
