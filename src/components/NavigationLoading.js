"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

export default function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      let timer;
      const frame = requestAnimationFrame(() => {
        setLoading(true);
        setPrevPath(pathname);
        
        timer = setTimeout(() => {
          setLoading(false);
        }, 600);
      });

      return () => {
        cancelAnimationFrame(frame);
        if (timer) clearTimeout(timer);
      };
    }
  }, [pathname, searchParams, prevPath]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Spinning Ring */}
              <div className="absolute inset-0 -m-3 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"></div>
              </div>
              
              {/* Logo */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_30px_rgba(229,9,20,0.5)]">
                <Play size={24} fill="white" className="text-white ml-0.5" />
              </div>
            </motion.div>

            {/* Cinematic Text */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
               <h2 className="font-display text-xl font-black tracking-tighter text-white">
                FILM<span className="text-primary italic">HUB</span>
              </h2>
              <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.8, 
                    ease: "linear" 
                  }}
                  className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
