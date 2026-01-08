"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minus, RefreshCw, ExternalLink, Play, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.text,
        suggestions: data.suggestions // Store structured suggestions
      }]);
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
                            <div className="space-y-3 max-w-[85%]">
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

                              {/* Actionable Movie Cards */}
                              {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-col gap-2 mt-2">
                                  {msg.suggestions.map((movie) => (
                                    <Link 
                                      key={movie.id}
                                      href={movie.url}
                                      onClick={handleClose}
                                      className="group flex items-center gap-3 rounded-xl bg-white/5 p-2 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-primary/50"
                                    >
                                      <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                        <Image 
                                          src={movie.image_url || movie.image} 
                                          alt={movie.title}
                                          fill 
                                          className="object-cover"
                                          sizes="40px"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                                        <p className="text-[10px] text-zinc-500 font-medium">
                                          {movie.year} • {movie.displayType} • ⭐ {movie.rating || "N/A"}
                                        </p>
                                      </div>
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                          <Play size={12} fill="currentColor" />
                                      </div>
                                    </Link>
                                  ))}
                                </div>
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

        {/* Floating Action Buttons - Vertical Stack */}
        <div className="flex flex-col items-end gap-4 pointer-events-none">
          <AnimatePresence>
            {!isOpen && (
              <>
                {/* WhatsApp Request Button with Hover Card */}
                <HoverableWhatsAppButton />

                {/* Chatbot Toggle Button */}
                <motion.button
                  key="chat-fab"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function HoverableWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({ name: "", language: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    const text = `*📩 MOVIE REQUEST*%0A%0AHello Admin! 👋%0AI want to request a movie.%0A%0A🎬 *Title:* ${encodeURIComponent(formData.name.trim())}%0A🗣 *Language:* ${encodeURIComponent(formData.language.trim() || 'Any')}%0A%0APlease add this. Thanks!`;
    
    window.open(`https://wa.me/94775213344?text=${text}`, '_blank');
    setIsOpen(false);
    setFormData({ name: "", language: "" });
  };

  return (
    <div className="pointer-events-auto relative z-50 flex flex-col items-end gap-3">
      {/* Request Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2 w-72 rounded-2xl bg-zinc-900/95 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl origin-bottom-right"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-lg">🎬</span> Request Movie
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                type="button"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Movie Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Deadpool 3"
                  className="w-full rounded-lg bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-600 ring-1 ring-white/10 focus:outline-none focus:ring-[#25D366]/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Language (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. English, Sinhala"
                  className="w-full rounded-lg bg-black/40 px-3 py-2.5 text-sm text-white placeholder-zinc-600 ring-1 ring-white/10 focus:outline-none focus:ring-[#25D366]/50 transition-all"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#20bd5a]"
              >
                <span>Send via WhatsApp</span>
                <Send size={14} className="fill-white/20" />
              </button>
            </form>
            
            {/* Decoration */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-[#25D366] blur-[60px] opacity-20 pointer-events-none"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (The Pill) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 items-center rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] ring-1 ring-white/20 backdrop-blur-md transition-shadow hover:shadow-[0_8px_25px_rgba(37,211,102,0.6)] ${isOpen ? 'bg-zinc-800 ring-white/30' : 'bg-[#25D366]'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Request a Movie"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
           {isOpen ? (
             <X size={24} className="text-white" />
           ) : (
             <Image 
                src="https://cdn.simpleicons.org/whatsapp/white" 
                alt="WhatsApp" 
                width={28}
                height={28}
                className="object-contain drop-shadow-sm"
             />
           )}
        </div>

        <motion.div
           initial={{ width: 0, opacity: 0 }}
           animate={{ 
             width: isHovered || isOpen ? "auto" : 0,
             opacity: isHovered || isOpen ? 1 : 0
           }}
           transition={{ type: "spring", stiffness: 500, damping: 30 }}
           className="overflow-hidden whitespace-nowrap"
        >
             <div className="flex items-center gap-3 pr-5 pl-1">
              <div className={`h-4 w-px ${isOpen ? 'bg-white/10' : 'bg-white/30'}`}></div>
              <div className="flex flex-col leading-none text-left">
                 <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isOpen ? 'text-zinc-500' : 'text-green-900/80'}`}>
                   {isOpen ? 'Close Form' : 'Need a Movie?'}
                 </span>
                 <span className="text-sm font-black text-white">
                   {isOpen ? 'Cancel' : 'Request Now'}
                 </span>
              </div>
              
              {!isOpen && (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white/30 shadow-sm ml-1">
                    <Image 
                      src="https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg" 
                      className="h-full w-full object-cover" 
                      alt="Poster" 
                      fill
                      sizes="32px"
                    />
                </div>
              )}
            </div>
        </motion.div>
      </motion.button>
    </div>
  );
}