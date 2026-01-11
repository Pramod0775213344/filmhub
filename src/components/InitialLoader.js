"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * INSTANT-MOUNT CINEMATIC LOADER
 * This version is designed to be part of the initial SSR payload 
 * so it appears the EXACT MILLISECOND the page starts loading.
 */
export default function InitialLoader() {
  // We keep isLoading true by default. 
  // Since this component is SSR-friendly now, it will render on the server too.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent scrolling during load
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "unset";
    }, 800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-root"
          className="fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
          }}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'opacity' 
          }}
        >
          {/* 1. ATMOSPHERIC BACKDROP */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             {/* GPU-Accelerated Radial Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[900px] max-h-[900px] opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(229, 9, 20, 0.5) 0%, transparent 70%)",
              }}
            />
            {/* Minimal Hardware-Accelerated Grid */}
            <div 
              className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* 2. LOGO ENGINE */}
          <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Main Branding */}
              <h1 className="font-display text-6xl md:text-9xl font-black tracking-tighter text-white">
                SUBHUB <span className="text-[#e50914]" style={{ filter: "drop-shadow(0 0 25px rgba(229,9,20,0.5))" }}>SL</span>
              </h1>
              
              {/* Premium Shimmer Pulse */}
              <motion.div
                initial={{ x: "-150%", opacity: 0 }}
                animate={{ x: "150%", opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]"
              />
            </motion.div>

            {/* Sub-tagline with animation */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 0.5, letterSpacing: "1.2em" }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#e50914] to-transparent" />
              <p className="text-[10px] md:text-xs uppercase font-light text-white whitespace-nowrap">
                Premium Cinematic Portal
              </p>
            </motion.div>
          </div>

          {/* 3. STEALTH PROGRESS BAR */}
          <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-4">
             <div className="w-56 md:w-80 h-[1.5px] bg-white/5 relative overflow-hidden rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
                  className="absolute inset-0 bg-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.8)]"
                />
             </div>
             <motion.span 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.3 }}
               transition={{ delay: 1 }}
               className="text-[8px] font-medium tracking-[0.5em] text-white uppercase"
             >
                Initializing Engine
             </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
