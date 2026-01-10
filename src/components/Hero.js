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
  const { isMobile, isHydrated } = useAdaptive();
  const mobileView = isMobile && isHydrated;

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
      {/* 1. LAYER: Ambient Motion Background - Optimized for speed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${movie.id}`}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "linear" }}
            className="absolute inset-0"
          >
            <Image 
              src={movie.backdrop_url || movie.image_url} 
              alt="" 
              fill 
              priority
              className="object-cover opacity-60 brightness-50 md:opacity-50"
              quality={1} // Very low quality for ambient light
              sizes="10vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent lg:bg-gradient-to-b lg:from-black/80 lg:via-transparent lg:to-[#020202]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/90 via-transparent to-transparent lg:hidden" />
      </div>

      {/* 2. LAYER: Giant Background Typography - Parallel animations (Desktop Only for speed) */}
      <div className="absolute inset-0 z-1 hidden lg:flex items-center justify-center pointer-events-none overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.h2
            key={`title-bg-${movie.id}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 0.05, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-[20vw] font-black uppercase italic tracking-tighter whitespace-nowrap text-white select-none leading-none"
          >
            {movie.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* 3. LAYER: Main Interactive Content */}
      <div className="container-custom relative z-10 h-full flex items-start lg:items-center pt-20 lg:pt-0 overflow-y-auto lg:overflow-visible no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full items-center gap-4 lg:gap-16 pb-44 lg:pb-40">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 order-2 lg:order-1 space-y-3 lg:space-y-10 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${movie.id}`}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2.5 lg:space-y-8"
              >
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-px w-12 bg-primary hidden lg:block origin-left" 
                  />
                  <span className="text-primary font-black uppercase tracking-[0.5em] text-[8px] lg:text-xs bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
                    Live Spotlight
                  </span>
                </div>

                <h1 className="text-5xl sm:text-5xl lg:text-9xl font-black leading-[0.9] lg:leading-[0.9] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] line-clamp-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 lg:gap-3 text-[9px] lg:text-sm font-bold text-zinc-400">
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    <Star size={14} fill="#e50914" className="text-primary w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />
                    <span className="text-white text-[10px] lg:text-sm">{movie.imdb_rating}</span>
                  </div>
                  <span className="bg-primary px-2.5 py-1 rounded-lg text-white text-[10px] lg:text-sm"># {movie.year}</span>
                  <span className="italic text-primary hidden sm:inline">සිංහල උපසිරැසි සමඟ</span>
                  <span className="opacity-40 hidden lg:inline">|</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg uppercase tracking-widest text-[8px] lg:text-sm">{movie.category?.split(',')[0]}</span>
                </div>

                <p className="text-sm sm:text-lg lg:text-xl text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-2 px-2 lg:px-0 opacity-90 drop-shadow-md">
                  {movie.description}
                </p>

                <div className="flex flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-4 lg:pt-6">
                  <CinematicButton 
                    onClick={() => router.push(`${movieUrl}#movie-player`)}
                    icon={Play}
                    variant="primary"
                    triggerAd={true}
                    className="flex-1 sm:flex-initial px-4 sm:px-12 py-3 lg:py-4 text-[10px] sm:text-base"
                  >
                    Play Now
                  </CinematicButton>
                  <button 
                    onClick={() => router.push(movieUrl)}
                    className="flex-1 sm:flex-initial group flex items-center justify-center gap-2 px-4 sm:px-8 py-3 lg:py-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[9px] lg:text-[10px]"
                  >
                    <Info size={16} className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="truncate">View Details</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Perspective Frame Column - Simplified for Mobile */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`poster-${movie.id}`}
                initial={{ opacity: 0, rotateY: 30, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, rotateY: -15, scale: 1, x: 0 }}
                exit={{ opacity: 0, rotateY: -45, scale: 0.9, x: -50 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative group lg:perspective-[2000px]"
              >
                {/* 3D Poster Stack Design */}
                <div className="relative w-[55vw] sm:w-[50vw] max-w-[260px] lg:w-[380px] lg:max-w-none aspect-[2/3] transform-gpu">
                  {/* Outer Glow */}
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] lg:blur-[100px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  {/* Layers for Depth (Reduced for mobile performance) */}
                  <div className="absolute inset-2 -right-2 -bottom-2 lg:inset-4 lg:-right-4 lg:-bottom-4 border border-white/10 rounded-[1.5rem] lg:rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-2xl z-0" />
                  
                  {/* Main Poster Container */}
                  <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] lg:rounded-[2.5rem] border border-white/10 lg:border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] lg:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 lg:ring-white/10 z-10">
                    <Image 
                      src={movie.image_url || movie.backdrop_url} 
                      alt={movie.title} 
                      fill 
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 40vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    
                    {/* Floating Info inside Frame (Hidden on smallest mobile for cleaner look) */}
                    <div className="absolute bottom-3 left-3 right-3 lg:bottom-6 lg:left-6 lg:right-6 flex justify-between items-end">
                      <div className="h-1 w-1 lg:h-2 lg:w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(229,9,20,1)]" />
                      <div className="text-right hidden sm:block">
                        <p className="text-[7px] lg:text-[10px] font-black uppercase text-zinc-400 tracking-tighter">Resolution</p>
                        <p className="text-[9px] lg:text-xs font-black text-white uppercase">4K Ultra HD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. LAYER: Interactive Navigation Timeline */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-30 border-t border-white/5 bg-gradient-to-t from-black to-transparent backdrop-blur-md pt-6 sm:pt-8 pb-2 sm:pb-0">
        <div className="container-custom">

          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-1.5 lg:gap-3 overflow-x-auto no-scrollbar py-2 sm:py-4 w-full">
              {featuredMovies.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setCurrent(i)}
                  className={`group relative flex-shrink-0 transition-all duration-500 ${
                    current === i ? "w-20 lg:w-48" : "w-10 lg:w-20"
                  }`}
                >
                  <div className="relative aspect-video w-full rounded-lg lg:rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    <Image 
                      src={m.backdrop_url || m.image_url} 
                      alt={m.title} 
                      fill 
                      className={`object-cover transition-all duration-700 ${current === i ? "scale-100 opacity-100" : "scale-125 opacity-30 grayscale group-hover:opacity-60"}`}
                      sizes="200px"
                    />
                    {current === i && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 border-2 border-primary rounded-lg lg:rounded-xl z-10" 
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
               <button 
                  onClick={() => setCurrent((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
               >
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
               </button>
               <button 
                  onClick={nextSlide}
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
               >
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Borders */}
      <div className="absolute top-0 inset-x-0 h-20 lg:h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/50 to-transparent pointer-events-none z-20 hidden lg:block" />
    </section>
  );
}
