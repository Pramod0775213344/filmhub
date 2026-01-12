"use client";

import { memo } from "react";
import { Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/utils/slugify";
import { useAdaptive } from "@/context/AdaptiveContext";

/**
 * ULTRA-OPTIMIZED MOVIE CARD
 * Fixes CLS (stable aspect ratio) and optimizes image delivery
 */
function MovieCard({ movie, priority = false }) {
  const { isMobile } = useAdaptive();

  // Safe image URL with multi-source fallback
  const rawImageUrl = (movie.image_url || movie.image || movie.thumbnail || "/placeholder-movie.jpg");
  const imageUrl = rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
  
  // High optimization: Use smaller images for cards on mobile
  const optimizedUrl = imageUrl.includes('tmdb.org') 
    ? imageUrl.replace('/w500/', isMobile ? '/w342/' : '/w342/') 
    : imageUrl;

  const cardContent = (
    <div className="group relative w-full cursor-pointer touch-manipulation hover-lift will-change-transform">
      {/* Main Poster Container - STABLE ASPECT RATIO TO FIX CLS */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden rounded-xl md:rounded-2xl bg-zinc-900 shadow-xl ring-1 ring-white/10 transition-all duration-500 md:group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)] md:group-hover:ring-primary/50" 
      >
        {/* Persistent Loader Background */}
        <div className="absolute inset-0 bg-zinc-800" />
        
        <Image
          src={optimizedUrl}
          alt={movie.title || "Movie Card"}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 md:group-hover:scale-110"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
          unoptimized={!optimizedUrl.includes('tmdb.org')}
        />

        {/* Premium Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 md:group-hover:opacity-90" />

        {/* Top Badges */}
        <div className="absolute left-1.5 top-1.5 md:left-3 md:top-3 flex flex-col gap-1 z-10 items-start">
           {(movie.language || "Sinhala") && (
             <span className="backdrop-blur-md bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider text-white/90">
               {movie.language?.substring(0, 3) || "SIN"}
             </span>
           )}
           {movie.latest_episode && (
              <span className="backdrop-blur-md bg-primary/80 border border-primary/50 rounded px-1.5 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider text-white">
                 S{movie.latest_episode.season} E{movie.latest_episode.episode}
              </span>
           )}
        </div>

        {/* Action Button - Desktop Only */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-[0_0_30px_rgba(229,9,20,0.6)] backdrop-blur-sm">
            <Play size={24} fill="currentColor" className="ml-1" />
          </div>
        </div>
      </div>

      {/* Info Below Card - Stable height to prevent CLS */}
      <div className="mt-3 px-1 space-y-1 min-h-[44px]">
          <h3 className="font-display text-[12px] md:text-[15px] font-bold text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
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

  const href = movie.link ? movie.link :
               movie.type === "TV Show" ? `/tv-shows/${slugify(movie.title)}` : 
               movie.type === "Korean Drama" ? `/korean-dramas/${slugify(movie.title)}` : 
               `/movies/${slugify(movie.title)}`;

  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}

export default memo(MovieCard);
