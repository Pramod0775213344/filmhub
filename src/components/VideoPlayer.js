"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "plyr/dist/plyr.css";

export default function VideoPlayer({ url, title, autoPlay = false, poster = null }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef(null);
  const youtubeRef = useRef(null);
  const playerRef = useRef(null);

  // ... (keep getYoutubeId and getGoogleDriveId helpers same) ...
  // Helper to extract YouTube ID
  const getYoutubeId = (url) => {
    try {
      if (!url) return null;
      if (url.includes("youtube.com/watch")) {
        return new URL(url).searchParams.get("v");
      }
      if (url.includes("youtu.be/")) {
        return url.split("/").pop().split("?")[0];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Helper to extract Google Drive ID
  const getGoogleDriveId = (url) => {
    try {
      if (!url) return null;
      // Handle drive.google.com/file/d/ID/preview or /view or /edit
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  }

  const youtubeId = url ? getYoutubeId(url) : null;
  const isYoutube = !!youtubeId;
  const googleDriveId = url ? getGoogleDriveId(url) : null;
  const isGoogleDrive = !!googleDriveId;
  const isStreamtape = url ? url.includes("streamtape.com") : false;
  
  // Use iframe for Streamtape OR Google Drive
  const isIframeEmbed = isStreamtape || isGoogleDrive;

  // Initial Plyr Setup (Only for non-iframe content)
  useEffect(() => {
    if (!url || isIframeEmbed) {
      setIsLoading(false); 
      return;
    }

    let playerInstance = null;

    const initPlayer = async () => {
      try {
        const Plyr = (await import("plyr")).default;
        
        // Standard Plyr Init (MP4 or YouTube)
        const target = isYoutube ? youtubeRef.current : videoRef.current;
        
        if (target) {
          // Standard Plyr Init
          // For YouTube with explicit iframe, we don't pass 'source' object. Plyr picks it up from DOM.
          
          playerInstance = new Plyr(target, {
            autoplay: autoPlay,
            controls: [
              'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['captions', 'quality', 'speed'],
            youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
          });
          
          playerRef.current = playerInstance;
          
          playerInstance.on('ready', () => {
             setIsLoading(false);
          });
          
          setTimeout(() => setIsLoading(false), 3000);
        } else {
             console.warn("Plyr init failed: Target not found");
             setIsLoading(false);
        }

      } catch (error) {
        console.error("Player init failed:", error);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
        if (playerInstance) playerInstance.destroy();
    };
  }, [url, autoPlay, isIframeEmbed, isYoutube, youtubeId]);


  // Embed Logic
  const getEmbedUrl = (videoUrl) => {
    try {
      if (isGoogleDrive && googleDriveId) {
        return `https://drive.google.com/file/d/${googleDriveId}/preview`;
      }
      if (isStreamtape && videoUrl.includes("streamtape.com/v/")) {
        return videoUrl.replace("/v/", "/e/");
      }
      return videoUrl;
    } catch (e) {
      return videoUrl;
    }
  };

  if (!url) return null;

  if (isIframeEmbed) {
    // Custom Cover for Iframes
    if (!isPlaying && poster) {
      return (
        <div 
          onClick={() => setIsPlaying(true)}
          className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 cursor-pointer"
        >
          {/* Poster Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${poster})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          
          {/* Custom Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-white shadow-[0_0_40px_rgba(229,9,20,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
             </div>
          </div>
        </div>
      );
    }

    const embedUrl = getEmbedUrl(url);
    return (
      <div className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-500 z-10 pointer-events-none">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Loading Player...</p>
        </div>
      )}

      {/* Plyr Video Element */}
      <div className="plyr-wrapper h-full w-full">
         {isYoutube ? (
            <div className="plyr__video-embed" ref={youtubeRef}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`}
                allowFullScreen
                allowtransparency="true"
                allow="autoplay"
                title={title}
              />
            </div>
         ) : (
            <video 
              ref={videoRef} 
              className="plyr" 
              playsInline 
              controls
              crossOrigin="anonymous"
            >
              <source src={url} type="video/mp4" />
            </video>
         )}
      </div>
    </div>
  );
}
