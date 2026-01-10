"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";
import VideoPlayer from "@/components/VideoPlayer";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { 
  Play, Star, Calendar, Clock, Video, Download, Plus, Check, PlayCircle, User, Users,
  MessageSquare, Globe, X, Share2, Heart, Image as ImageIcon, Maximize2, Loader2, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import AdsterraBanner from "@/components/AdsterraBanner";
import NativeAd from "@/components/NativeAd";
import CinematicButton from "@/components/CinematicButton";
import SocialShareModal from "@/components/SocialShareModal";

export default function KoreanDramaClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); 
  const [tmdbImages, setTmdbImages] = useState({ backdrops: [], posters: [] });
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const supabase = createClient();

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

    // 4. Fetch TMDB Images
    const fetchTMDBImages = async () => {
      try {
        const results = await searchTMDB(movie.title, "tv"); // K-Dramas are usually TV on TMDB
        const match = results.find(r => r.year === movie.year) || results[0];
        if (match) {
          const details = await getTMDBDetails(match.id, "tv");
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
    <main className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      
      {/* Immersive Hero Section */}
      <div className="relative h-[70dvh] md:h-[90dvh] w-full overflow-hidden bg-black">
        {/* Backdrop Image with Cross-fade Animation */}
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={tmdbImages.backdrops[currentImgIndex] || movie.backdrop_url || movie.image_url || movie.image}
                alt={movie.title}
                fill
                className="object-cover scale-105"
                priority
                sizes="100vw"
                quality={90}
              />
            </motion.div>
          </AnimatePresence>
          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container-custom relative h-full flex flex-col items-center justify-center pt-20 pb-16 md:pb-0 px-4 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 md:space-y-6 max-w-5xl"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 md:px-6 py-1.5 md:py-2 backdrop-blur-xl border border-primary/30 text-primary mb-1">
                        <Star size={12} className="fill-current md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">IMDb {movie.imdb_rating || movie.rating || "N/A"}</span>
                    </div>
                
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-[1.1] md:leading-[0.9]">
                        {movie.title}
                        <span className="block text-xs sm:text-lg md:text-2xl lg:text-3xl font-bold text-zinc-400 mt-2 md:mt-4 tracking-normal opacity-80 uppercase tracking-[0.1em]">| With Sinhala Subtitles</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] md:text-sm font-bold text-zinc-400 uppercase tracking-widest pt-2 md:pt-4">
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Calendar size={12} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.year}
                    </span>
                    <span className="hidden sm:block h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Clock size={12} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.duration || "N/A"}
                    </span>
                    <span className="hidden sm:block h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Globe size={12} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.language || "Korean"}
                    </span>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-6 md:pt-8">
                    <CinematicButton 
                      onClick={() => {
                          setActiveTab("overview");
                          setTimeout(() => {
                              const element = document.getElementById('k-drama-content');
                              if (element) {
                                  const offset = 100;
                                  const elementPosition = element.getBoundingClientRect().top;
                                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                                  window.scrollTo({
                                      top: offsetPosition,
                                      behavior: "smooth"
                                  });
                              }
                          }, 100);
                      }}
                      icon={Play}
                      variant="primary"
                      triggerAd={true}
                    >
                        Watch Now
                    </CinematicButton>
                    <CinematicButton 
                      onClick={toggleList}
                      icon={isInList ? Check : Plus}
                      variant="secondary"
                      isLoading={listLoading}
                    >
                        {isInList ? "In Watchlist" : "Add to List"}
                    </CinematicButton>
                </div>
            </motion.div>
        </div>
      </div>
      <div id="k-drama-content" className="container-custom relative z-10 -mt-20 md:-mt-32 pb-24 px-4">
        
        {/* Floating Glass Navigation */}
        <div className="sticky top-20 z-40 mb-16 flex justify-center">
            <div className="flex gap-2 p-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-x-auto no-scrollbar max-w-full touch-pan-x">
                {["overview", "trailer", "photos", "cast", "related", "reviews"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            const element = document.getElementById('k-drama-content');
                            if (element) {
                                const offset = 100;
                                const elementPosition = element.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - offset;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: "smooth"
                                });
                            }
                        }}
                        className={`relative px-4 sm:px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all duration-300 overflow-hidden group whitespace-nowrap flex-shrink-0 ${
                            activeTab === tab 
                            ? "text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]" 
                            : "text-zinc-500 hover:text-white"
                        }`}
                    >
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left Column: Media Player & Content (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-16"
                    >
                        {/* Storyline Section */}
                        <section className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-b from-zinc-900/50 to-transparent rounded-[2.5rem] -z-10 blur-xl" />
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                                <div className="hidden md:flex flex-col items-center gap-4 pt-2">
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                        <Globe size={20} />
                                    </div>
                                    <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent" />
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                        Storyline
                                    </h3>
                                    <div className="prose prose-invert max-w-none">
                                        {movie.description?.split(/\\r?\\n|\\\\n/).filter(p => p.trim() !== "").map((para, i) => (
                                            <p key={i} className={`text-justify text-lg md:text-xl leading-[1.8] font-medium ${i === 0 ? "text-zinc-100 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left" : "text-zinc-400"}`}>
                                                {para}
                                            </p>
                                        ))}
                                        {(!movie.description || movie.description.length === 0) && (
                                            <p className="text-zinc-500 italic">Description not available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Video Player Section */}
                        {movie.video_url && (
                             <section className="relative group perspective-1000">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-1 h-6 bg-primary rounded-full" />
                                            Main Feature
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-4 mt-1">
                                            Cinematic Experience
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                            Stream Ready
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Screen Container with Glow */}
                                <div className="relative rounded-[2rem] bg-black p-1 ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] cinematic-glow transition-all duration-500 md:group-hover:ring-primary/30">
                                    <div className="overflow-hidden rounded-[1.8rem] bg-zinc-900 aspect-video relative z-10">
                                        <VideoPlayer url={movie.video_url} title={movie.title} poster={movie.image_url || movie.image} />
                                    </div>
                                    
                                    {/* Ambient Light Reflection */}
                                    <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none" />
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 gap-8 mt-8">
                            <NativeAd />
                            <AdsterraBanner />
                        </div>
                    </motion.div>
                )}

                {activeTab === "trailer" && (
                    <motion.div 
                      key="trailer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                        {movie.trailer ? (
                            <div className="rounded-[2rem] overflow-hidden bg-black ring-1 ring-white/10">
                                <div className="aspect-video relative">
                                    <VideoPlayer 
                                        url={movie.trailer} 
                                        title={`${movie.title} Trailer`} 
                                        autoPlay={true} 
                                        poster={movie.backdrop_url || movie.image_url || movie.image}
                                    />
                                </div>
                                <div className="p-6 bg-zinc-900/50">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Video size={18} className="text-primary" /> Official Trailer
                                    </h3>
                                </div>
                            </div>
                        ) : (
                             <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/30">
                                <span className="text-zinc-500 font-bold uppercase tracking-widest">Trailer Unavailable</span>
                            </div>
                        )}
                         <AdsterraBanner />
                    </motion.div>
                )}

                {activeTab === "photos" && (
                    <motion.div 
                      key="photos"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                         <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                            <ImageIcon className="text-primary w-8 h-8" /> Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {tmdbImages.backdrops.map((img, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in ring-1 ring-white/10"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <Image src={img} alt="Gallery" fill className="object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "cast" && (
                    <motion.div 
                      key="cast"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                        {movie.actors?.map((actor, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10">
                                <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 mb-3 mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
                                    <User size={32} />
                                </div>
                                <p className="text-sm font-bold text-white text-center line-clamp-2">{actor}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "related" && (
                    <motion.div 
                      key="related"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                    >
                        {relatedMovies.map((m) => (
                            <div 
                                key={m.id}
                                onClick={() => router.push(`/korean-dramas/${slugify(m.title)}`)}
                                className="group cursor-pointer space-y-3"
                            >
                                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-2">
                                    <Image
                                        src={m.image_url || m.image}
                                        alt={m.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <Play size={20} fill="white" className="text-white" />
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-white line-clamp-1 text-center group-hover:text-primary transition-colors">{m.title}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "reviews" && (
                    <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <CommentSection mediaId={movie.id} mediaType="korean_dramas" />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Glassmorphic Actions Panel */}
            <div className="rounded-[2.5rem] bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-1 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="bg-black/40 rounded-[2.3rem] p-6 md:p-8 space-y-6 relative z-10">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] text-center mb-2">Controls</h3>
                    <div className="space-y-3">
                         <CinematicButton 
                              onClick={() => {
                                  if (movie.download_link) {
                                      setIsDownloadLoading(true);
                                      window.open(movie.download_link, "_blank");
                                      setTimeout(() => setIsDownloadLoading(false), 2000);
                                  } else {
                                      alert("Download link not available.");
                                  }
                              }}
                              icon={Download}
                              variant="primary"
                              triggerAd={true}
                              className="w-full h-14 text-sm"
                              isLoading={isDownloadLoading}
                          >
                              Download Series
                          </CinematicButton>
                        <CinematicButton 
                            onClick={() => setIsShareModalOpen(true)}
                            icon={Share2}
                            variant="secondary"
                            className="w-full h-14 text-sm"
                        >
                            Share Series
                        </CinematicButton>
                    </div>
                </div>
            </div>

            {/* Movie Info Visualizer */}
            <div className="space-y-6 pl-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Details</h3>
                
                <div className="grid grid-cols-1 gap-4">
                     {/* Detail Item */}
                     <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Director</p>
                            <p className="text-sm font-bold text-white">{movie.director || "Unknown"}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                            <Globe size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Country</p>
                            <p className="text-sm font-bold text-white">{movie.country || "South Korea"}</p>
                        </div>
                     </div>

                     <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                             <TrendingUp size={12} /> Genres
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {movie.category?.split(',').map((cat, i) => (
                                <span key={i} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[11px] font-bold text-zinc-300 hover:text-white hover:border-primary/50 transition-all cursor-default">
                                    {cat.trim()}
                                </span>
                            ))}
                        </div>
                     </div>
                </div>
            </div>

            {/* Posters Slider */}
            {tmdbImages.posters.length > 0 && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Gallery</h3>
                        <span className="text-[10px] font-bold text-primary">{tmdbImages.posters.length} Images</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {tmdbImages.posters.slice(0, 6).map((poster, i) => (
                            <div key={i} className="relative aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-xl cursor-zoom-in ring-1 ring-white/10 hover:ring-primary/50 transition-all shadow-xl" onClick={() => setSelectedImage(poster)}>
                                <Image src={poster} alt="Poster" fill className="object-cover transition-transform group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl cursor-zoom-out"
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={40} /></button>
            <div className="relative aspect-[2/3] h-[90vh]">
                <Image src={selectedImage} alt="Preview" fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SocialShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        title={movie.title} 
        url={typeof window !== "undefined" ? window.location.href : ""} 
      />

    </main>
  );
}
