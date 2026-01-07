"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { slugify } from "@/utils/slugify";

export default function Hero({ featuredMovies }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      setCurrent((prev) => (prev + 1) % featuredMovies.length);
    }
  }, [featuredMovies]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  useEffect(() => {
    if (featuredMovies && featuredMovies.length > 0) {
      const timer = setInterval(nextSlide, 8000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, featuredMovies]);

  if (!featuredMovies || featuredMovies.length === 0) {
    return <div className="h-[100dvh] w-full bg-background" />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={featuredMovies[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1, filter: "blur(20px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
             <Image
              src={featuredMovies[current].backdrop_url || featuredMovies[current].image_url || featuredMovies[current].image}
              alt={featuredMovies[current].title}
              fill
              priority
              className="object-cover object-center sm:object-[center_20%]"
              sizes="100vw"
              quality={90}
             />
            {/* Dynamic Gradients: Lightened for Mobile */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-background md:bg-gradient-to-r md:from-background md:via-black/40 md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
          </motion.div>

          {/* Content */}
          <div className="container-custom relative flex h-full flex-col justify-center pt-24 pb-20 md:pb-0 md:pt-32">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-4xl space-y-4 md:space-y-8"
            >
             
              <motion.h1 
                initial={{ opacity: 0, x: -30, filter: "blur(15px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                className={`font-display font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl line-clamp-3 ${getTitleSizeClass(featuredMovies[current].title)}`}
              >
                {featuredMovies[current].title}
                <span className="block text-sm sm:text-lg md:text-2xl font-bold text-zinc-300 mt-2 tracking-normal opacity-80">| සිංහල උපසිරැසි සමඟ</span>
              </motion.h1>

              <p className="max-w-xl text-sm font-medium leading-relaxed text-zinc-400 md:text-xl line-clamp-2 md:line-clamp-4 opacity-80">
                {featuredMovies[current].description}
              </p>
 <div className="flex items-center gap-2 md:gap-3">
                <span className="flex items-center gap-1.5 md:gap-2 rounded-full bg-yellow-500/10 px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-sm font-black tracking-widest text-yellow-500 backdrop-blur-md border border-yellow-500/20">
                  <Star size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                  IMDb {featuredMovies[current].imdb_rating || "N/A"}
                </span>
                <span className="flex items-center gap-1.5 md:gap-2 rounded-full bg-white/10 px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-sm font-black tracking-widest text-white backdrop-blur-md border border-white/10">
                  <Calendar size={14} className="md:w-[18px] md:h-[18px]" />
                  {featuredMovies[current].year}
                </span>
              </div>
              <div className="flex flex-wrap shadow-2xl items-center gap-3 md:gap-6 pt-4 md:pt-6">
                {(() => {
                  const currentMovie = featuredMovies[current];
                  const movieUrl = currentMovie.type === "TV Show" 
                    ? `/tv-shows/${slugify(currentMovie.title)}` 
                    : currentMovie.type === "Korean Drama" 
                      ? `/korean-dramas/${slugify(currentMovie.title)}`
                      : `/movies/${slugify(currentMovie.title)}`;

                  return (
                    <>
                      <button 
                        onClick={() => router.push(`${movieUrl}#movie-player`)}
                        className="cinematic-glow group relative flex w-full sm:w-auto items-center justify-center gap-3 md:gap-4 overflow-hidden rounded-full bg-primary px-8 md:px-12 py-3.5 md:py-5 text-xs md:text-lg font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-primary-hover hover:scale-105 active:scale-95"
                        aria-label={`Play ${currentMovie.title}`}
                      >
                        <Play size={18} className="md:w-6 md:h-6" fill="currentColor" />
                        <span>Play Now</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all group-hover:h-full group-hover:bg-white/10" />
                      </button>
                      <button 
                        onClick={() => router.push(movieUrl)}
                        className="group relative flex w-full sm:w-auto items-center justify-center gap-3 md:gap-4 overflow-hidden rounded-full bg-white/5 px-8 md:px-12 py-3.5 md:py-5 text-xs md:text-lg font-black uppercase tracking-[0.2em] text-white backdrop-blur-2xl transition-all hover:bg-white/10 hover:scale-105 active:scale-95 border border-white/10"
                        aria-label="View details"
                      >
                        <Info size={18} className="md:w-6 md:h-6" />
                        <span>Details</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4 md:bottom-12 md:right-12">
        <button 
          onClick={prevSlide}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:text-white md:h-14 md:w-14"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="md:w-8 md:h-8"/>
        </button>
        <button 
          onClick={nextSlide}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:text-white md:h-14 md:w-14"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="md:w-8 md:h-8"/>
        </button>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-8 left-6 z-20 flex gap-3 md:bottom-12 md:left-12">
        {featuredMovies && featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              current === i ? "w-12 bg-primary" : "w-6 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Hero Bottom Overlay */}
      <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function getTitleSizeClass(title) {
  if (!title) return "text-3xl sm:text-6xl md:text-8xl lg:text-9xl";
  const length = title.length;
  
  if (length > 40) {
    return "text-xl sm:text-4xl md:text-5xl lg:text-6xl";
  }
  if (length > 20) {
    return "text-2xl sm:text-5xl md:text-6xl lg:text-7xl";
  }
  return "text-3xl sm:text-6xl md:text-8xl lg:text-9xl";
}

