"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Clock, ShieldCheck, Search, Info, Mail } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function MiniHero() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [backgrounds, setBackgrounds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchBackgrounds = async () => {
      const { data } = await supabase
        .from("movies")
        .select("backdrop_url, image_url")
        .order("rating", { ascending: false })
        .limit(8);

      const fetchedBgs = data?.map(m => m.backdrop_url || m.image_url).filter(Boolean) || [];
      if (fetchedBgs.length > 0) {
        setBackgrounds(fetchedBgs);
      } else {
        setBackgrounds(["https://images.unsplash.com/photo-1440404653325-ab127d49abc1"]);
      }
    };
    fetchBackgrounds();
  }, [pathname]);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  const s = searchParams.get("s") || searchParams.get("q");

  const isHome = pathname === "/";
  if ((isHome && !s) || pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null;
  }

  if (
    pathname.startsWith("/movies/") || 
    pathname.startsWith("/tv-shows/") || 
    pathname.startsWith("/korean-dramas/") ||
    pathname.startsWith("/upcoming/") ||
    pathname.startsWith("/download/")
  ) {
    return null;
  }

  // Handle Dynamic Title/Subtitle
  let title = "Explore Content";
  let subtitle = "Discover the latest movies and series on SubHub SL";
  let badge = "Premium Experience";
  let icon = <Sparkles className="text-primary" size={16} />;

  const cat = searchParams.get("category");
  const lang = searchParams.get("language");

  if (s) {
    title = `Results for "${s}"`;
    subtitle = `Found matching titles in our cinematic database.`;
    badge = "Searching SubHub SL";
    icon = <Search className="text-primary" size={16} />;
  } else if (pathname.startsWith("/movies")) {
    if (cat) title = `${cat} Movies`;
    else if (lang) title = `${lang} Movies`;
    else title = "Cinematic Movies";
    subtitle = "Experience stories that move the world and touch the soul.";
    badge = cat || lang || "Masterpieces";
    icon = <Sparkles className="text-primary" size={16} />;
  } else if (pathname.startsWith("/tv-shows")) {
    if (cat) title = `${cat} Series`;
    else if (lang) title = `${lang} Series`;
    else title = "Premium TV Shows";
    subtitle = "Binge-worthy series from world-class creators.";
    badge = cat || lang || "Trending Series";
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
    title = "About SubHub SL";
    subtitle = "Our mission is to bring global cinema to your screen.";
    badge = "Our Story";
    icon = <Info className="text-primary" size={16} />;
  } else if (pathname.startsWith("/contact")) {
      title = "Contact Us";
      subtitle = "We're here to help with any questions or feedback.";
      badge = "Support";
      icon = <Mail className="text-primary" size={16} />;
  } else if (pathname.startsWith("/category/")) {
    const slug = pathname.split("/").pop();
    const formattedSlug = decodeURIComponent(slug).replace(/-/g, " ");
    title = `${formattedSlug.replace(/\b\w/g, l => l.toUpperCase())} Movies`;
    subtitle = `Browse our extensive collection of ${formattedSlug} content.`;
    badge = "Category";
    icon = <Sparkles className="text-primary" size={16} />;
  } else if (pathname.startsWith("/language/")) {
    const slug = pathname.split("/").pop();
    const formattedSlug = decodeURIComponent(slug).replace(/-/g, " ");
    title = `${formattedSlug.replace(/\b\w/g, l => l.toUpperCase())} Movies`;
    subtitle = `Explore movies available in ${formattedSlug}.`;
    badge = "Language";
    icon = <Sparkles className="text-primary" size={16} />;
  }

  // Split title for coloring
  const words = title.split(' ');
  const mainTitle = words.slice(0, -1).join(' ');
  const lastWord = words[words.length - 1];

  return (
    <>
      {/* MOBILE VIEW: Normal Title look like Movies page */}
      <div className="md:hidden pt-28 pb-4 container-custom">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            {mainTitle} <span className="text-primary not-italic">{lastWord}</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
            {subtitle.length > 30 ? "Explore Premium Content" : subtitle}
          </p>
        </div>
      </div>

      {/* DESKTOP VIEW: Premium MiniHero */}
      <section className="hidden md:block relative overflow-hidden pt-40 pb-20 bg-[#020202]">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#020202] z-20" /> 
          <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/60 via-transparent to-[#020202]/60 z-20" />
          <div className="absolute inset-0 bg-[#020202]/30 z-10" />

          <AnimatePresence mode="popLayout">
            {backgrounds.length > 0 && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.05 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image 
                  src={backgrounds[currentIndex]}
                  alt="Background"
                  fill
                  className="object-cover opacity-60 blur-sm"
                  priority
                  sizes="100vw"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-30 mix-blend-overlay" />
        </div>

        <div className="container-custom relative z-30">
          <div className="flex flex-col items-center text-center gap-6">
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

            <div className="max-w-4xl space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl"
              >
                {words.map((word, i) => (
                  <span key={i} className={i === words.length - 1 ? "text-primary relative inline-block" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-balance text-xl font-medium leading-relaxed text-zinc-300 max-w-2xl mx-auto drop-shadow-lg"
              >
                {subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-10 pt-8"
            >
              <QuickStat icon={<Sparkles size={14} />} label="Quality" value="4K ULTRA HD" />
              <div className="w-px h-10 bg-white/10" />
              <QuickStat icon={<TrendingUp size={14} />} label="Trending" value="TOP 10 TODAY" />
              <div className="w-px h-10 bg-white/10" />
              <QuickStat icon={<Clock size={14} />} label="Updated" value="JUST NOW" />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-30" />
      </section>
    </>
  );
}

function QuickStat({ icon, label, value }) {
  return (
    <div className="group flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/5 transition-colors group-hover:bg-primary/10 group-hover:ring-primary/20">
        <div className="text-zinc-500 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-zinc-500">
          {label}
        </span>
        <span className="text-sm font-bold tracking-tight text-zinc-300 group-hover:text-white transition-colors">
          {value}
        </span>
      </div>
    </div>
  );
}
