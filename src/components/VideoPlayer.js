"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "plyr/dist/plyr.css";

export default function VideoPlayer({ url, title, autoPlay = false }) {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

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

  const youtubeId = url ? getYoutubeId(url) : null;
  const isYoutube = !!youtubeId;
  const isIframeEmbed = url ? url.includes("streamtape.com") : false;

  // Initial Plyr Setup
  useEffect(() => {
    if (!url || isIframeEmbed) return; // Don't init plyr if no url or if it's an iframe

    let playerInstance = null;

    const initPlayer = async () => {
      try {
        const Plyr = (await import("plyr")).default;
        if (videoRef.current) {
          playerInstance = new Plyr(videoRef.current, {
            autoplay: autoPlay,
            controls: [
              'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['captions', 'quality', 'speed'],
            youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
          });
          playerRef.current = playerInstance;
          
          // Wait for player to be ready before hiding loader
          playerInstance.on('ready', () => {
             setIsLoading(false);
          });
          
          // Safety timeout in case ready doesn't fire (e.g. quick format switch)
          setTimeout(() => setIsLoading(false), 5000);
        }
      } catch (error) {
        console.error("Plyr init failed:", error);
        setIsLoading(false); // Hide loader on error so at least controls might show
      }
    };

    initPlayer();

    return () => {
        if (playerInstance) playerInstance.destroy();
    };
  }, [url, autoPlay, isIframeEmbed]);


  // Embed Logic (Streamtape)
  const getEmbedUrl = (videoUrl) => {
    try {
      if (videoUrl.includes("streamtape.com/v/")) {
        return videoUrl.replace("/v/", "/e/");
      }
      return videoUrl;
    } catch (e) {
      return videoUrl;
    }
  };

  if (!url) return null;

  if (isIframeEmbed) {
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
            <div 
              ref={videoRef} 
              className="plyr__video-embed" 
              id="player"
              data-plyr-provider="youtube" 
              data-plyr-embed-id={youtubeId}
            />
         ) : (
            <video 
              ref={videoRef} 
              className="plyr" 
              playsInline 
              controls
            >
              <source src={url} type="video/mp4" />
            </video>
         )}
      </div>
    </div>
  );
}
