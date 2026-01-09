"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdaptive } from "@/context/AdaptiveContext";

export default function ScrollToTop() {
  const { isMobile } = useAdaptive();
  const [isVisible, setIsVisible] = useState(false);
  const [chatbotState, setChatbotState] = useState('closed'); // 'closed', 'minimized', 'full'

  useEffect(() => {
    // Show button when page is scrolled down
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Chatbot Event Handlers
    const handleFull = () => setChatbotState('full');
    const handleMin = () => setChatbotState('minimized');
    const handleClosed = () => setChatbotState('closed');

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("chatbotExpanded", handleFull);
    window.addEventListener("chatbotMinimized", handleMin);
    window.addEventListener("closeChatbot", handleClosed);
    window.addEventListener("closeNavbarPanels", handleFull);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("chatbotExpanded", handleFull);
      window.removeEventListener("chatbotMinimized", handleMin);
      window.removeEventListener("closeChatbot", handleClosed);
      window.removeEventListener("closeNavbarPanels", handleFull);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Skip rendering if chatbot is fully open or scroll button shouldn't be visible
  const shouldShow = isVisible && chatbotState !== 'full';

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            // Adjusting position to avoid overlap with Chatbot/WhatsApp
            bottom: chatbotState === 'minimized' ? "108px" : (isMobile ? "152px" : "168px")
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed right-6 z-[50] flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-zinc-800/90 text-white shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-zinc-700 hover:ring-white/20"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
