"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Shield, Zap, Globe, ArrowLeft, X, ExternalLink, Share2, Send, Cloud } from "lucide-react";
import Footer from "@/components/Footer";
import { slugify } from "@/utils/slugify";

export default function DownloadClient({ movie, links }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLinkClick = (e, link) => {
    const providerLower = link.provider?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";
    
    // Check provider name OR the actual URL for Google keywords
    const isGoogle = providerLower.includes("google") || 
                     providerLower.includes("drive") || 
                     urlLower.includes("drive.google.com") ||
                     urlLower.includes("docs.google.com");
                     
    if (isGoogle) {
      e.preventDefault();
      setPendingLink(link.url);
      setShowGoogleModal(true);
    } else {
      // Show loading for regular mirrors too
      e.preventDefault();
      setIsDownloading(true);
      setTimeout(() => {
        setIsDownloading(false);
        window.open(link.url, "_blank");
      }, 1200);
    }
  };

  const confirmDownload = () => {
    if (pendingLink) {
      setIsDownloading(true);
      let finalLink = pendingLink;
      
      // Robust detection of Google Drive File ID
      const fileIdMatch = pendingLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                          pendingLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);

      const isGoogleDomain = pendingLink.includes("drive.google.com") || 
                             pendingLink.includes("docs.google.com");

      if (isGoogleDomain && fileIdMatch && fileIdMatch[1]) {
        finalLink = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }

      // Small delay for cinematic feel
      setTimeout(() => {
        window.open(finalLink, "_blank");
        setShowGoogleModal(false);
        setPendingLink(null);
        setIsDownloading(false);
      }, 1500);
    }
  };

  const groupedLinks = Object.values(links.reduce((acc, link) => {
    const q = link.quality || "Unknown";
    if (!acc[q]) acc[q] = { quality: q, size: link.size, mirrors: [] };
    acc[q].mirrors.push(link);
    return acc;
  }, {}));

  return (
    <main className="min-h-screen bg-[#020202] text-white pt-20 relative overflow-hidden">
      {/* Cinematic Background Backdrop */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={movie.backdrop_url || movie.image_url || movie.image} 
          alt="" 
          fill 
          className="object-cover opacity-20 blur-[100px] scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-[#020202]" />
      </div>

      <div className="container-custom relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
            <Link 
                href={`/movies/${slugify(movie.title)}`} 
                className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all text-zinc-400 hover:text-white"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Back to Film</span>
            </Link>

            <div className="flex items-center gap-4">
               <button className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
                  <Share2 size={18} />
               </button>
            </div>
        </div>

        {/* Movie Detailed Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-zinc-900/40 backdrop-blur-3xl p-8 md:p-14 mb-10 md:mb-16">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/20 blur-[120px] rounded-full" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-36 h-52 md:w-44 md:h-64 shrink-0 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
                >
                    <Image 
                        src={movie.image_url || movie.image} 
                        alt={movie.title} 
                        fill 
                        className="object-cover" 
                        priority
                    />
                </motion.div>
                
                <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20">Secure Link</span>
                        <span className="px-4 py-1.5 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10">{movie.year}</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white">
                        {movie.title}
                        <span className="block text-sm md:text-lg font-bold text-zinc-400 mt-4 tracking-normal">DOWNLOAD OPTIONS</span>
                    </h1>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                        <div className="flex items-center gap-2 group cursor-default">
                           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 transition-transform group-hover:scale-110">
                              <Shield size={18} />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Privacy</p>
                              <p className="text-xs font-bold text-white">Encrypted</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 transition-transform group-hover:scale-110">
                              <Zap size={18} />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Server</p>
                              <p className="text-xs font-bold text-white">Ultra Fast</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Download Matrix */}
        <div className="space-y-12">
            <div className="flex items-center gap-4 px-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white">
                    Quality <span className="text-primary italic">Selection</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-12">
                {groupedLinks && groupedLinks.length > 0 ? (
                    groupedLinks.map((group, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Quality Card */}
                            <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/30 p-8 md:p-12 transition-all hover:bg-zinc-900/50 hover:border-primary/20 shadow-2xl">
                                
                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10 pb-10 border-b border-white/5">
                                    <div className={`h-24 w-24 md:h-32 md:w-32 shrink-0 flex flex-col items-center justify-center rounded-[2rem] font-black ring-1 ring-white/10 shadow-2xl ${
                                        group.quality.toLowerCase().includes('1080') || group.quality.toLowerCase().includes('4k')
                                        ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 text-yellow-500"
                                        : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                                    }`}>
                                        <span className="text-3xl md:text-4xl leading-none tracking-tighter">{group.quality.replace(/p/i, '')}</span>
                                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-80 mt-1">
                                            {group.quality.toLowerCase().includes('4k') ? 'Ultra HD' : 'Full HD'}
                                        </span>
                                    </div>
                                    
                                    <div className="text-center md:text-left space-y-2">
                                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                            Video Quality: {group.quality}
                                        </h3>
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                            <span className="bg-white/5 px-4 py-1.5 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                                <Zap size={14} className="text-primary" /> {group.size || "Direct Link"}
                                            </span>
                                            <span className="bg-green-500/10 px-4 py-1.5 rounded-full text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                                Certified Stable
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mirrors Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {group.mirrors.map((mirror, idx) => {
                                        const provider = mirror.provider?.toLowerCase() || "";
                                        let config = {
                                            icon: <Globe size={24} />,
                                            color: "text-zinc-400",
                                            bg: "bg-white/5",
                                            border: "border-white/5",
                                            hover: "hover:border-primary/40 hover:bg-primary/5",
                                            accent: "bg-zinc-400/10"
                                        };

                                        if (provider.includes("google") || provider.includes("drive") || provider.includes("g-drive")) {
                                            config = {
                                                icon: <Cloud size={24} />,
                                                color: "text-blue-400",
                                                bg: "bg-blue-500/5",
                                                border: "border-blue-500/20",
                                                hover: "hover:border-blue-500/60 hover:bg-blue-500/10",
                                                accent: "bg-blue-500/10"
                                            };
                                        } else if (provider.includes("telegram")) {
                                            config = {
                                                icon: <Send size={24} />,
                                                color: "text-sky-400",
                                                bg: "bg-sky-500/5",
                                                border: "border-sky-500/20",
                                                hover: "hover:border-sky-500/60 hover:bg-sky-500/10",
                                                accent: "bg-sky-500/10"
                                            };
                                        } else if (provider.includes("mega")) {
                                            config = {
                                                icon: <Zap size={24} />,
                                                color: "text-red-500",
                                                bg: "bg-red-500/5",
                                                border: "border-red-500/20",
                                                hover: "hover:border-red-500/60 hover:bg-red-500/10",
                                                accent: "bg-red-500/10"
                                            };
                                        } else if (provider.includes("mediafire")) {
                                            config = {
                                                icon: <ExternalLink size={24} />,
                                                color: "text-blue-600",
                                                bg: "bg-blue-600/5",
                                                border: "border-blue-600/20",
                                                hover: "hover:border-blue-600/60 hover:bg-blue-600/10",
                                                accent: "bg-blue-600/10"
                                            };
                                        }

                                        return (
                                            <motion.a 
                                                key={idx}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                href={mirror.url} 
                                                onClick={(e) => handleLinkClick(e, mirror)}
                                                target="_blank"
                                                className={`group/btn flex items-center gap-5 p-5 md:p-6 rounded-[2rem] border transition-all duration-300 ${config.bg} ${config.border} ${config.hover}`}
                                            >
                                                <div className={`h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl ${config.accent} ${config.color} transition-transform group-hover/btn:scale-110`}>
                                                    {config.icon}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Mirror {idx + 1}</p>
                                                    <h4 className="text-sm md:text-base font-black text-white truncate group-hover/btn:text-primary transition-colors">
                                                        {mirror.provider}
                                                    </h4>
                                                </div>
                                                
                                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                                                    <Download size={16} />
                                                </div>
                                            </motion.a>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="p-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/5">
                        <Download size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 text-lg font-bold uppercase tracking-widest">No mirrors found</p>
                    </div>
                )}
            </div>
        </div>

        {/* Cinematic Footer Info */}
        <div className="mt-20 flex flex-col items-center gap-6">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-zinc-600 text-[10px] md:text-sm font-medium tracking-wide text-center max-w-3xl px-6 leading-relaxed">
                By downloading, you agree to our terms of service. FilmHub does not host any files on its servers. All content is provided by non-affiliated third parties.
            </p>
        </div>
      </div>

      {/* Google Server Modal: Redesigned */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowGoogleModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }} 
              className="relative w-full max-w-xl overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/10 p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] text-center"
            >
                {/* Visual Flair */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute -top-40 -left-40 h-80 w-80 bg-primary/10 blur-[120px] rounded-full" />
                
                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="h-20 w-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-2xl">
                        <Cloud size={40} className="text-blue-500" />
                    </div>
                    
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                            Google <span className="text-primary">Drive</span>
                        </h2>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                            <p className="text-zinc-300 text-xl font-medium leading-[1.6]">
                                මීළඟට පැමිණෙන පිටුවේ ඇති <br/>
                                <span className="text-white px-3 py-1 bg-primary/20 rounded-lg font-black border border-primary/30 inline-block mt-2">
                                    &apos;Download Anyway&apos;
                                </span> <br/>
                                බොත්තම ක්ලික් කිරීමෙන් බාගත කිරීම ආරම්භ වේ.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                            onClick={confirmDownload}
                            className="flex-1 flex items-center justify-center gap-3 rounded-full bg-white py-5 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-primary hover:text-white hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <Download size={20} />
                            Start Download
                        </button>
                        <button 
                            onClick={() => setShowGoogleModal(false)}
                            className="px-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10 active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Download Overlay */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="relative">
               {/* Animated Rings */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="h-32 w-32 rounded-full border-t-2 border-b-2 border-primary"
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-2 rounded-full border-l-2 border-r-2 border-white/20"
               />
               <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <Download size={32} className="animate-bounce" />
               </div>
            </div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center"
            >
               <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white italic">Initializing <span className="text-primary">Link</span></h3>
               <p className="mt-2 text-zinc-500 font-bold uppercase tracking-widest text-xs">Securing your high-speed connection...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
