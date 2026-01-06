"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { 
  Play, Star, Calendar, Clock, Video, Download, 
  User, Users, MessageSquare, Plus, Check, X, 
  Share2, Globe, Heart, PlayCircle, Image as ImageIcon, Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import NativeAd from "@/components/NativeAd";

export default function MovieClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, cast, related
  const [tmdbImages, setTmdbImages] = useState({ backdrops: [], posters: [] });
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const supabase = createClient();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollRef = useRef(0);

  useEffect(() => {
    // 1. Increment view count
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

    // 2. Handle Scroll (Throttled via RequestAnimationFrame)
    // 2. Handle Scroll (Optimized to prevent unnecessary re-renders)
    let animationFrameId;
    let lastNavVisible = true;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      let isVisible = true;
      
      if (currentScrollY > 100) {
        isVisible = currentScrollY < scrollRef.current;
      }

      // Only update state if the visibility actually changed
      if (isVisible !== lastNavVisible) {
        setIsNavVisible(isVisible);
        lastNavVisible = isVisible;
      }
      
      scrollRef.current = currentScrollY;
    };

    const onScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // 4. Fetch TMDB Images
    const fetchTMDBImages = async () => {
      try {
        const results = await searchTMDB(movie.title, "movie");
        const match = results.find(r => r.year === movie.year) || results[0];
        if (match) {
          const details = await getTMDBDetails(match.id, "movie");
          if (details) {
            setTmdbImages({
              backdrops: details.backdrops || [],
              posters: details.posters || []
            });
          }
        }
      } catch (err) {
        console.error("Error fetching TMDB images:", err);
      }
    };
    fetchTMDBImages();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [movie?.id, movie?.title, movie?.year, supabase]);

  useEffect(() => {
    if (tmdbImages.backdrops.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % tmdbImages.backdrops.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tmdbImages.backdrops.length]);

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
          {/* Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_120%)]" />
        </div>

        {/* Content Container */}
        <div className="container-custom relative h-full flex items-center md:items-end pb-12 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
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
              <h1 className="font-display text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl xl:text-8xl">
                {movie.title}
                <span className="block text-2xl md:text-4xl font-bold text-zinc-400 mt-2 tracking-normal">| සිංහල උපසිරැසි සමඟ</span>
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

              <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 line-clamp-3 lg:line-clamp-4">
                {movie.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button 
                  onClick={() => {
                    if (movie.video_url) {
                      const playerElement = document.getElementById("movie-player");
                      if (playerElement) {
                         playerElement.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                         setActiveTab("overview");
                         setTimeout(() => {
                            document.getElementById("movie-player")?.scrollIntoView({ behavior: "smooth", block: "center" });
                         }, 100);
                      }
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
                  onClick={() => router.push(`/download/${movie.id}`)}
                  className="group flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(229,9,20,0.15)]"
                >
                  <Download size={20} />
                  <span>Download Now</span>
                </button>

                <button 
                  onClick={toggleList}
                  className="group flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                >
                  {listLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : isInList ? <Check size={20} className="text-primary" /> : <Plus size={20} />}
                  <span>{isInList ? "In My List" : "Add to List"}</span>
                </button>
              </div>
            </motion.div>

            {/* Right Side: Image Slider */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, x: 40 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
               className="hidden lg:block relative aspect-[16/10] w-full rounded-[2.5rem] overflow-hidden group ring-1 ring-white/10 shadow-2xl"
            >
               <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={tmdbImages.backdrops[currentImgIndex] || movie.image_url || movie.image}
                      alt={`${movie.title} Backdrop`}
                      fill
                      className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </motion.div>
               </AnimatePresence>

               {/* Glass UI Overlay on Slider */}
               <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black via-black/40 to-transparent">
                  <div className="flex items-center justify-between">
                     <div className="flex gap-2">
                        {(tmdbImages.backdrops.length > 0 ? tmdbImages.backdrops.slice(0, 5) : [1,2,3]).map((_, i) => (
                           <div 
                              key={i} 
                              className={`h-1 rounded-full transition-all duration-500 ${currentImgIndex % 5 === i ? "w-8 bg-primary" : "w-2 bg-white/20"}`}
                           />
                        ))}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">
                        Cinematic Collection
                     </span>
                  </div>
               </div>
            </motion.div>

        </div>
      </div>
    </div>

      {/* Tabs Navigation (Not Sticky) */}
      <div className="w-full border-b border-white/5 bg-[#020202]">
        <div className="container-custom flex gap-8 overflow-x-auto no-scrollbar">
          {["overview", "trailer", "cast", "related", "reviews"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`relative py-6 text-sm font-bold uppercase tracking-widest transition-colors ${
                 activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
               }`}
             >
               {tab === "trailer" ? "Official Trailer" : tab}
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
                   <Video className="text-primary" /> Watch Movie
                 </h3>
                 <VideoPlayer url={movie.video_url} title={movie.title} poster={movie.image_url || movie.image} />
               </div>
             )}

             {/* Native Ad Banner */}
             <NativeAd />

             {/* Info Grid */}
             <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
                      <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Globe className="text-primary" /> Storyline
                      </h3>
                      <p className="text-zinc-300 leading-8 text-lg">{movie.description}</p>
                   </div>
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

        {/* Trailer Tab Content */}
        {activeTab === "trailer" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {movie.trailer ? (
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3 font-display">
                    <Video className="text-primary" size={28} /> Official Trailer
                  </h3>
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    Cinematic 4K
                  </div>
                </div>
                <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-zinc-900 aspect-video relative group">
                  <VideoPlayer url={movie.trailer} title={`${movie.title} Trailer`} autoPlay={true} />
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                  <p className="text-zinc-400 font-medium leading-relaxed">
                    Watch the official teaser and trailer for <span className="text-white font-bold">{movie.title}</span>. Explore the world, the characters, and the story through this exclusive preview.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                  <PlayCircle size={40} className="text-zinc-600" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Trailer Not Available</h4>
                  <p className="text-zinc-500 max-w-xs">We couldn&apos;t find an official trailer for this movie yet. Please check back later.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Photos Tab */}


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

        {/* Related Tab - Horizontal Auto-Scroll Carousel */}
        {activeTab === "related" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full overflow-hidden">
             {relatedMovies.length > 0 ? (
               <div className="flex gap-4">
                 <motion.div 
                   className="flex gap-4 min-w-full will-change-transform"
                   animate={{ x: ["0%", "-100%"] }}
                   transition={{ 
                     repeat: Infinity, 
                     ease: "linear", 
                     duration: Math.max(relatedMovies.length * 4, 15), 
                     repeatType: "loop" 
                   }}
                 >
                   {/* Render related movies twice for seamless loop effect */}
                   {[...relatedMovies, ...relatedMovies].map((m, index) => (
                      <div 
                        key={`${m.id}-${index}`}
                        onClick={() => router.push(`/movies/${slugify(m.title)}`)}
                        className="group cursor-pointer space-y-3 min-w-[12.5%] flex-shrink-0"
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
                           
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                 <Play size={12} fill="black" />
                              </button>
                           </div>
                        </div>
                        <h3 className="line-clamp-1 text-sm font-bold text-zinc-300 group-hover:text-white transition-colors text-center">{m.title}</h3>
                      </div>
                   ))}
                 </motion.div>
               </div>
             ) : (
                <p className="py-12 text-center text-zinc-500 italic">No similar movies found.</p>
             )}
          </motion.div>
        )}

        {/* Reviews/Comments Tab */}
        {activeTab === "reviews" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CommentSection mediaId={movie.id} mediaType="movie" />
           </motion.div>
        )}

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 backdrop-blur-xl"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
            >
              <X size={40} />
            </motion.button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative h-full w-full max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Full Size Image"
                fill
                className="object-contain"
                priority
                quality={100}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
