"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm FilmHub AI. How can I help you find your next favorite movie today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
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
      if (data.error) {
        const errorMessage = data.details 
          ? `Error: ${data.details}. Machan, please check your Gemini API key in .env.local.`
          : "Sorry, I'm having some trouble connecting right now. Machan, please check your API key.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "64px" : "500px"
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 flex w-[350px] flex-col overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_15px_rgba(229,9,20,0.4)]">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">FilmHub AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-full bg-white/5 p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <Minus size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/5 p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex max-w-[80%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${msg.role === "user" ? "bg-zinc-700" : "bg-primary"}`}>
                          {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`rounded-2xl p-3 text-sm leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-primary/20 text-white ring-1 ring-primary/30" 
                            : "bg-white/5 text-zinc-300 ring-1 ring-white/10"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                          <Bot size={16} />
                        </div>
                        <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                          <Loader2 size={16} className="animate-spin text-zinc-500" />
                          <span className="text-xs font-medium text-zinc-500 italic tracking-wider">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-white/5 bg-black/40 p-4">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask anything about movies..."
                      className="h-11 w-full rounded-xl bg-white/5 pl-4 pr-12 text-sm text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 rounded-lg bg-primary p-2 text-white transition-all hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
        }}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all hover:bg-primary-hover cinematic-glow ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} className="text-white" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -right-1 -top-1"
        >
          <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
        </motion.div>
      </motion.button>
    </div>
  );
}
