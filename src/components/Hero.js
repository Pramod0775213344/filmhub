"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { slugify } from "@/utils/slugify";
import CinematicButton from "@/components/CinematicButton";
import { useAdaptive } from "@/context/AdaptiveContext";

export default function Hero({ featuredMovies }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const { isMobile } = useAdaptive();

  const nextSlide = useCallback(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      setCurrent((prev) => (prev + 1) % featuredMovies.length);
    }
  }, [featuredMovies]);

  useEffect(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      const timer = setInterval(nextSlide, 10000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, featuredMovies]);

  if (!featuredMovies || featuredMovies.length === 0) {
    return <div className="h-[100dvh] w-full bg-background" />;
  }

  const movie = featuredMovies[current];
  const movieUrl = movie.type === "TV Show" 
    ? `/tv-shows/${slugify(movie.title)}` 
    : movie.type === "Korean Drama" 
      ? `/korean-dramas/${slugify(movie.title)}`
      : `/movies/${slugify(movie.title)}`;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-[#020202] text-white">
      {/* Cinematic Texture Overlay - Desktop Only */}
      {!isMobile && (
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}
      
      {/* Ambient Background Glow - Optimized for Mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950">
        <AnimatePresence mode="wait">
          {!isMobile ? (
            <motion.div
               key={`bg-glow-${movie.id}`}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.5 }}
               className="absolute inset-0"
            >
                <Image 
                    src={movie.backdrop_url || movie.image_url} 
                    alt="" 
                    fill 
                    priority={true}
                    className="object-cover blur-[100px] scale-150 opacity-40"
                    quality={10}
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-zinc-950" />
          )}
        </AnimatePresence>
      </div>

      <div className="container-custom relative z-10 h-full pt-10 lg:pt-0">
        <div className="flex h-full flex-col justify-center lg:grid lg:grid-cols-12 items-center gap-4 lg:gap-12">
            
            {/* Left side: Digital Frame */}
            <div className="lg:col-span-5 w-full order-1 lg:order-2">
                <div className="relative group mx-auto max-w-[320px] sm:max-w-[500px]">
                    <div className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] border border-white/10 lg:border-white/20 shadow-2xl bg-zinc-900/20 backdrop-blur-3xl lg:shadow-[0_0_100px_rgba(229,9,20,0.4)]">
                        <div className="absolute inset-0 bg-zinc-900">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={movie.id}
                                    initial={isMobile ? { opacity: 0.8 } : { opacity: 0, filter: "grayscale(100%)" }}
                                    animate={{ opacity: 1, filter: "grayscale(0%)" }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0"
                                >
                                    <Image 
                                        src={movie.backdrop_url || movie.image_url} 
                                        alt={movie.title} 
                                        fill 
                                        priority={true}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 800px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Badges */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-30">
                            <div className="space-y-0.5 lg:space-y-1">
                                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Quality</p>
                                <span className="bg-primary/20 backdrop-blur-md border border-primary/40 px-2 py-0.5 lg:px-3 lg:py-1 rounded text-[10px] lg:text-xs font-black text-primary">ULTRA HD</span>
                            </div>
                            <div className="text-right space-y-0.5 lg:space-y-1">
                                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Rating</p>
                                <div className="flex items-center gap-1.5 font-black text-sm lg:text-xl">
                                    <Star size={isMobile ? 14 : 18} fill="#e50914" className="text-primary" />
                                    {movie.imdb_rating}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-4 lg:space-y-10 order-2 lg:order-1 text-center lg:text-left relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={movie.id}
                        initial={isMobile ? { opacity: 0 } : { opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-3 lg:space-y-8"
                    >
                        <div className="space-y-2 lg:space-y-4">
                            <div className="inline-flex lg:flex items-center gap-3">
                                <div className="h-px w-6 lg:w-10 bg-primary" />
                                <span className="text-primary font-black uppercase tracking-[0.6em] text-[8px] lg:text-xs">Live Spotlight</span>
                            </div>
                            <h1 className="text-2xl sm:text-5xl lg:text-8xl font-black leading-tight lg:leading-[0.9] tracking-tighter uppercase italic drop-shadow-xl lg:drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                {movie.title}
                            </h1>
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 lg:gap-3 text-[9px] lg:text-sm font-bold text-zinc-400">
                                 <span className="bg-white/10 px-2 py-0.5 lg:px-3 lg:py-1 rounded-full text-white"># {movie.year}</span>
                                 <span className="text-primary italic">සිංහල උපසිරැසි සමඟ</span>
                                 <span className="hidden lg:inline opacity-30">|</span>
                                 <span className="opacity-60">{movie.category?.split(',')[0]}</span>
                            </div>
                        </div>

                        <p className="block text-[10px] sm:text-lg lg:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-2 sm:line-clamp-3 px-4 italic lg:not-italic lg:px-0">
                            {movie.description?.length > 160 
                                ? movie.description.substring(0, 160) + "..." 
                                : movie.description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 lg:gap-4 pt-2 lg:pt-6 w-full max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
                            <CinematicButton 
                                onClick={() => router.push(`${movieUrl}#movie-player`)}
                                icon={Play}
                                variant="primary"
                                className="w-full sm:w-auto px-8 py-2.5 lg:px-10"
                            >
                                Play Now
                            </CinematicButton>

                            <CinematicButton 
                                onClick={() => router.push(movieUrl)}
                                icon={Info}
                                variant="secondary"
                                className="hidden sm:flex px-10"
                            >
                                Explore
                            </CinematicButton>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-0 right-0 lg:left-auto lg:right-12 z-20 flex justify-center lg:flex-col gap-3 lg:gap-6">
        {featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group flex items-center gap-4 relative py-2"
          >
            <div className={`transition-all duration-500 rounded-full ${current === i ? "w-8 h-1 lg:w-20 lg:h-1 bg-primary" : "w-1 h-1 lg:w-4 lg:h-1 bg-white/20"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
