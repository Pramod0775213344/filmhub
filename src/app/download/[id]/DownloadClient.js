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
    <main className="min-h-screen bg-[#020202] text-white pt-24 relative">
      <div className="container-custom max-w-4xl mx-auto px-4 py-12">
        
        {/* Back Link */}
        <Link 
          href={`/movies/${slugify(movie.title)}`} 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Movie</span>
        </Link>

        {/* Movie Header Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 md:p-12 mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Download size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="relative w-32 h-48 shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image 
                        src={movie.image_url || movie.image} 
                        alt={movie.title} 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10">Movie Download</span>
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5">{movie.year}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{movie.title}</h1>
                    <p className="text-zinc-400 font-medium max-w-xl">
                        Secure high-speed download mirrors are ready. Please select your preferred quality to proceed to the secure download servers.
                    </p>
                </div>
            </div>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
                { icon: <Shield size={18} className="text-green-500" />, label: "Security", val: "Verified Safe" },
                { icon: <Zap size={18} className="text-yellow-500" />, label: "Speed", val: "No Limits" },
                { icon: <Globe size={18} className="text-blue-500" />, label: "Mirrors", val: "Active" }
            ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5">
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold leading-none mb-1">{stat.label}</p>
                        <p className="font-bold text-white leading-none">{stat.val}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Download Options */}
        <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-4">
                <div className="h-1 w-8 bg-primary rounded-full"></div>
                Select Video Quality
            </h2>

            <div className="grid grid-cols-1 gap-10">
                {groupedLinks && groupedLinks.length > 0 ? (
                    groupedLinks.map((group, i) => (
                        <div 
                            key={i}
                            className="group relative flex flex-col items-stretch gap-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 md:p-10 transition-all hover:bg-zinc-900/60 hover:border-primary/20 shadow-2xl"
                        >
                            {/* Quality & Size Header */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className={`h-20 w-20 shrink-0 flex flex-col items-center justify-center rounded-2xl font-black ring-2 ring-white/5 shadow-xl ${
                                        group.quality.toLowerCase().includes('1080') || group.quality.toLowerCase().includes('4k')
                                        ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 text-yellow-500"
                                        : "bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-500"
                                    }`}>
                                        <span className="text-2xl leading-none">{group.quality.replace(/p/i, '')}</span>
                                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">{group.quality.toLowerCase().includes('p') ? 'p' : ''} HD</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                            {group.quality} Quality
                                            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20">Optimal</span>
                                        </h3>
                                        <div className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
                                            <span className="flex items-center gap-2 text-primary font-bold">
                                                <Zap size={14} /> {group.size || "Unknown Size"}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                            <span>Multiple Secure Mirrors</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                    <Shield size={14} className="text-green-500" /> Secure Download
                                </div>
                            </div>

                            {/* Options Buttons Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {group.mirrors.map((mirror, idx) => {
                                    const provider = mirror.provider?.toLowerCase() || "";
                                    let config = {
                                        icon: <Globe size={18} />,
                                        color: "from-zinc-100 to-zinc-400",
                                        accent: "bg-white/10",
                                        text: "text-white",
                                        border: "border-white/5",
                                        hover: "hover:border-white/20 hover:bg-white/[0.08]"
                                    };

                                    if (provider.includes("google") || provider.includes("drive") || provider.includes("g-drive")) {
                                        config = {
                                            icon: <div className="relative h-5 w-5"><Image src="/google-drive-icon.png" alt="GD" fill className="object-contain" /></div>,
                                            color: "from-[#4285F4] to-[#34A853]",
                                            accent: "bg-[#FBBC05]/20",
                                            text: "text-white",
                                            border: "border-[#FBBC05]/20",
                                            hover: "hover:border-[#FBBC05]/40 hover:bg-[#FBBC05]/10"
                                        };
                                    } else if (provider.includes("telegram")) {
                                        config = {
                                            icon: <Share2 size={18} />,
                                            color: "from-[#24A1DE] to-[#24A1DE]",
                                            accent: "bg-[#24A1DE]/20",
                                            text: "text-[#24A1DE]",
                                            border: "border-[#24A1DE]/20",
                                            hover: "hover:border-[#24A1DE]/40 hover:bg-[#24A1DE]/10"
                                        };
                                    } else if (provider.includes("mega")) {
                                        config = {
                                            icon: <Shield size={18} />,
                                            color: "from-[#D50000] to-[#FF1744]",
                                            accent: "bg-[#D50000]/20",
                                            text: "text-[#FF1744]",
                                            border: "border-[#D50000]/20",
                                            hover: "hover:border-[#D50000]/40 hover:bg-[#D50000]/10"
                                        };
                                    } else if (provider.includes("dood")) {
                                        config = {
                                            icon: <Zap size={18} />,
                                            color: "from-[#7C4DFF] to-[#B388FF]",
                                            accent: "bg-[#7C4DFF]/20",
                                            text: "text-[#B388FF]",
                                            border: "border-[#7C4DFF]/20",
                                            hover: "hover:border-[#7C4DFF]/40 hover:bg-[#7C4DFF]/10"
                                        };
                                    } else if (provider.includes("direct")) {
                                        config = {
                                            icon: <Download size={18} />,
                                            color: "from-white to-zinc-400",
                                            accent: "bg-white/10",
                                            text: "text-white",
                                            border: "border-white/20",
                                            hover: "hover:bg-white hover:text-black hover:border-white"
                                        };
                                    }

                                    return (
                                        <motion.a 
                                            key={idx}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={mirror.url} 
                                            onClick={(e) => handleLinkClick(e, mirror)}
                                            target="_blank"
                                            className={`relative flex flex-col items-center justify-center gap-3 px-6 py-6 rounded-[2rem] transition-all duration-300 group/btn shadow-xl border overflow-hidden ${config.border} ${config.hover} bg-zinc-900/40`}
                                        >
                                            {/* Subtle Gradient Background on Hover */}
                                            <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity bg-gradient-to-br ${config.color}`} />
                                            
                                            <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${config.accent} transition-transform group-hover/btn:scale-110 duration-500`}>
                                                {config.icon}
                                            </div>

                                            <div className="text-center space-y-1 relative z-10">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover/btn:text-current transition-colors">
                                                    Mirror 0{idx + 1}
                                                </p>
                                                <h4 className={`text-sm font-black uppercase tracking-wider ${config.text} group-hover/btn:text-white`}>
                                                    {mirror.provider}
                                                </h4>
                                            </div>

                                            <div className="absolute top-3 right-3 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 translate-x-2 group-hover/btn:translate-x-0">
                                                <ExternalLink size={12} className="text-zinc-500" />
                                            </div>
                                        </motion.a>
                                    );
                                })}
                                
                                {group.mirrors.length < 4 && Array(4 - group.mirrors.length).fill(null).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="hidden md:flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] opacity-20 cursor-not-allowed bg-white/[0.01]">
                                        <Download size={20} className="mb-2" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Mirror Slot</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/5">
                        <p className="text-zinc-500 italic">No specific mirrors found for this movie. Check back soon.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-24 p-8 rounded-3xl bg-zinc-900/20 border border-white/5 text-center">
            <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl mx-auto">
                All download links are hosted on third-party servers. <b>FilmHub</b> does not host any media files. We recommend using a stable internet connection and an updated browser for the best experience. Proceeding means you agree to our terms of service regarding content safety.
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
