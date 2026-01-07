"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { slugify } from "@/utils/slugify";
import CinematicButton from "@/components/CinematicButton";

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
      {/* Cinematic Texture Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Ambient Background Glow (Synchronized with Movie) */}
      <AnimatePresence mode="wait">
        <motion.div
           key={`bg-glow-${movie.id}`}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0 z-0"
        >
            <Image 
                src={movie.backdrop_url || movie.image_url} 
                alt="" 
                fill 
                priority={true}
                className="object-cover blur-[100px] scale-150 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        </motion.div>
      </AnimatePresence>

      <div className="container-custom relative z-10 h-full pt-20 lg:pt-0">
        <div className="flex h-full flex-col justify-center lg:grid lg:grid-cols-12 items-center gap-4 lg:gap-12">
            
            {/* Left side: Digital Frame (Now visible on Mobile with optimized scale) */}
            <div className="lg:col-span-5 w-full order-1 lg:order-2">
                <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative group mx-auto max-w-[320px] sm:max-w-[500px] lg:max-w-none"
                >
                    {/* HUD Active Frame */}
                    <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900/20 backdrop-blur-3xl">
                        
                        {/* Dynamic Scanning Elements */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-primary/60" />
                            <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-primary/60" />
                            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-primary/60" />
                            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-primary/60" />
                            
                            <motion.div 
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[1px] bg-primary/40 shadow-[0_0_15px_rgba(229,9,20,0.8)]"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={movie.id}
                                initial={{ opacity: 0, filter: "grayscale(100%)" }}
                                animate={{ opacity: 1, filter: "grayscale(0%)" }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0"
                            >
                                <Image 
                                    src={movie.backdrop_url || movie.image_url} 
                                    alt={movie.title} 
                                    fill 
                                    priority={true}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Mobile Info Overlay (Floating Badges) */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-30">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Quality</p>
                                <span className="bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-1 rounded text-xs font-black text-primary">ULTRA HD</span>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Rating</p>
                                <div className="flex items-center gap-2 font-black text-xl">
                                    <Star size={18} fill="#e50914" className="text-primary" />
                                    {movie.imdb_rating}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-10 order-2 lg:order-1 text-center lg:text-left">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4 sm:space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex lg:flex items-center gap-3">
                                <div className="h-px w-6 sm:w-10 bg-primary" />
                                <span className="text-primary font-black uppercase tracking-[0.6em] text-[10px] sm:text-xs">Live Spotlight</span>
                            </div>
                            <h1 className="text-3xl sm:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                {movie.title}
                            </h1>
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-[10px] sm:text-sm font-bold text-zinc-400">
                                 <span className="bg-white/10 px-3 py-1 rounded-full text-white"># {movie.year}</span>
                                 <span className="text-primary italic">සිංහල උපසිරැසි සමඟ</span>
                                 <span className="hidden sm:inline opacity-30">|</span>
                                 <span className="opacity-60">{movie.category?.split(',')[0]}</span>
                            </div>
                        </div>

                        <p className="text-sm sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-2 sm:line-clamp-3">
                            {movie.description}
                        </p>

                        {/* Futuristic Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-4 sm:pt-6">
                            <CinematicButton 
                                onClick={() => router.push(`${movieUrl}#movie-player`)}
                                icon={Play}
                                variant="primary"
                                className="px-10"
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

      {/* Modern Navigation Controls (Mobile Friendly) */}
      <div className="absolute bottom-8 left-0 right-0 lg:left-auto lg:right-12 z-20 flex justify-center lg:flex-col gap-6">
        {featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group flex items-center gap-4 relative"
          >
            <div className={`transition-all duration-500 rounded-full ${current === i ? "w-12 h-1.5 lg:w-20 lg:h-1 bg-primary" : "w-1.5 h-1.5 lg:w-4 lg:h-1 bg-white/20 group-hover:bg-white/40"}`} />
            <span className={`hidden lg:block text-[10px] font-black tracking-[0.2em] transition-opacity duration-300 ${current === i ? "opacity-100 text-primary" : "opacity-0"}`}>
              STEP_0{i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Cinematic Borders Overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none ring-1 ring-inset ring-white/5" />
    </section>
  );
}
