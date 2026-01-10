"use client";

import { memo } from "react";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/utils/slugify";
import WatchlistStatus from "./WatchlistStatus";
import { useAdaptive } from "@/context/AdaptiveContext";

function MovieCard({ movie, priority = false }) {
  const { isMobile, isHydrated } = useAdaptive();

  // Safe image URL with multi-source fallback
  const rawImageUrl = (movie.image_url || movie.image || movie.thumbnail || "/placeholder-movie.jpg");
  // Ensure we have a valid string and handle protocol-relative URLs
  const imageUrl = rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
  const optimizedUrl = imageUrl.includes('tmdb.org') ? imageUrl.replace('/w500/', '/w342/') : imageUrl;

  const cardContent = (
    <div className="group relative w-full cursor-pointer touch-manipulation">
      {/* Main Poster Container */}
      <div 
        className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-xl ring-1 ring-white/10 relative transition-all duration-500 md:group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)] md:group-hover:ring-primary/50" 
        style={{ aspectRatio: '2/3' }}
      >
        {/* Loader Shimmer Effect inside the card */}
        <div className="absolute inset-0 bg-zinc-800 animate-pulse">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
        <Image
          src={optimizedUrl}
          alt={movie.title || "Movie Card"}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 md:group-hover:scale-110"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 12vw"
          unoptimized={!optimizedUrl.includes('tmdb.org') && !optimizedUrl.includes('unsplash.com')}
        />

        {/* Premium Dark Gradient Overlay - Always there but subtle, stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-500 md:group-hover:opacity-90" />

        {/* Top Badges - Glassmorphic Style */}
        <div className="absolute left-2 top-2 md:left-3 md:top-3 flex flex-col gap-1.5 z-10 items-start">
           {(movie.language || "Sinhala") && (
             <span className="backdrop-blur-md bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-white/90 shadow-lg">
               {movie.language?.substring(0, 3) || "SIN"}
             </span>
           )}
           {movie.latest_episode && (
              <span className="backdrop-blur-md bg-primary/80 border border-primary/50 rounded-lg px-2 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                 S{movie.latest_episode.season} E{movie.latest_episode.episode}
              </span>
           )}
        </div>

        <div className="absolute right-2 top-2 md:right-3 md:top-3 z-10">
           <span className={`backdrop-blur-md rounded-lg px-2 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-white shadow-lg border border-white/10 ${
             movie.type === "Upcoming" ? "bg-amber-600/80" : "bg-black/40"
           }`}>
             {movie.type === "Upcoming" 
               ? "SOON" 
               : (movie.quality || "4K")}
           </span>
        </div>

        {/* Action Button - Centered & Animated */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 scale-90 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:scale-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-[0_0_30px_rgba(229,9,20,0.6)] backdrop-blur-sm">
            <Play size={24} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {/* Hover Content Details - Slide Up */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100 hidden md:block">
           <div className="flex items-center gap-2 mb-1">
             <div className="flex items-center gap-1 text-primary">
               <Star size={12} fill="currentColor" />
               <span className="text-xs font-black text-white">{movie.rating}</span>
             </div>
             <span className="text-[10px] font-bold text-zinc-400">{movie.year}</span>
           </div>
           <p className="text-[10px] font-medium text-zinc-300 line-clamp-2 leading-relaxed">
             {movie.category || "Action, Adventure"}
           </p>
        </div>
      </div>

      {/* Title Below Card - Clean & Sharp */}
      <div className="mt-3 px-1 space-y-1">
          <h3 className="font-display text-[13px] md:text-[15px] font-bold text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-zinc-500">
            <span className="truncate max-w-[70%]">{movie.year} • {movie.type || "Movie"}</span>
            <div className="flex items-center gap-1 text-zinc-400 group-hover:text-amber-500 transition-colors">
              <Star size={10} fill="currentColor" />
              <span>{movie.rating}</span>
            </div>
          </div>
      </div>
    </div>
  );

  return (
    <Link 
      href={
        movie.link ? movie.link :
        movie.type === "TV Show" ? `/tv-shows/${slugify(movie.title)}` : 
        movie.type === "Korean Drama" ? `/korean-dramas/${slugify(movie.title)}` : 
        `/movies/${slugify(movie.title)}`
      }
      className="block"
    >
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {cardContent}
      </motion.div>
    </Link>
  );
}

export default memo(MovieCard);
