"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Facebook, Twitter, MessageCircle, Copy, Check, Send, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export default function SocialShareModal({ isOpen, onClose, title, url }) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      url: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088cc]",
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share this Title</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:-translate-y-1 ${link.color}`}
                  >
                    <link.icon size={26} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={url}
                readOnly
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
