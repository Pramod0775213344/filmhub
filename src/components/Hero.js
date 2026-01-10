"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar, Volume2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { slugify } from "@/utils/slugify";
import CinematicButton from "@/components/CinematicButton";
import { useAdaptive } from "@/context/AdaptiveContext";

/**
 * ULTRA-PREMIUM "CINEMATIC SPOTLIGHT" HERO
 * Re-imagined for an immersive, edge-to-edge experience.
 * Focus: High-resolution visuals, minimalist typography, and fluid transitions.
 */
export default function Hero({ featuredMovies }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const { isMobile, isHydrated } = useAdaptive();
  const containerRef = useRef(null);

  const nextSlide = useCallback(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      setCurrent((prev) => (prev + 1) % featuredMovies.length);
    }
  }, [featuredMovies]);

  const prevSlide = useCallback(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      setCurrent((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    }
  }, [featuredMovies]);

  useEffect(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      const timer = setInterval(nextSlide, 8000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, featuredMovies]);

  if (!featuredMovies || featuredMovies.length === 0) {
    return <div className="h-[100dvh] w-full bg-[#050505]" />;
  }

  const movie = featuredMovies[current];
  const movieUrl = movie.type === "TV Show" 
    ? `/tv-shows/${slugify(movie.title)}` 
    : movie.type === "Korean Drama" 
      ? `/korean-dramas/${slugify(movie.title)}`
      : `/movies/${slugify(movie.title)}`;

  return (
    <section 
      ref={containerRef}
      className="relative h-[90dvh] lg:h-[100dvh] w-full bg-[#050505] overflow-hidden"
    >
      {/* 1. LAYER: Immersive Kinetic Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`backdrop-${movie.id}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={movie.backdrop_url || movie.image_url} 
            alt="" 
            fill 
            priority
            className="object-cover brightness-[0.4] contrast-[1.1]"
            quality={90}
            sizes="100vw"
          />
          {/* Complex Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </motion.div>
      </AnimatePresence>

      {/* 2. LAYER: Dynamic Content Layout */}
      <div className="container-custom relative z-10 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end lg:items-center pb-20 lg:pb-32">
          
          {/* Information Section */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${movie.id}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="space-y-4 lg:space-y-8"
              >
                {/* Badge Group */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#e50914] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">
                    <ShieldCheck size={12} />
                    Verified Premium
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-widest border border-white/5">
                    {movie.type || "Movie"}
                  </span>
                  <div className="h-4 w-[1px] bg-white/20 mx-1 hidden lg:block" />
                  <span className="text-primary font-black italic hidden lg:block">සිංහල උපසිරැසි සමඟ</span>
                </div>

                {/* Massive Title */}
                <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter uppercase italic select-none max-w-[95%]">
                  {movie.title.split(' ').map((word, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block mr-[1rem]"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-xs lg:text-lg font-medium text-white/60">
                   <div className="flex items-center gap-2">
                      <Star size={16} fill="#e50914" className="text-primary" />
                      <span className="text-white font-bold">{movie.imdb_rating} IMDB</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{movie.year} Release</span>
                   </div>
                   <div className="hidden lg:flex items-center gap-2">
                      <Volume2 size={16} />
                      <span className="uppercase tracking-widest">Multi-Audio</span>
                   </div>
                </div>

                {/* Description - Optimized for readability */}
                <p className="max-w-xl text-sm lg:text-lg text-white/40 font-light leading-relaxed line-clamp-2 lg:line-clamp-3">
                  {movie.description}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-4 pt-4 lg:pt-8">
                  <CinematicButton 
                    onClick={() => router.push(`${movieUrl}#movie-player`)}
                    icon={Play}
                    variant="primary"
                    triggerAd={true}
                    className="px-8 lg:px-14 py-4 lg:py-5"
                  >
                    Experience Now
                  </CinematicButton>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(movieUrl)}
                    className="h-12 w-12 lg:h-16 lg:w-16 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors"
                  >
                    <Info size={24} />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hidden Visual Decorator (Large Devices Only) */}
          <div className="hidden lg:col-span-4 lg:flex justify-end pr-12">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full scale-150" />
                <motion.div 
                  initial={{ rotate: 10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <p className="text-[12px] font-black uppercase tracking-[2em] translate-x-1/2 vertical-text text-white/10">
                    SUBHUBSL PREMIUM CONTENT
                  </p>
                </motion.div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. LAYER: Master Navigation Control */}
      <div className="absolute bottom-8 left-0 right-0 z-30">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-12">
            
            {/* Visual Pagination List */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4 px-2 -mx-2 flex-1">
              {featuredMovies.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setCurrent(i)}
                  className={`group relative flex-shrink-0 transition-all duration-700 ${
                    current === i ? "w-32 lg:w-64" : "w-16 lg:w-32"
                  }`}
                >
                  <div className={`
                    relative aspect-[16/9] w-full rounded-sm overflow-hidden border transition-all duration-500
                    ${current === i ? "border-primary opacity-100 scale-105 shadow-[0_0_30px_rgba(229,9,20,0.3)]" : "border-white/5 opacity-40 hover:opacity-100"}
                  `}>
                    <Image 
                      src={m.backdrop_url || m.image_url} 
                      alt={m.title} 
                      fill 
                      className="object-cover"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    {current === i && (
                       <div className="absolute bottom-0 left-0 h-[2px] bg-primary animate-timer-bar" 
                            style={{ animationDuration: '8s' }} />
                    )}
                  </div>
                  <p className={`
                    mt-2 text-[8px] font-bold uppercase tracking-widest truncate transition-colors
                    ${current === i ? "text-white" : "text-white/20 group-hover:text-white/60"}
                  `}>
                    {m.title}
                  </p>
                </button>
              ))}
            </div>

            {/* Steppers */}
            <div className="hidden lg:flex items-center gap-3 pb-8">
               <button 
                  onClick={prevSlide}
                  className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 group"
               >
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
               </button>
               <button 
                  onClick={nextSlide}
                  className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 group"
               >
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Vignette Overrides */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
      
      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        @keyframes timer-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-timer-bar {
          animation-name: timer-bar;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </section>
  );
}
