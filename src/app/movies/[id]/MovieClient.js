"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import { 
  Play, Star, Calendar, Clock, Video, Download, 
  User, Users, MessageSquare, Plus, Check, X, 
  Share2, Globe, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";

export default function MovieClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [links, setLinks] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, cast, related
  const supabase = createClient();

  useEffect(() => {
    // Increment view count
    const incrementView = async () => {
        if (!movie?.id || !supabase) return;
        try {
            const { data } = await supabase.from('movies').select('views').eq('id', movie.id).single();
            if (data) {
                await supabase.from('movies').update({ views: (data.views || 0) + 1 }).eq('id', movie.id);
            }
        } catch (err) {
            console.error("Error incrementing views:", err);
        }
    };
    incrementView();
  }, [movie?.id, supabase]);

  useEffect(() => {
    if (!supabase) return;
    
    // Check Watchlist Status
    const checkStatus = async () => {
      if (userId && movie) {
        try {
          const { data: listData } = await supabase
            .from("watchlists")
            .select("*")
            .eq("user_id", userId)
            .eq("movie_id", movie.id)
            .single();
          
          if (listData) setIsInList(true);
        } catch (err) {
          console.error("Error checking list status:", err);
        }
      }
    };

    // Fetch Links & Related
    const fetchAdditionalData = async () => {
      if (movie && supabase) {
        const { data: linksData } = await supabase
          .from("movie_links")
          .select("*")
          .eq("movie_id", movie.id);
        
        if (linksData && linksData.length > 0) {
          setLinks(linksData);
          setActiveProvider(linksData[0].provider);
        } else if (movie.download_url) {
          setLinks([{
            provider: "Direct",
            quality: "HD",
            size: "Unknown",
            url: movie.download_url
          }]);
          setActiveProvider("Direct");
        }

        const categories = movie.category?.split(',').map(c => c.trim()) || [];
        if (categories.length > 0) {
          const { data: relatedData } = await supabase
            .from("movies")
            .select("*")
            .neq("id", movie.id)
            .ilike("category", `%${categories[0]}%`)
            .limit(10);
          if (relatedData) setRelatedMovies(relatedData);
        }
      }
    };

    checkStatus();
    fetchAdditionalData();
  }, [movie, userId, supabase]);

  const toggleList = async () => {
    if (!supabase) return;
    if (!userId) return router.push("/login");

    setListLoading(true);
    if (isInList) {
      const { error } = await supabase.from("watchlists").delete().eq("user_id", userId).eq("movie_id", movie.id);
      if (!error) setIsInList(false);
    } else {
      const { error } = await supabase.from("watchlists").insert([{ user_id: userId, movie_id: movie.id }]);
      if (!error) setIsInList(true);
    }
    setListLoading(false);
  };

  if (!movie) return null;

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-primary selection:text-white">
      
      {/* Immersive Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <Image
            src={movie.image_url || movie.image}
            alt={movie.title}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
            quality={90}
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
                 <span className="text-primary tracking-wider uppercase">Movie</span>
               </motion.div>
               {movie.quality && (
                 <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                   {movie.quality}
                 </span>
               )}
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  <span>{movie.imdb_rating || movie.rating || "N/A"}</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
              {movie.title}
            </h1>

            {/* Meta Info Line */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-zinc-300">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                {movie.year}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                {movie.duration || "1h 45m"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <span className="uppercase text-zinc-400">{movie.original_language || movie.language || "English"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => {
                  if (movie.video_url) {
                    setIsPlaying(true);
                  } else {
                    alert("Video source not available yet.");
                  }
                }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-black text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-3">
                   <Play size={20} fill="black" />
                   <span className="uppercase tracking-widest">{movie.video_url ? "Watch Now" : "No Video"}</span>
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

              {movie.download_url && (
                <button 
                  onClick={() => document.getElementById("links-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white transition-all hover:bg-primary hover:border-primary hover:scale-105"
                >
                  <Download size={20} />
                </button>
              )}
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl line-clamp-3 md:line-clamp-none">
              {movie.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-[70px] z-40 w-full border-b border-white/5 bg-[#020202]/80 backdrop-blur-xl">
        <div className="container-custom flex gap-8 overflow-x-auto no-scrollbar">
          {["overview", "cast", "related", "reviews"].map((tab) => (
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
             {/* Info Grid */}
             <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
                      <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Globe className="text-primary" /> Storyline
                      </h3>
                      <p className="text-zinc-300 leading-8 text-lg">{movie.description}</p>
                   </div>
                   
                   {/* Download Links Table */}
                   {links.length > 0 && (
                    <div id="links-section" className="space-y-6">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Download className="text-primary" /> Downloads
                      </h3>
                      
                      {/* Provider Tabs */}
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(links.map(l => l.provider))].map((provider, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveProvider(provider)}
                            className={`rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                              activeProvider === provider ? "bg-primary text-white shadow-lg" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                            }`}
                          >
                            {provider}
                          </button>
                        ))}
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50">
                        {links.filter(l => l.provider === activeProvider).map((link, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-white/5 p-6 last:border-0 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-800 text-primary font-bold text-xs ring-1 ring-white/10">
                                  {link.quality.slice(0, 4)}
                               </div>
                               <div>
                                  <p className="font-bold text-white text-sm">{link.provider}</p>
                                  <p className="text-xs text-zinc-500">{link.size || "Unknown Size"}</p>
                               </div>
                            </div>
                            <a 
                              href={link.url}
                              target="_blank"
                              className="rounded-lg bg-white px-6 py-2.5 text-xs font-black text-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                            >
                              Get Link
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                   )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 space-y-6 backdrop-blur-sm">
                      <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Details</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Director</span>
                            <span className="font-bold text-white text-right">{movie.director || "Unknown"}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Country</span>
                            <span className="font-bold text-white text-right">{movie.country || "Unknown"}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Language</span>
                            <span className="font-bold text-white text-right">{movie.language || "English"}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Genre</span>
                            <span className="font-bold text-white text-right text-right max-w-[50%] leading-tight">{movie.category?.split(',').slice(0,2).join(', ')}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movie.cast_details && movie.cast_details.length > 0 ? (
              movie.cast_details.map((actor, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-zinc-900">
                   <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image 
                        src={actor.image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200"} 
                        alt={actor.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                   </div>
                   <div className="absolute bottom-0 inset-x-0 p-4">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{actor.name}</h4>
                      <p className="text-xs text-primary font-medium line-clamp-1">{actor.character}</p>
                   </div>
                </div>
              ))
            ) : movie.actors?.map((actor, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 p-6 flex flex-col items-center justify-center gap-4 text-center aspect-[1/1]">
                   <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                      <User size={32} />
                   </div>
                   <h4 className="font-bold text-white text-sm">{actor}</h4>
                </div>
            ))}
            {(!movie.cast_details && !movie.actors) && <p className="col-span-full text-zinc-500 italic">No cast information available.</p>}
          </motion.div>
        )}

        {/* Related Tab */}
        {activeTab === "related" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedMovies.length > 0 ? relatedMovies.map((m) => (
               <div 
                 key={m.id}
                 onClick={() => router.push(`/movies/${m.id}`)}
                 className="group cursor-pointer space-y-3"
               >
                 <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-primary/20">
                    <Image
                      src={m.image_url || m.image}
                      alt={m.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                          <Play size={12} fill="black" />
                       </button>
                    </div>
                 </div>
                 <h3 className="line-clamp-1 text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{m.title}</h3>
               </div>
            )) : <p className="col-span-full text-zinc-500 italic">No similar movies found.</p>}
          </motion.div>
        )}

        {/* Reviews/Comments Tab */}
        {activeTab === "reviews" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CommentSection mediaId={movie.id} mediaType="movie" />
           </motion.div>
        )}

      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {isPlaying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            >
              <button 
                onClick={() => setIsPlaying(false)}
                className="absolute right-6 top-6 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all"
              >
                <X size={20} />
              </button>
              <VideoPlayer url={movie.video_url} title={movie.title} autoPlay={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
