"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { 
  Play, Star, Calendar, Clock, Video, Download, 
  User, Plus, Check, PlayCircle, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";

export default function KoreanDramaClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); 
  const supabase = createClient();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollRef = useRef(0);

  useEffect(() => {
    // 1. Increment view count
    const incrementView = async () => {
        if (!movie?.id || !supabase) return;
        try {
            const { data } = await supabase.from('korean_dramas').select('views').eq('id', movie.id).single();
            if (data) {
                await supabase.from('korean_dramas').update({ views: (data.views || 0) + 1 }).eq('id', movie.id);
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

    // Fetch Related
    const fetchAdditionalData = async () => {
      if (movie && supabase) {
        const categories = movie.category?.split(',').map(c => c.trim()) || [];
        if (categories.length > 0) {
          const { data: relatedData } = await supabase
            .from("korean_dramas")
            .select("*")
            .neq("id", movie.id)
            .ilike("category", `%${categories[0]}%`)
            .limit(10);
          if (relatedData) setRelatedMovies(relatedData.map(m => ({...m, type: "Korean Drama"})));
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
        <div className="absolute inset-0 transform translate-z-0">
          <Image
            src={movie.image_url || movie.image}
            alt={movie.title}
            fill
            className="object-cover opacity-60 transition-opacity duration-1000"
            priority
            sizes="100vw"
            quality={85}
          />
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
               <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold">
                 <span className="text-primary tracking-wider uppercase">Korean</span>
               </div>
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  <span>{movie.imdb_rating || movie.rating || "N/A"}</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl font-black leading-time tracking-tighter text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
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
                {movie.duration || "N/A"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => {
                  if (movie.video_url) {
                    const playerElement = document.getElementById("movie-player");
                    if (playerElement) {
                       playerElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  } else {
                    alert("Video source not available.");
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
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl line-clamp-3 md:line-clamp-none">
              {movie.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div 
        className={`sticky z-40 w-full border-b border-white/5 bg-[#020202]/85 backdrop-blur-md transition-all duration-300 ${
          isNavVisible ? "top-[72px]" : "top-0"
        }`}
      >
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
             
             {/* Embedded Video Player */}
             {movie.video_url && (
               <div id="movie-player" className="w-full scroll-mt-32">
                 <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                   <Video className="text-primary" /> Watch Drama
                 </h3>
                 <VideoPlayer url={movie.video_url} title={movie.title} poster={movie.image_url || movie.image} />
               </div>
             )}

             {/* Info Grid */}
             <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
                      <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Globe className="text-primary" /> Storyline
                      </h3>
                      <p className="text-zinc-300 leading-8 text-lg">{movie.description}</p>
                   </div>

                   {/* Trailer Section */}
                   {movie.trailer && (
                     <div className="space-y-6">
                       <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                         <PlayCircle className="text-primary" /> Official Trailer
                       </h3>
                       <div className="overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                          <VideoPlayer url={movie.trailer} title={`${movie.title} Trailer`} />
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
                            <span className="font-bold text-white text-right">{movie.country || "South Korea"}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Language</span>
                            <span className="font-bold text-white text-right">{movie.language || "Korean"}</span>
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
             {movie.actors?.map((actor, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 p-6 flex flex-col items-center justify-center gap-4 text-center aspect-[1/1]">
                   <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                      <User size={32} />
                   </div>
                   <h4 className="font-bold text-white text-sm">{actor}</h4>
                </div>
            ))}
            {(!movie.actors || movie.actors.length === 0) && <p className="col-span-full text-zinc-500 italic">No cast information available.</p>}
          </motion.div>
        )}

        {/* Related Tab */}
        {activeTab === "related" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full overflow-hidden">
             {relatedMovies.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {relatedMovies.map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => router.push(`/korean-dramas/${m.id}`)}
                        className="group cursor-pointer space-y-3"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-primary/20">
                           <Image
                             src={m.image_url || m.image}
                             alt={m.title}
                             fill
                             className="object-cover transition-transform duration-500 group-hover:scale-110"
                             sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
                        </div>
                        <h3 className="line-clamp-1 text-sm font-bold text-zinc-300 group-hover:text-white transition-colors text-center">{m.title}</h3>
                      </div>
                  ))}
               </div>
             ) : (
                <p className="py-12 text-center text-zinc-500 italic">No similar dramas found.</p>
             )}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CommentSection mediaId={movie.id} mediaType="korean_dramas" />
           </motion.div>
        )}

      </div>

    </main>
  );
}
