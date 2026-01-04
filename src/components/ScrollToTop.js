"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Listen for chatbot open/close to hide/show scroll button
    const handleChatbotOpen = () => setIsChatbotOpen(true);
    const handleChatbotClose = () => setIsChatbotOpen(false);

    // Add event listeners
    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("closeNavbarPanels", handleChatbotOpen); // Chatbot dispatches this when opening
    window.addEventListener("closeChatbot", handleChatbotClose); // Navbar dispatches this when closing chatbot

    // Cleanup
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("closeNavbarPanels", handleChatbotOpen);
      window.removeEventListener("closeChatbot", handleChatbotClose);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Don't show if chatbot is open (to avoid overlap)
  const shouldShow = isVisible && !isChatbotOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[50] flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-zinc-800/90 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all hover:bg-zinc-700 hover:ring-white/20"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
