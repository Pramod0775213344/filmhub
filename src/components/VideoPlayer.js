"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";

export default function VideoPlayer({ url, title }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!url) return null;

  // Transform URLs to embeddable format
  const getEmbedUrl = (videoUrl) => {
    try {
      // YouTube Handling
      if (videoUrl.includes("youtube.com/watch")) {
        const url = new URL(videoUrl);
        const videoId = url.searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }
      if (videoUrl.includes("youtu.be/")) {
        const videoId = videoUrl.split("/").pop().split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }

      // Streamtape Handling
      if (videoUrl.includes("streamtape.com/v/")) {
        return videoUrl.replace("/v/", "/e/");
      }
      if (videoUrl.includes("streamtape.com/e/")) {
        return videoUrl;
      }

      return videoUrl;
    } catch (e) {
      return videoUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-500">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Loading Player...</p>
        </div>
      )}
      
      <iframe
        src={embedUrl}
        title={title}
        className={`h-full w-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {/* Aesthetic Overlay (Optional) */}
      {!isLoading && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      )}
    </div>
  );
}
