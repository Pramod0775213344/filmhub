"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, ShieldCheck, Search, Info } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function MiniHero() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const s = searchParams.get("s") || searchParams.get("q");

  // Don't show on Home page UNLESS it's a search result
  // Also don't show on auth pages or admin
  const isHome = pathname === "/";
  if ((isHome && !s) || pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null;
  }

  // Don't show on detail pages (paths that have a sub-segment like /movies/avatar)
  if (
    pathname.startsWith("/movies/") || 
    pathname.startsWith("/tv-shows/") || 
    pathname.startsWith("/korean-dramas/") ||
    pathname.startsWith("/upcoming/") 
  ) {
    return null;
  }

  // Handle Dynamic Title/Subtitle
  let title = "Explore Content";
  let subtitle = "Discover the latest movies and series on FilmHub";
  let badge = "Premium Experience";
  let icon = <Sparkles className="text-primary" size={16} />;

  const cat = searchParams.get("category");

  if (s) {
    title = `Results for "${s}"`;
    subtitle = `Found matching titles in our cinematic database.`;
    badge = "Searching FilmHub";
    icon = <Search className="text-primary" size={16} />;
  } else if (pathname.startsWith("/movies")) {
    title = cat ? `${cat} Movies` : "Cinematic Movies";
    subtitle = "Experience stories that move the world and touch the soul.";
    badge = "Masterpieces";
    icon = <Sparkles className="text-primary" size={16} />;
  } else if (pathname.startsWith("/tv-shows")) {
    title = cat ? `${cat} Series` : "Premium TV Shows";
    subtitle = "Binge-worthy series from world-class creators.";
    badge = "Trending Series";
    icon = <TrendingUp className="text-primary" size={16} />;
  } else if (pathname.startsWith("/korean-dramas")) {
    title = "Korean Dramas";
    subtitle = "Emotionally rich stories and high-quality production.";
    badge = "K-Drama Central";
    icon = <Sparkles className="text-primary" size={16} />;
  } else if (pathname.startsWith("/upcoming")) {
    title = "Coming Soon";
    subtitle = "The most anticipated releases of the year.";
    badge = "Future Releases";
    icon = <Clock className="text-primary" size={16} />;
  } else if (pathname.startsWith("/my-list") || pathname.startsWith("/watchlist")) {
    title = "My Watchlist";
    subtitle = "Your personalized collection of cinematic gold.";
    badge = "Personal Library";
    icon = <ShieldCheck className="text-primary" size={16} />;
  } else if (pathname.startsWith("/about")) {
    title = "About FilmHub";
    subtitle = "Our mission is to bring global cinema to your screen.";
    badge = "Our Story";
    icon = <Info className="text-primary" size={16} />;
  }

  return (
    <section className="relative overflow-hidden pt-28 pb-12 md:pt-40 md:pb-20 bg-[#020202]">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent z-10" />
        <Image 
          src={getBackgroundImage(pathname, cat)} 
          alt="Background"
          fill
          className="object-cover opacity-50 blur-sm scale-110"
          priority
        />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-20" />
      </div>

      <div className="container-custom relative z-30">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2 backdrop-blur-md shadow-xl"
          >
            {icon}
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-300">
              {badge}
            </span>
          </motion.div>

          {/* Title Area */}
          <div className="max-w-4xl space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl leading-[0.9] !important drop-shadow-2xl"
            >
              {title.split(' ').map((word, i) => (
                <span key={i} className={i === title.split(' ').length - 1 ? "text-primary relative inline-block" : ""}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-balance text-base font-medium leading-relaxed text-zinc-300 md:text-xl md:leading-relaxed max-w-2xl mx-auto drop-shadow-lg"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Attractive Stats Grid - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-8 md:gap-10"
          >
            <QuickStat icon={<Sparkles size={14} />} label="Quality" value="4K ULTRA HD" />
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <QuickStat icon={<TrendingUp size={14} />} label="Trending" value="TOP 10 TODAY" />
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <QuickStat icon={<Clock size={14} />} label="Updated" value="JUST NOW" />
          </motion.div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)] z-30" />
    </section>
  );
}

function getBackgroundImage(pathname, category) {
  if (pathname.includes("movies")) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop";
  if (pathname.includes("tv-shows")) return "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=3540&auto=format&fit=crop";
  if (pathname.includes("korean-dramas")) return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2465&auto=format&fit=crop"; // Seoul vibe
  if (pathname.includes("upcoming")) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop"; // Cinema projector
  if (pathname.includes("my-list") || pathname.includes("watchlist")) return "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?q=80&w=2200&auto=format&fit=crop"; // Cozy
  if (pathname.includes("about")) return "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop"; // Team/Camera
  return "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2670&auto=format&fit=crop"; // Default cinematic
}

function QuickStat({ icon, label, value }) {
  return (
    <div className="group flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/5 transition-colors group-hover:bg-primary/10 group-hover:ring-primary/20">
        <div className="text-zinc-500 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-zinc-500">
          {label}
        </span>
        <span className="text-xs font-bold tracking-tight text-zinc-300 md:text-sm group-hover:text-white transition-colors">
          {value}
        </span>
      </div>
    </div>
  );
}
