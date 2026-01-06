"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Shield, Zap, Globe, ArrowLeft, X, ExternalLink, Share2, Send } from "lucide-react";
import Footer from "@/components/Footer";
import { slugify } from "@/utils/slugify";

export default function DownloadClient({ movie, links }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);

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
    }
  };

  const confirmDownload = () => {
    if (pendingLink) {
      let finalLink = pendingLink;
      
      // Robust detection of Google Drive File ID
      // Matches: /file/d/ID/... OR ?id=ID OR /open?id=ID
      const fileIdMatch = pendingLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                          pendingLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);

      const isGoogleDomain = pendingLink.includes("drive.google.com") || 
                             pendingLink.includes("docs.google.com");

      if (isGoogleDomain && fileIdMatch && fileIdMatch[1]) {
        finalLink = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }

      window.open(finalLink, "_blank");
      setShowGoogleModal(false);
      setPendingLink(null);
    }
  };

  const groupedLinks = Object.values(links.reduce((acc, link) => {
    const q = link.quality || "Unknown";
    if (!acc[q]) acc[q] = { quality: q, size: link.size, mirrors: [] };
    acc[q].mirrors.push(link);
    return acc;
  }, {}));

  return (
    <main className="min-h-screen bg-[#020202] text-white pt-20 relative">
      <div className="container-custom max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Back Link */}
        <Link 
          href={`/movies/${slugify(movie.title)}`} 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 md:mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Movie</span>
        </Link>

        {/* Movie Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-6 md:p-12 mb-8 md:mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-5 hidden md:block">
                <Download size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                <div className="relative w-28 h-40 md:w-32 md:h-48 shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image 
                        src={movie.image_url || movie.image} 
                        alt={movie.title} 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10">Download</span>
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-zinc-800 text-zinc-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5">{movie.year}</span>
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter leading-tight">{movie.title}</h1>
                    <p className="text-zinc-500 text-sm md:text-base font-medium max-w-xl">
                        Select your preferred video quality to proceed to the secure high-speed download mirrors.
                    </p>
                </div>
            </div>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12">
            {[
                { icon: <Shield size={14} className="text-green-500" />, label: "Security", val: "Safe" },
                { icon: <Zap size={14} className="text-yellow-500" />, label: "Speed", val: "High" },
                { icon: <Globe size={14} className="text-blue-500" />, label: "Mirrors", val: "Active" }
            ].map((stat, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-4 p-3 md:p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-center md:text-left">
                    <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl bg-white/5 shrink-0">
                        {stat.icon}
                    </div>
                    <div>
                        <p className="hidden md:block text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold leading-none mb-1">{stat.label}</p>
                        <p className="text-[10px] md:text-sm font-bold text-white leading-none">{stat.val}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Download Options */}
        <div className="space-y-6 md:space-y-8">
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-wider flex items-center gap-3 md:gap-4 leading-none">
                <div className="h-0.5 md:h-1 w-6 md:w-8 bg-primary rounded-full"></div>
                Available Qualities
            </h2>

            <div className="grid grid-cols-1 gap-6 md:gap-10">
                {groupedLinks && groupedLinks.length > 0 ? (
                    groupedLinks.map((group, i) => (
                        <div 
                            key={i}
                            className="group relative flex flex-col items-stretch gap-6 md:gap-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-6 md:p-10 transition-all hover:bg-zinc-900/60 hover:border-primary/20 shadow-2xl"
                        >
                            {/* Quality & Size Header */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pb-6 md:pb-8 border-b border-white/5">
                                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                    <div className={`h-14 w-14 md:h-20 md:w-20 shrink-0 flex flex-col items-center justify-center rounded-2xl font-black ring-1 ring-white/5 shadow-xl ${
                                        group.quality.toLowerCase().includes('1080') || group.quality.toLowerCase().includes('4k')
                                        ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 text-yellow-500"
                                        : "bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-500"
                                    }`}>
                                        <span className="text-xl md:text-2xl leading-none">{group.quality.replace(/p/i, '')}</span>
                                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.1em] opacity-80">{group.quality.toLowerCase().includes('p') ? 'p' : ''} HD</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                            {group.quality}
                                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Optimal</span>
                                        </h3>
                                        <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
                                            <span className="flex items-center gap-1.5 text-primary font-bold">
                                                <Zap size={12} /> {group.size || "Unknown Size"}
                                            </span>
                                            <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
                                            <span className="line-clamp-1">Secure Mirrors Attached</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Options Buttons Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                {group.mirrors.map((mirror, idx) => {
                                    const provider = mirror.provider?.toLowerCase() || "";
                                    let config = {
                                        icon: <Globe size={16} />,
                                        color: "from-zinc-100 to-zinc-400",
                                        accent: "bg-white/5",
                                        text: "text-zinc-400",
                                        border: "border-white/5",
                                        hover: "hover:border-white/20 hover:bg-white/[0.08]"
                                    };

                                    if (provider.includes("google") || provider.includes("drive") || provider.includes("g-drive")) {
                                        config = {
                                            icon: <div className="relative h-4 w-4 md:h-5 md:w-5"><Image src="/google-drive-icon.png" alt="GD" fill className="object-contain" /></div>,
                                            color: "from-[#4285F4] to-[#34A853]",
                                            accent: "bg-[#FBBC05]/10",
                                            text: "text-zinc-400",
                                            border: "border-[#FBBC05]/10",
                                            hover: "hover:border-[#FBBC05]/40 hover:bg-[#FBBC05]/10"
                                        };
                                    } else if (provider.includes("telegram")) {
                                        config = {
                                            icon: <Share2 size={16} />,
                                            color: "from-[#24A1DE] to-[#24A1DE]",
                                            accent: "bg-[#24A1DE]/10",
                                            text: "text-zinc-400",
                                            border: "border-[#24A1DE]/10",
                                            hover: "hover:border-[#24A1DE]/40 hover:bg-[#24A1DE]/10"
                                        };
                                    }

                                    return (
                                        <motion.a 
                                            key={idx}
                                            whileHover={{ y: -2, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={mirror.url} 
                                            onClick={(e) => handleLinkClick(e, mirror)}
                                            target="_blank"
                                            className={`relative flex flex-col items-center justify-center gap-2 px-3 py-5 md:px-6 md:py-6 rounded-2xl md:rounded-[2rem] transition-all duration-300 group/btn border bg-zinc-900/60 ${config.border} ${config.hover}`}
                                        >
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${config.accent}`}>
                                                {config.icon}
                                            </div>

                                            <div className="text-center space-y-0.5">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Mirror {idx + 1}</p>
                                                <h4 className={`text-xs font-bold uppercase tracking-wide text-white`}>
                                                    {mirror.provider}
                                                </h4>
                                            </div>
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/5">
                        <p className="text-zinc-500 text-sm italic">No download mirrors currently available.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 rounded-3xl bg-zinc-900/20 border border-white/5 text-center">
            <p className="text-zinc-600 text-[10px] md:text-xs leading-relaxed max-w-2xl mx-auto">
                Links are provided by third-party servers. We recommend a high-speed stable connection for the best experience.
            </p>
        </div>
      </div>

      {/* Google Server Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowGoogleModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-[#121212] border border-white/10 p-8 shadow-2xl text-center"
            >
                {/* Red Glow Effect */}
                <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/20 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-primary/20 blur-[100px] rounded-full" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                        <Image src="/google-drive-icon.png" alt="Google" width={32} height={32} className="opacity-80" />
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tight text-white">Google Server</h2>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                            මීළඟට පැමිණෙන පිටුවේ ඇති <span className="text-white font-black underline underline-offset-4 decoration-primary">&apos;Download Anyway&apos;</span> බොත්තම ක්ලික් කිරීමෙන් බාගත කිරීම ආරම්භ වේ.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        <button 
                            onClick={confirmDownload}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-primary hover:text-white"
                        >
                            <Download size={18} />
                            Download
                        </button>
                        <button 
                            onClick={() => setShowGoogleModal(false)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                        >
                            <X size={18} />
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
