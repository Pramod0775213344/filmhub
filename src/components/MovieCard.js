"use client";

import { memo } from "react";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/utils/slugify";
import WatchlistStatus from "./WatchlistStatus";
import { useAdaptive } from "@/context/AdaptiveContext";

function MovieCard({ movie }) {
  const { isMobile, isHydrated } = useAdaptive();

  // Safe image URL with multi-source fallback
  const rawImageUrl = (movie.image_url || movie.image || movie.thumbnail || "/placeholder-movie.jpg");
  // Ensure we have a valid string and handle protocol-relative URLs
  const imageUrl = rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
  const optimizedUrl = imageUrl.includes('tmdb.org') ? imageUrl.replace('/w500/', '/w342/') : imageUrl;

  const cardContent = (
    <div className="group relative w-full cursor-pointer touch-manipulation">
      <div 
        className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-md md:shadow-2xl relative transition-all duration-300 md:group-hover:ring-2 md:group-hover:ring-primary/50" 
        style={{ aspectRatio: '2/3' }}
      >
        <Image
          src={optimizedUrl}
          alt={movie.title || "Movie Card"}
          fill
          className="object-cover transition-transform duration-500 md:group-hover:scale-110"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 12vw"
          unoptimized={!optimizedUrl.includes('tmdb.org') && !optimizedUrl.includes('unsplash.com')}
        />

        {/* Hover overlay - Desktop Only */}
        <div className="movie-card-gradient absolute inset-0 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 hidden md:block" />

        <div className="absolute left-2 top-2 md:left-3 md:top-3 flex flex-col gap-1 z-10">
           {movie.latest_episode && (
              <span className="flex items-center justify-center rounded bg-green-600 px-1.5 py-0.5 text-[8px] md:text-[11px] font-bold text-white shadow-md">
                 S{movie.latest_episode.season} | E{movie.latest_episode.episode}
              </span>
           )}
           {(movie.language || "Sinhala") && (
             <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[8px] md:text-[11px] font-bold text-white shadow-md">
               {movie.language || "Sinhala"}
             </span>
           )}
        </div>

        <div className="absolute right-2 top-2 md:right-3 md:top-3 z-10">
           <span className={`rounded px-1.5 py-0.5 text-[8px] md:text-[11px] font-bold text-white shadow-md ${movie.type === "Upcoming" ? "bg-orange-600" : "bg-purple-600"}`}>
             {movie.type === "Upcoming" ? "Soon" : (movie.quality || "FHD")}
           </span>
        </div>

        {/* Desktop Content Overlay */}
        <div className="absolute inset-0 hidden flex-col justify-end p-5 opacity-0 transition-all duration-500 md:flex md:group-hover:opacity-100 md:group-hover:translate-y-0 md:translate-y-6">
          <h3 className="font-display text-lg font-black leading-tight text-white mb-2 line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <div className="flex items-center gap-1 text-primary">
              <Star size={12} fill="currentColor" />
              <span>{movie.rating}</span>
            </div>
            <span>•</span>
            <span>{movie.year}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
              <Play size={20} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 px-1">
          <h3 className="font-display text-[11px] md:text-sm font-bold text-white line-clamp-2 min-h-[2.2em] group-hover:text-primary transition-colors leading-[1.2]">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-[9px] md:text-[11px] font-medium text-zinc-500 mt-0.5">
            <div className="flex items-center gap-1 text-primary/80">
              <Star size={10} fill="currentColor" />
              <span>{movie.rating}</span>
            </div>
            <span className="h-0.5 w-0.5 rounded-full bg-zinc-800" />
            <span>{movie.year}</span>
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
        initial={isHydrated ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {cardContent}
      </motion.div>
    </Link>
  );
}

export default memo(MovieCard);
