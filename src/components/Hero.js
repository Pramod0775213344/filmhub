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
      <AnimatePresence mode="wait">
        <motion.div
          key={featuredMovies[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10 }}
            className="absolute inset-0"
          >
             <Image
              src={featuredMovies[current].backdrop_url || featuredMovies[current].image_url || featuredMovies[current].image}
              alt={featuredMovies[current].title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
             />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
          </motion.div>

          {/* Content */}
          <div className="container-custom relative flex h-full flex-col justify-center pt-24 pb-20 md:pb-0 md:pt-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-3xl space-y-4 md:space-y-8"
            >
             
              <motion.h1 
                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className={`font-display font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl line-clamp-2 ${getTitleSizeClass(featuredMovies[current].title)}`}
              >
                {featuredMovies[current].title}
                <span className="block text-base md:text-2xl font-bold text-zinc-300 mt-2 tracking-normal">| සිංහල උපසිරැසි සමඟ</span>
              </motion.h1>

              <p className="max-w-xl text-base font-medium leading-relaxed text-zinc-400 md:text-xl line-clamp-3 md:line-clamp-4">
                {featuredMovies[current].description}
              </p>
 <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-6 py-2.5 text-sm font-black tracking-widest text-yellow-500 backdrop-blur-md border border-yellow-500/20">
                  <Star size={18} fill="currentColor" />
                  IMDb {featuredMovies[current].imdb_rating || "N/A"}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-black tracking-widest text-white backdrop-blur-md border border-white/10">
                  <Calendar size={18} />
                  {featuredMovies[current].year}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-6 md:gap-6">
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
                        className="cinematic-glow group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-full bg-primary px-6 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95 sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
                        aria-label={`Play ${currentMovie.title}`}
                      >
                        <Play size={24} fill="currentColor" />
                        <span>Play Now</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all group-hover:h-full group-hover:bg-white/10" />
                      </button>
                      <button 
                        onClick={() => router.push(movieUrl)}
                        className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-full bg-white/5 px-6 py-4 text-base font-black uppercase tracking-widest text-white backdrop-blur-2xl transition-all hover:bg-white/10 active:scale-95 border border-white/10 sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
                        aria-label="View details"
                      >
                        <Info size={24} />
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

