"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minus, RefreshCw, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Quick suggestion chips for users
const QUICK_SUGGESTIONS = [
  "What's trending? 🔥",
  "Action movies",
  "Korean dramas 🇰🇷",
  "New releases"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! 🎬 I'm FilmHub AI, your personal movie guide. Ask me about movies, TV shows, or Korean dramas. What are you in the mood to watch?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Lock body scroll when modal is open (prevent background scrolling)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
      
      return () => {
        // Restore scroll position when closed
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, isMinimized]);

  // Listen for close event from Navbar (when other panels open)
  useEffect(() => {
    const handleCloseEvent = () => {
      setIsOpen(false);
      setIsMinimized(false);
    };

    window.addEventListener('closeChatbot', handleCloseEvent);
    return () => window.removeEventListener('closeChatbot', handleCloseEvent);
  }, []);

  // Prevent scroll from propagating to body
  const handleWheel = useCallback((e) => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    // Prevent scroll propagation at boundaries
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    
    e.stopPropagation();
  }, []);

  // Handle sending messages
  const handleSend = async (customMessage) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from AI");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      
      let errorMessage = "Sorry, I encountered an issue. ";
      if (error.message.includes("API Key")) {
        errorMessage = "🔑 API Key Issue: Please configure your Gemini API key.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "⚠️ Network Error: Please check your connection.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // Reset conversation
  const handleReset = () => {
    setMessages([
      { 
        role: "assistant", 
        content: "Hello! 🎬 I'm FilmHub AI, your personal movie guide. Ask me about movies, TV shows, or Korean dramas. What are you in the mood to watch?" 
      }
    ]);
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Minimize handler
  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
    // Notify components that scroll is active again but chatbot is still there
    window.dispatchEvent(new CustomEvent('chatbotMinimized'));
  }, []);

  // Expand handler
  const handleExpand = useCallback(() => {
    setIsMinimized(false);
    // Notify components that chatbot is full screen / scroll locked
    window.dispatchEvent(new CustomEvent('chatbotExpanded'));
  }, []);

  // Close modal handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    // Notify other components that chatbot is closed
    window.dispatchEvent(new CustomEvent('closeChatbot'));
  }, []);

  // Open modal handler - also close navbar panels
  const handleOpen = useCallback(() => {
    // Close navbar panels (notification, profile, search)
    window.dispatchEvent(new CustomEvent('closeNavbarPanels'));
    setIsOpen(true);
    setIsMinimized(false);
    window.dispatchEvent(new CustomEvent('chatbotExpanded'));
  }, []);

  return (
    <>
      {/* Backdrop overlay when open - closes other interactions */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-[2px]"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Chat Container - Single anchor point to prevent layout jumps */}
      <div className="fixed bottom-6 right-6 z-[60] pointer-events-none">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                height: isMinimized ? "64px" : "520px"
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                transition: { duration: 0.15 }
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              className="absolute bottom-0 right-0 flex w-[360px] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-zinc-900/95 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:w-[420px] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-primary/20 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                      <Bot size={20} className="text-white" />
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -right-1 -top-1"
                    >
                      <Sparkles size={12} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">FilmHub AI</h3>
                    <div className="flex items-center gap-1.5">
                      <motion.div 
                        animate={{ opacity: [1, 0.5, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="h-1.5 w-1.5 rounded-full bg-green-500" 
                      />
                      <span className="text-[10px] font-medium text-zinc-400">Powered by Gemini 2.5</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleReset}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    title="Reset conversation"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={isMinimized ? handleExpand : handleMinimize}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    <Minus size={14} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                  </button>
                  <button 
                    onClick={handleClose}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-1 flex-col overflow-hidden"
                  >
                    {/* Messages Area */}
                    <div 
                      ref={chatContainerRef}
                      onWheel={handleWheel}
                      className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4"
                      style={{ maxHeight: "calc(520px - 64px - 100px)" }}
                    >
                      {messages.map((msg, i) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i === messages.length - 1 ? 0.1 : 0 }}
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex max-w-[85%] gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Avatar */}
                            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                              msg.role === "user" 
                                ? "bg-zinc-700" 
                                : "bg-primary shadow-[0_0_10px_rgba(229,9,20,0.3)]"
                            }`}>
                              {msg.role === "user" ? (
                                <User size={14} className="text-white" />
                              ) : (
                                <Bot size={14} className="text-white" />
                              )}
                            </div>
                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                              msg.role === "user" 
                                ? "bg-primary/20 text-white ring-1 ring-primary/30" 
                                : "bg-white/5 text-zinc-200 ring-1 ring-white/10"
                            }`}>
                              {msg.role === "assistant" ? (
                                msg.content.split(/(\/(?:movies|tv-shows|korean-dramas)\/[a-z0-9-]+)/g).map((part, index) => {
                                  if (part.startsWith('/') && (part.includes('/movies/') || part.includes('/tv-shows/') || part.includes('/korean-dramas/'))) {
                                    return (
                                      <Link 
                                        key={index} 
                                        href={part} 
                                        onClick={handleClose}
                                        className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                                      >
                                        {part} <ExternalLink size={10} />
                                      </Link>
                                    );
                                  }
                                  return part;
                                })
                              ) : (
                                msg.content
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Loading Indicator */}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-[0_0_10px_rgba(229,9,20,0.3)]">
                              <Bot size={14} className="text-white" />
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                              <Loader2 size={14} className="animate-spin text-primary" />
                              <span className="text-xs font-medium text-zinc-400">Searching...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Quick Suggestions */}
                      {messages.length <= 2 && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-2 pt-2"
                        >
                          {QUICK_SUGGESTIONS.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/10 transition-all hover:bg-primary/20 hover:text-white hover:ring-primary/30"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/5 bg-black/30 p-4">
                      <div className="relative flex items-center gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Search movies, shows, or dramas..."
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl bg-white/5 pl-4 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleSend()}
                          disabled={isLoading || !input.trim()}
                          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary/80 disabled:opacity-40 disabled:hover:bg-primary"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <p className="mt-2 text-center text-[10px] text-zinc-500">
                        Powered by Google Gemini 2.5 Flash ⚡
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button - Snappy transitions */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="chat-fab"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleOpen}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_0_25px_rgba(229,9,20,0.5)] transition-shadow hover:shadow-[0_0_35px_rgba(229,9,20,0.7)] pointer-events-auto"
            >
            <MessageCircle size={26} className="text-white" />
            {/* Sparkle decoration */}
            <motion.div 
              animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -right-1 -top-1"
            >
              <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}