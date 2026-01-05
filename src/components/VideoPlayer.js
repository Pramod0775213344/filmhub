"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function VideoPlayer({ url, title, autoPlay = false, poster = null }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLoading(true);
    setHasError(false);
  }, [url]);

  if (!url || !isMounted) {
    return (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-700" size={32} />
      </div>
    );
  }

  // Helper to safely extract YouTube ID
  const getYoutubeId = (targetUrl) => {
    try {
      if (targetUrl.includes("v=")) {
        return new URL(targetUrl).searchParams.get("v");
      }
      return targetUrl.split("/").pop().split("?")[0];
    } catch (e) {
      return targetUrl.split("/").pop().split("?")[0];
    }
  };

  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  const isEmbed = url.includes("dood") || url.includes("ds2play") || url.includes("myvidplay") || url.includes("streamtape") || url.includes("voe") || url.includes("drive.google.com");
  
  const getFinalUrl = (rawUrl) => {
    try {
      let clean = rawUrl;
      // Doodstream / MyVidPlay / DS2Play
      if (clean.includes("dood") || clean.includes("ds2play") || clean.includes("myvidplay")) {
        clean = clean.replace("/d/", "/e/").replace("/f/", "/e/");
      }
      // Streamtape
      if (clean.includes("streamtape.com/v/")) {
        clean = clean.replace("/v/", "/e/");
      }
      // VOE
      if (clean.includes("voe.sx") && !clean.includes("/e/")) {
        clean = clean.replace("voe.sx/", "voe.sx/e/");
      }
      // Google Drive
      if (clean.includes("drive.google.com") && clean.includes("/view")) {
        clean = clean.replace("/view", "/preview");
      }
      return clean;
    } catch (err) {
      return rawUrl;
    }
  };

  const finalUrl = getFinalUrl(url);

  // 1. YouTube Strategy
  if (isYoutube) {
    const videoId = getYoutubeId(url);
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title={title}
        />
      </div>
    );
  }

  // 2. Embed Strategy (Dood, MyVidPlay, etc.)
  if (isEmbed) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Connecting to Server...</p>
          </div>
        )}
        
        <iframe
          src={finalUrl}
          className="absolute inset-0 w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          onLoad={() => setLoading(false)}
          referrerPolicy="origin"
          title={title}
        />

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 text-center p-4">
            <AlertCircle className="text-red-500 mb-2" size={32} />
            <p className="text-white font-bold text-sm">Video cannot be loaded</p>
            <button 
              onClick={() => window.open(finalUrl, '_blank')}
              className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-widest"
            >
              Play in New Tab
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Direct MP4 Strategy
  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      <video
        src={url}
        poster={poster}
        controls
        playsInline
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
        onLoadedData={() => setLoading(false)}
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
