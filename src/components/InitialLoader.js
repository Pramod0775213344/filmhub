"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * INSTANT-MOUNT CINEMATIC LOADER
 * Optimized for speed and hydration stability.
 */
export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    // Keep isReady true on mount to avoid hydration mismatch and show text instantly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900); 

    return () => clearTimeout(timer);
  }, []);

  // Control overflow
  useEffect(() => {
    if (isLoading) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
           key="loader-root"
           className="fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-[#050505]"
           initial={{ opacity: 1 }}
           exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          {/* 1. ATMOSPHERIC BACKDROP */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(229, 9, 20, 0.4) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* 2. LOGO ENGINE */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter text-white">
                SUBHUB <span className="text-primary" style={{ filter: "drop-shadow(0 0 15px rgba(229,9,20,0.5))" }}>SL</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] md:text-xs uppercase font-light tracking-[0.8em] text-white"
            >
              Cinematic Experience
            </motion.p>
          </div>

          {/* 3. PROGRESS BAR */}
          <div className="absolute bottom-20 flex flex-col items-center gap-3">
             <div className="w-48 md:w-64 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary"
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
