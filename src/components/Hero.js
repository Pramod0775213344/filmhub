"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
export default function Hero({ featuredMovies }) {
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
    return <div className="h-[100vh] w-full bg-background" />;
  }

  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
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
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${featuredMovies[current].backdrop_url || featuredMovies[current].image_url || featuredMovies[current].image}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
          </motion.div>

          {/* Content */}
          <div className="container-custom relative flex h-full flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-3xl space-y-10"
            >
             
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="font-display text-6xl font-black leading-[0.9] tracking-tighter text-white md:text-8xl lg:text-9xl"
              >
                {featuredMovies[current].title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-primary italic" : "text-gradient"}>
                    {word}{" "}
                  </span>
                ))}
              </motion.h1>

              <p className="max-w-xl text-lg font-medium leading-relaxed text-zinc-400 md:text-xl">
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
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <button className="cinematic-glow group relative flex items-center gap-4 overflow-hidden rounded-full bg-primary px-12 py-5 text-lg font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95">
                  <Play size={24} fill="currentColor" />
                  <span>Play Now</span>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all group-hover:h-full group-hover:bg-white/10" />
                </button>
                <button className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-white/5 px-12 py-5 text-lg font-black uppercase tracking-widest text-white backdrop-blur-2xl transition-all hover:bg-white/10 active:scale-95 border border-white/10">
                  <Info size={24} />
                  <span>Details</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-20 flex items-center gap-4">
        <button 
          onClick={prevSlide}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={nextSlide}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-12 left-12 z-20 flex gap-3">
        {featuredMovies && featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
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

