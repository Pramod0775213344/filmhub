"use client";

import { memo, useState, useEffect } from "react";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/utils/slugify";
import WatchlistStatus from "./WatchlistStatus";

function MovieCard({ movie }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check once on mount
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    // Optimized resize listener
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(check, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Performance: Completely bypass motion on mobile to save main-thread JS
  const motionProps = isMobile ? {} : {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    whileHover: { scale: 1.05, zIndex: 10 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

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
        {...motionProps}
        className="group relative w-full cursor-pointer touch-manipulation"
      >
        <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-lg md:shadow-2xl relative transition-all duration-300 md:group-hover:ring-2 md:group-hover:ring-primary/50" style={{ aspectRatio: '2/3' }}>
          {/* Movie Image - Optimized sizes for mobile */}
          <Image
            src={(movie.image_url || movie.image)?.replace('/w500/', '/w342/')}
            alt={movie.title}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 md:group-hover:scale-110"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 12vw"
          />

          {/* Heavy Gradient Overlay (Desktop Only) */}
          {!isMobile && (
            <div className="movie-card-gradient absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block" />
          )}

          {/* Badges Container - Compact on mobile */}
          <div className="absolute left-2 top-2 md:left-3 md:top-3 flex flex-col gap-1.5 z-20">
             {movie.latest_episode && (
                <span className="flex items-center justify-center rounded bg-green-600 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-bold tracking-wide text-white shadow-md">
                   S{movie.latest_episode.season} | E{movie.latest_episode.episode}
                </span>
             )}
             
             {(movie.language || "Sinhala") && (
               <span className="self-start rounded bg-blue-600 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-bold tracking-wide text-white shadow-md border border-white/10">
                 {movie.language || "Sinhala"}
               </span>
             )}
          </div>

          <div className="absolute right-2 top-2 md:right-3 md:top-3 flex flex-col gap-1.5 z-20">
             {movie.type === "Upcoming" ? (
               <span className="self-end rounded bg-orange-600 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-bold tracking-wide text-white shadow-md border border-white/10">
                 Soon
               </span>
             ) : (
               <span className="self-end rounded bg-purple-600 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-bold tracking-wide text-white shadow-md border border-white/10">
                 {movie.quality || "FHD"}
               </span>
             )}
          </div>

          {/* Info Overlay (Desktop Hover Only) */}
          <div className="absolute inset-0 hidden flex-col justify-end p-5 opacity-0 transition-all duration-500 md:flex md:group-hover:opacity-100 md:group-hover:translate-y-0 md:translate-y-6">
            <h3 className="font-display text-lg font-black leading-tight text-white mb-2 line-clamp-2">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
              <div className="flex items-center gap-1.5 text-primary">
                <Star size={12} fill="currentColor" />
                <span>{movie.rating}</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>{movie.year}</span>
            </div>

            <div className="mt-4 flex items-center gap-3 scale-90 origin-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
                <Play size={20} fill="currentColor" />
              </div>
              <WatchlistStatus movieId={movie.id} initialStatus={movie.isInWatchlist} />
            </div>
          </div>
        </div>

        {/* Info Below Image (Compact on mobile) */}
        <div className="mt-2.5 px-0.5">
            <h3 className="font-display text-xs md:text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 mt-1">
              <div className="flex items-center gap-1 text-primary/80">
                <Star size={9} fill="currentColor" />
                <span>{movie.rating}</span>
              </div>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-800" />
              <span>{movie.year}</span>
            </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default memo(MovieCard);
