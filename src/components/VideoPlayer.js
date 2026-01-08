"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Loader2, AlertCircle, Play } from "lucide-react";
import Image from "next/image";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function VideoPlayer({ url, title, autoPlay = false, poster = null }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevUrl, setPrevUrl] = useState(url);

  // Safely detect if we are on the client (replaces isMounted state)
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Reset state synchronously when the URL prop changes
  if (url !== prevUrl) {
    setPrevUrl(url);
    setLoading(true);
    setHasError(false);
    setIsPlaying(false); // Reset play state when movie changes
  }

  if (!url || !isMounted) {
    return (
      <div className="relative w-full aspect-video max-h-[450px] bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
        <Loader2 className="animate-spin text-zinc-700" size={32} />
      </div>
    );
  }

  // Cover Photo / Poster State before playing
  if (!isPlaying) {
    return (
      <div 
        onClick={() => setIsPlaying(true)}
        className="relative w-full aspect-video max-h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 cursor-pointer group"
      >
        {poster ? (
          <Image 
            src={poster} 
            alt={title} 
            fill 
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
             <Image src="/logo.png" alt="FilmHub" width={150} height={50} className="opacity-20 grayscale" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_rgba(229,9,20,0.5)] transition-transform duration-300 group-hover:scale-110">
              <Play size={32} fill="currentColor" className="ml-1" />
            </div>
          </div>
        </div>

        {/* Info Label */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Status: Ready</span>
              <p className="text-white font-bold text-sm tracking-wide">{title}</p>
           </div>
           <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
             Click to Watch
           </div>
        </div>
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
      if (clean.includes("drive.google.com")) {
        if (clean.includes("/view")) {
          clean = clean.replace("/view", "/preview");
        } else if (clean.includes("open?id=")) {
          const id = new URL(clean).searchParams.get("id");
          clean = `https://drive.google.com/file/d/${id}/preview`;
        } else if (clean.includes("/file/d/") && !clean.includes("/preview")) {
          // Ensure it ends in /preview if it's just a file link
          const parts = clean.split('?')[0].split('/');
          const id = parts[parts.indexOf('d') + 1];
          clean = `https://drive.google.com/file/d/${id}/preview`;
        }
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
      <div className="relative w-full aspect-video max-h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
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
      <div className="relative w-full aspect-video max-h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10 transition-opacity duration-500">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Connecting to Server...</p>
          </div>
        )}
        
        <iframe
          src={finalUrl}
          className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
          scrolling="no"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          onLoad={() => setLoading(false)}
          referrerPolicy="origin"
          title={title}
        />
        
        {/* Anti-scroll-hijack overlay (invisible but helps capture intent) */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-2xl" />

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
    <div className="relative w-full aspect-video max-h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
