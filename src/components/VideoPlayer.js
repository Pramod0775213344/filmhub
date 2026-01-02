import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";

// Dynamic import to handle SSR and potential module export issues
const Plyr = dynamic(() => import("plyr-react"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-500">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-xs font-black uppercase tracking-widest">Loading Player...</p>
    </div>
  )
});

export default function VideoPlayer({ url, title, autoPlay = false }) {
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);

  if (!url) return null;

  // Check if it's a direct file or HLS/Dash (simple check for extensions or if it's NOT an embed)
  const isEmbed = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("streamtape.com");

  // Transform URLs for iframes
  const getEmbedUrl = (videoUrl) => {
    try {
      if (videoUrl.includes("youtube.com/watch")) {
        const urlObj = new URL(videoUrl);
        const videoId = urlObj.searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
      }
      if (videoUrl.includes("youtu.be/")) {
        const videoId = videoUrl.split("/").pop().split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
      }
      if (videoUrl.includes("streamtape.com/v/")) {
        return videoUrl.replace("/v/", "/e/");
      }
      return videoUrl;
    } catch (e) {
      return videoUrl;
    }
  };

  if (isEmbed) {
    const embedUrl = getEmbedUrl(url);
    return (
      <div className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-500">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-xs font-black uppercase tracking-widest">Loading Embed...</p>
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
      </div>
    );
  }

  // Plyr Config for Direct Links
  const plyrSource = {
    type: "video",
    title: title,
    sources: [
      {
        src: url,
        type: "video/mp4", // Default assumption for direct links
      }
    ],
    poster: null 
  };

  const plyrOptions = {
    autoplay: autoPlay,
    controls: [
      'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
    ],
    settings: ['captions', 'quality', 'speed'],
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
      <div className="plyr-wrapper h-full w-full">
         <Plyr 
           ref={ref} 
           source={plyrSource} 
           options={plyrOptions} 
           className="h-full w-full"
         />
      </div>
    </div>
  );
}
