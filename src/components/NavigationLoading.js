"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

export default function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Use a small delay to move state updates out of the synchronous effect body.
    // This prevents the "cascading renders" error by deferring the update to the next tick.
    const startTimer = setTimeout(() => {
      setActive(true);
      setLoading(true);
    }, 0);

    // Ensure it stays visible for at least 800ms for a "cinematic" feel
    const timer = setTimeout(() => {
      setLoading(false);
      // Wait for exit animation to finish before allowing another load
      setTimeout(() => setActive(false), 300);
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  if (!active) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#020202] backdrop-blur-md"
        >
          {/* Background Cinematic Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* Spinning Ring */}
              <div className="absolute inset-0 -m-3 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"></div>
              </div>
              
              {/* Logo */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_rgba(229,9,20,0.6)]">
                <Play size={24} fill="white" className="text-white ml-0.5" />
              </div>
            </motion.div>

            {/* Cinematic Text */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <h2 className="font-display text-2xl font-black tracking-tighter text-white">
                FILM<span className="text-primary italic">HUB</span>
              </h2>
              
              {/* Progress Bar */}
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    ease: "easeInOut" 
                  }}
                  className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse mt-2">
                Loading Cinematic Experience
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
