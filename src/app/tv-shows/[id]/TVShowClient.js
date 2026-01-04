"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Star, Calendar, ArrowLeft, Plus, Check, Download, 
  User, Users, ChevronDown, ChevronUp, PlayCircle, Clock, 
  MessageSquare, Globe, X, Share2, Heart
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";

export default function TVShowClient({ initialShow, initialEpisodes, userId }) {
  const router = useRouter();
  const [show] = useState(initialShow);
  const [episodes] = useState(initialEpisodes);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, episodes, cast, reviews
  const supabase = createClient();

  // Group episodes by season
  const seasons = useMemo(() => {
    const seasonsMap = {};
    episodes.forEach(ep => {
      if (!seasonsMap[ep.season_number]) {
        seasonsMap[ep.season_number] = [];
      }
      seasonsMap[ep.season_number].push(ep);
    });
    return seasonsMap;
  }, [episodes]);

  const seasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => a - b);
  const currentEpisodes = seasons[activeSeason] || [];

  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollRef = useRef(0);

  useEffect(() => {
    // 1. Increment view count
    const incrementView = async () => {
        if (!show?.id || !supabase) return;
        try {
            const { data } = await supabase.from('movies').select('views').eq('id', show.id).single();
            if (data) {
                await supabase.from('movies').update({ views: (data.views || 0) + 1 }).eq('id', show.id);
            }
        } catch (err) {
            console.error("Error incrementing views:", err);
        }
    };
    incrementView();

    // 2. Handle Scroll (Throttled)
    let animationFrameId;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        setIsNavVisible(currentScrollY < scrollRef.current);
      } else {
        setIsNavVisible(true);
      }
      scrollRef.current = currentScrollY;
    };

    const onScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [show?.id, supabase]);

  useEffect(() => {
    if (!supabase || !userId) return;
    const checkStatus = async () => {
      try {
        const { data } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", userId)
          .eq("movie_id", show.id)
          .single();
        if (data) setIsInList(true);
      } catch (err) {
        console.error("Error checking list status:", err);
      }
    };
    checkStatus();
  }, [show.id, userId, supabase]);

  const toggleList = async () => {
    if (!supabase) return;
    if (!userId) return router.push("/login");

    setListLoading(true);
    if (isInList) {
      const { error } = await supabase.from("watchlists").delete().eq("user_id", userId).eq("movie_id", show.id);
      if (!error) setIsInList(false);
    } else {
      const { error } = await supabase.from("watchlists").insert([{ user_id: userId, movie_id: show.id }]);
      if (!error) setIsInList(true);
    }
    setListLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-primary selection:text-white">
      
      {/* Immersive Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 transform translate-z-0">
          <Image
            src={show.image_url || show.image}
            alt={show.title}
            fill
            className="object-cover opacity-60 transition-opacity duration-1000"
            priority
            sizes="100vw"
            quality={85}
          />
          {/* Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_120%)]" />
        </div>

        {/* Content Container */}
        <div className="container-custom relative flex h-full items-end pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl space-y-8"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.2 }}
                 className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold"
               >
                 <span className="text-primary tracking-wider uppercase">TV Series</span>
               </motion.div>
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  <span>{show.imdb_rating || show.rating || "N/A"}</span>
                </div>
                <div className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                   {seasonNumbers.length} Seasons
                </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
              {show.title}
            </h1>

            {/* Meta Info Line */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-zinc-300">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                {show.year}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <span className="uppercase text-zinc-400">{show.language || "English"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
               <span className="uppercase text-zinc-400">{show.country}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => {
                   setActiveTab("episodes");
                   document.getElementById("tabs-nav")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-black text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-3">
                   <Play size={20} fill="black" />
                   <span className="uppercase tracking-widest">Watch Episodes</span>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              <button 
                onClick={toggleList}
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                {listLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : isInList ? <Check size={20} className="text-primary" /> : <Plus size={20} />}
                <span>{isInList ? "In My List" : "Add to List"}</span>
              </button>
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl line-clamp-3 md:line-clamp-none">
              {show.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div 
        id="tabs-nav" 
        className={`sticky z-40 w-full border-b border-white/5 bg-[#020202]/85 backdrop-blur-md transition-all duration-300 ${
          isNavVisible ? "top-[72px]" : "top-0"
        }`}
      >
        <div className="container-custom flex gap-8 overflow-x-auto no-scrollbar">
          {["overview", "episodes", "cast", "reviews"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`relative py-6 text-sm font-bold uppercase tracking-widest transition-colors ${
                 activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
               }`}
             >
               {tab}
               {activeTab === tab && (
                 <motion.div 
                   layoutId="activeTab"
                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_20px_rgba(229,9,20,0.5)]"
                 />
               )}
             </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="container-custom space-y-24 py-16">
        
        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-12 md:grid-cols-3">
             <div className="md:col-span-2 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                  <Globe className="text-primary" /> Storyline
                </h3>
                <p className="text-zinc-300 leading-8 text-lg">{show.description}</p>
             </div>
             
             {/* Sidebar Info */}
             <div className="space-y-6">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-8 space-y-6 backdrop-blur-sm">
                   <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Details</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between">
                         <span className="text-zinc-400">Director</span>
                         <span className="font-bold text-white text-right">{show.director || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-zinc-400">Seasons</span>
                         <span className="font-bold text-white text-right">{seasonNumbers.length}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-zinc-400">Status</span>
                         <span className="font-bold text-white text-right">Released</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-zinc-400">Genre</span>
                         <span className="font-bold text-white text-right text-right max-w-[50%] leading-tight">{show.category?.split(',').slice(0,2).join(', ')}</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Episodes Tab */}
        {activeTab === "episodes" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* Season Selector */}
              <div className="flex flex-wrap gap-4 items-center">
                 <h3 className="text-xl font-bold text-white uppercase tracking-wider">Select Season:</h3>
                 <div className="flex flex-wrap gap-2">
                   {seasonNumbers.length > 0 ? seasonNumbers.map((season) => (
                     <button
                       key={season}
                       onClick={() => setActiveSeason(season)}
                       className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                         activeSeason === season 
                           ? "bg-primary text-white shadow-lg scale-105" 
                           : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                       }`}
                     >
                       Season {season}
                     </button>
                   )) : (
                     <p className="text-zinc-500 italic">No seasons available.</p>
                   )}
                 </div>
              </div>

              {/* Episode Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEpisodes.map((ep) => (
                  <motion.div
                    key={ep.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                       setActiveEpisode(ep);
                       // Scroll to player
                       setTimeout(() => document.getElementById("video-player-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                    }}
                    className={`group cursor-pointer relative overflow-hidden rounded-2xl p-6 transition-all border ${
                       activeEpisode?.id === ep.id 
                        ? "bg-primary/10 border-primary ring-1 ring-primary" 
                        : "bg-zinc-900 border-white/5 hover:bg-zinc-800 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                       <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white font-black text-lg group-hover:bg-primary group-hover:scale-110 transition-all">
                          {ep.episode_number}
                       </div>
                       <div className="flex-grow min-w-0 space-y-2">
                          <h3 className={`font-bold text-lg truncate ${activeEpisode?.id === ep.id ? "text-primary" : "text-white group-hover:text-primary transition-colors"}`}>
                            {ep.title || `Episode ${ep.episode_number}`}
                          </h3>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{ep.description || "Episode description not available."}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
                {currentEpisodes.length === 0 && (
                   <div className="col-span-full py-12 text-center rounded-3xl bg-white/5 border border-white/5 border-dashed">
                      <p className="text-zinc-500">No episodes found for Season {activeSeason}.</p>
                   </div>
                )}
              </div>
           </motion.div>
        )}

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {show.cast_details && show.cast_details.length > 0 ? (
              show.cast_details.map((actor, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-zinc-900">
                   <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image 
                        src={actor.image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200"} 
                        alt={actor.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                   </div>
                   <div className="absolute bottom-0 inset-x-0 p-4">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{actor.name}</h4>
                      <p className="text-xs text-primary font-medium line-clamp-1">{actor.character}</p>
                   </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-12 text-center rounded-3xl bg-white/5 border border-white/5 border-dashed">
                   <p className="text-zinc-500">No cast information available.</p>
                </div>
            )}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CommentSection mediaId={show.id} mediaType="tv" />
           </motion.div>
        )}

      </div>

      {/* Video Player Section (Scroll Target) */}
      <AnimatePresence>
        {activeEpisode && (
          <div id="video-player-section" className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative w-full max-w-6xl space-y-4"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-1 rounded-full bg-primary" />
                      <h3 className="text-xl font-bold text-white text-shadow-lg">S{activeEpisode.season_number} E{activeEpisode.episode_number}: {activeEpisode.title}</h3>
                   </div>
                   <button 
                     onClick={() => setActiveEpisode(null)}
                     className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
                   >
                     <X size={20} />
                   </button>
                </div>
                
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 bg-black">
                   <VideoPlayer url={activeEpisode.video_url} title={activeEpisode.title} autoPlay={true} />
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
