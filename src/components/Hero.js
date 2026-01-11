"use client";

import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar, Volume2, ShieldCheck } from "lucide-react";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { slugify } from "@/utils/slugify";
import CinematicButton from "@/components/CinematicButton";
import { useAdaptive } from "@/context/AdaptiveContext";

/**
 * ULTRA-OPTIMIZED HERO COMPONENT
 * Performance-focused: No framer-motion on mobile, optimized LCP
 */
function Hero({ featuredMovies }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const { isMobile } = useAdaptive();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger visibility animation after mount
  useEffect(() => {
    // Small delay to ensure image starts loading
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = useCallback(() => {
    if (featuredMovies?.length > 0) {
      setCurrent((prev) => (prev + 1) % featuredMovies.length);
    }
  }, [featuredMovies]);

  const prevSlide = useCallback(() => {
    if (featuredMovies?.length > 0) {
      setCurrent((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    }
  }, [featuredMovies]);

  useEffect(() => {
    if (featuredMovies?.length > 0) {
      const timer = setInterval(nextSlide, 8000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, featuredMovies]);

  if (!featuredMovies?.length) {
    return <div className="h-[90dvh] lg:h-[100dvh] w-full bg-[#050505]" />;
  }

  const movie = featuredMovies[current];
  const movieUrl = movie.type === "TV Show" 
    ? `/tv-shows/${slugify(movie.title)}` 
    : movie.type === "Korean Drama" 
      ? `/korean-dramas/${slugify(movie.title)}`
      : `/movies/${slugify(movie.title)}`;

  // Optimized image URL for mobile
  const backdropUrl = movie.backdrop_url || movie.image_url;
  const optimizedBackdrop = isMobile && backdropUrl?.includes('tmdb.org')
    ? backdropUrl.replace('/original/', '/w780/')
    : backdropUrl;

  return (
    <section 
      ref={containerRef}
      className="relative h-[90dvh] lg:h-[100dvh] w-full bg-[#050505] overflow-hidden"
    >
      {/* 1. BACKDROP - Optimized for LCP */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        <Image 
          src={optimizedBackdrop} 
          alt={movie.title || "Featured Movie"}
          fill 
          priority
          fetchPriority="high"
          className="object-cover brightness-[0.4] contrast-[1.1]"
          quality={isMobile ? 60 : 85}
          sizes="100vw"
          placeholder="empty"
        />
        {/* Simplified Overlays for Mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
        {/* Noise texture - hidden on mobile for performance */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] hidden md:block" />
      </div>

      {/* 2. CONTENT */}
      <div className="container-custom relative z-10 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end lg:items-center pb-16 lg:pb-32">
          
          {/* Information Section - CSS animations instead of framer-motion */}
          <div 
            className="lg:col-span-8 space-y-4 lg:space-y-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            }}
          >
            {/* Badge Group */}
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <span className="flex items-center gap-1 px-2 lg:px-3 py-1 bg-[#e50914] text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-widest rounded-sm">
                <ShieldCheck size={10} className="hidden sm:block" />
                Premium
              </span>
              <span className="px-2 lg:px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] lg:text-[10px] uppercase tracking-widest border border-white/5">
                {movie.type || "Movie"}
              </span>
              <span className="text-primary font-bold italic text-xs hidden lg:block">සිංහල උපසිරැසි සමඟ</span>
            </div>

            {/* Title - Single element, no per-word animation */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tighter uppercase italic select-none max-w-[95%]">
              {movie.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-base font-medium text-white/60">
              <div className="flex items-center gap-1.5">
                <Star size={14} fill="#e50914" className="text-primary" />
                <span className="text-white font-bold">{movie.imdb_rating || movie.rating} IMDB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{movie.year}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                <Volume2 size={14} />
                <span className="uppercase tracking-widest text-xs">Multi-Audio</span>
              </div>
            </div>

            {/* Description - Shorter on mobile */}
            <p className="max-w-xl text-sm lg:text-base text-white/40 font-light leading-relaxed line-clamp-2">
              {movie.description}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 lg:gap-4 pt-2 lg:pt-6">
              <CinematicButton 
                onClick={() => router.push(`${movieUrl}#movie-player`)}
                icon={Play}
                variant="primary"
                triggerAd={true}
                className="px-6 lg:px-12 py-3 lg:py-4 text-sm lg:text-base"
              >
                <span className="hidden sm:inline">Experience Now</span>
                <span className="sm:hidden">Watch</span>
              </CinematicButton>
              <button 
                onClick={() => router.push(movieUrl)}
                className="h-10 w-10 lg:h-14 lg:w-14 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all active:scale-95"
              >
                <Info size={18} className="lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>

          {/* Visual Decorator - Desktop Only, simplified */}
          <div className="hidden lg:col-span-4 lg:flex justify-end pr-12">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150" />
              <p className="text-[10px] font-black uppercase tracking-[1.5em] translate-x-1/2 vertical-text text-white/10">
                SUBHUBSL PREMIUM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION - Simplified for mobile */}
      <div className="absolute bottom-4 lg:bottom-8 left-0 right-0 z-30">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 lg:gap-12">
            
            {/* Pagination Dots (Mobile) / Thumbnails (Desktop) */}
            <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar py-2 flex-1">
              {featuredMovies.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`group relative flex-shrink-0 transition-all duration-500 ${
                    isMobile 
                      ? `h-1.5 rounded-full ${current === i ? "w-8 bg-primary" : "w-1.5 bg-white/30"}`
                      : current === i ? "w-48 lg:w-56" : "w-20 lg:w-28"
                  }`}
                >
                  {/* Desktop thumbnails */}
                  {!isMobile && (
                    <>
                      <div className={`
                        relative aspect-video w-full rounded overflow-hidden border transition-all duration-300
                        ${current === i ? "border-primary opacity-100 shadow-lg shadow-primary/20" : "border-white/10 opacity-50 hover:opacity-80"}
                      `}>
                        <Image 
                          src={m.backdrop_url || m.image_url} 
                          alt={m.title} 
                          fill 
                          className="object-cover"
                          sizes="200px"
                          loading="lazy"
                        />
                        {current === i && (
                          <div className="absolute bottom-0 left-0 h-[2px] bg-primary animate-timer-bar" 
                               style={{ animationDuration: '8s' }} />
                        )}
                      </div>
                      <p className={`
                        mt-1.5 text-[8px] font-bold uppercase tracking-wider truncate transition-colors
                        ${current === i ? "text-white" : "text-white/30"}
                      `}>
                        {m.title}
                      </p>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden lg:flex items-center gap-2 pb-6">
              <button 
                onClick={prevSlide}
                aria-label="Previous slide"
                className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextSlide}
                aria-label="Next slide"
                className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-32 lg:h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
    </section>
  );
}

export default memo(Hero);
