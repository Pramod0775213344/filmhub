"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Slightly shorter duration for a snappy feel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } // Custom easing
          }}
        >
          {/* Ambient Background Glow */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.4 }}
             transition={{ duration: 2 }}
             className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#050505] to-[#050505]"
          />

          <div className="relative z-10">
            {/* Mask Container for Light Sweep Effect */}
            <div className="relative overflow-hidden p-4">
              
              {/* The Text */}
              <motion.h1 
                initial={{ opacity: 0, y: 20, letterSpacing: "0.5em", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.15em", filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="font-display text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40"
              >
                FILMHUB
              </motion.h1>

              {/* Light Sweep Overlay (The "Premium" Shine) */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut", 
                  delay: 0.8, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                style={{ mixBlendMode: "overlay" }}
              />
            </div>

            {/* Reflection Effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute top-full left-0 right-0 transform -scale-y-100 origin-top"
            >
               <h1 className="font-display text-4xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-20 blur-[2px] tracking-[0.15em]">
                FILMHUB
              </h1>
            </motion.div>

            {/* Cinematic Line expand */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#e50914] to-transparent w-full mt-8 opacity-50"
            />
            
            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.6 }}
               transition={{ delay: 1.5, duration: 1 }}
               className="text-center mt-4 text-[10px] uppercase tracking-[0.6em] text-white font-light"
            >
              Premium Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
