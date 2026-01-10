"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
      transition: { 
        duration: 0.8, 
        ease: "easeInOut",
        when: "afterChildren"
      }
    }
  };

  const letterContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 5, // Fly through effect
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0, 
      y: 50,
      rotateX: -90
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      rotateX: 0,
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 100 
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#020202] overflow-hidden"
          variants={containerVariants}
          initial="initial"
          animate="visible"
          exit="exit"
        >
          <div className="relative z-10 flex flex-col items-center justify-center p-4">
            {/* Cinematic Glow Background */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 0.4, scale: 1 }}
               transition={{ duration: 2, ease: "easeOut" }}
               className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"
            />

            {/* Main Text Container */}
            <motion.div
              variants={letterContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative flex items-center justify-center"
            >
              <div className="flex space-x-2 md:space-x-4">
                {"SUBHUB SL".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className={`font-display text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 ${char === " " ? "w-4 md:w-8" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Shimmer Overlay */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "150%", opacity: 1 }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut", 
                  delay: 1.8 
                }}
                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                style={{ mixBlendMode: "overlay" }}
              />
            </motion.div>

            {/* Decorative Lines and Subtitle */}
            <div className="absolute top-24 md:top-32 w-full flex flex-col items-center">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "200px", opacity: 1 }}
                exit={{ width: "0px", opacity: 0 }}
                transition={{ delay: 1.5, duration: 1, ease: "circOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
              />
              
              <motion.p
                initial={{ opacity: 0, y: 10, letterSpacing: "0.2em" }}
                animate={{ opacity: 0.7, y: 0, letterSpacing: "0.5em" }}
                exit={{ opacity: 0, letterSpacing: "1em" }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-4 text-[10px] md:text-sm font-light text-white uppercase tracking-widest"
              >
                Cinematic Experience
              </motion.p>
            </div>
            
            {/* Loading Progress Line at Bottom */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.5, duration: 3 }}
                    className="w-64 h-[1px] bg-white/10 overflow-hidden relative"
                >
                     <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2"
                     />
                </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
