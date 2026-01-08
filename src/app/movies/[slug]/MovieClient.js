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
  Share2, Globe, Heart, PlayCircle, Image as ImageIcon, Maximize2, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";
import CinematicButton from "@/components/CinematicButton";

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
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
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
    <main className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      
      {/* Immersive Hero Section */}
      <div className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-black">
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
                loading="eager"
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
        <div className="container-custom relative h-full flex flex-col items-center justify-center pt-20 px-4 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 md:space-y-6 max-w-5xl"
            >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 md:px-6 py-1.5 md:py-2 backdrop-blur-xl border border-primary/30 text-primary mb-2">
                    <Star size={14} className="fill-current md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">IMDb {movie.imdb_rating || movie.rating || "N/A"}</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-[0.9]">
                    {movie.title}
                    <span className="block text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-zinc-400 mt-2 md:mt-4 tracking-normal opacity-80">| සිංහල උපසිරැසි සමඟ</span>
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-[10px] md:text-sm font-bold text-zinc-400 uppercase tracking-widest pt-2 md:pt-4">
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Calendar size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.year}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Clock size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.duration || "120 min"}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Globe size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {movie.language || "English"}
                    </span>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-6 md:pt-8">
                    <CinematicButton 
                      onClick={() => document.getElementById("movie-content")?.scrollIntoView({ behavior: "smooth" })}
                      icon={Play}
                      variant="primary"
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
      <div id="movie-content" className="container-custom relative z-10 -mt-24 pb-20">
        
        {/* Main Tabs UI */}
        <div className="flex gap-4 p-2 bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-full w-fit mx-auto mb-16 overflow-x-auto no-scrollbar max-w-full">
            {["overview", "trailer", "cast", "related", "reviews"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === tab 
                        ? "bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]" 
                        : "text-zinc-500 hover:text-white"
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Left Column: Media Player & Overview */}
          <div className="lg:col-span-2 space-y-12">
            
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-12"
                    >
                        {/* Video Player Area */}
                        {movie.video_url && (
                            <section id="movie-player" className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                        <Video className="text-primary w-8 h-8" /> 
                                        Watch Movie
                                    </h3>
                                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                        Ultra HD 4K
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-zinc-900">
                                    <VideoPlayer url={movie.video_url} title={movie.title} poster={movie.image_url || movie.image} />
                                </div>
                                <AdsterraBanner />
                                <NativeAd />
                            </section>
                        )}

                        {/* Storyline Section */}
                        <section className="space-y-8">
                            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 md:p-12 backdrop-blur-sm">
                                <h3 className="mb-8 text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <Globe className="text-primary w-8 h-8" /> 
                                    Storyline
                                </h3>
                                <div className="space-y-8">
                                    {movie.description?.split(/\r?\n|\\n/).filter(p => p.trim() !== "").map((para, i) => (
                                        <p key={i} className={`text-xl leading-relaxed ${i === 0 ? "text-[#22c55e] font-bold drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "text-zinc-300"}`}>
                                            {para}
                                        </p>
                                    ))}
                                    {(!movie.description || movie.description.length === 0) && (
                                        <p className="text-zinc-500 italic">No description available for this title.</p>
                                    )}
                                </div>
                            </div>
                        </section>
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
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                        <Video className="text-primary w-8 h-8" /> Official Trailer
                                    </h3>
                                </div>
                                <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-zinc-900 aspect-video">
                                    <VideoPlayer 
                                        url={movie.trailer} 
                                        title={`${movie.title} Trailer`} 
                                        autoPlay={true} 
                                        poster={movie.backdrop_url || movie.image_url || movie.image} 
                                    />
                                </div>
                                <AdsterraBanner />
                            </div>
                        ) : (
                            <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white/5 border border-white/5 italic text-zinc-500">
                                Trailer not available for this title.
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "cast" && (
                    <motion.div 
                      key="cast"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                        {movie.cast_details?.map((actor, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-3 transition-all hover:bg-white/10">
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3">
                                    <Image
                                        src={actor.image || "/placeholder-actor.jpg"}
                                        alt={actor.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <p className="text-sm font-bold text-white line-clamp-1">{actor.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider line-clamp-1">{actor.character}</p>
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
                                onClick={() => router.push(`/movies/${slugify(m.title)}`)}
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
                        <CommentSection mediaId={movie.id} mediaType="movie" />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            
            {/* Download/Action Card */}
            <div className="rounded-3xl bg-gradient-to-b from-primary/20 to-transparent p-px">
                <div className="rounded-[23px] bg-zinc-950 p-8 space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Actions</h3>
                    <div className="space-y-3">
                        <CinematicButton 
                            onClick={() => {
                                setIsDownloadLoading(true);
                                router.push(`/download/${movie.id}`);
                            }}
                            icon={Download}
                            variant="primary"
                            className="w-full"
                            isLoading={isDownloadLoading}
                        >
                            Download Now
                        </CinematicButton>
                        <CinematicButton 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: movie.title, url: window.location.href });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Link copied to clipboard!");
                                }
                            }}
                            icon={Share2}
                            variant="secondary"
                            className="w-full"
                        >
                            Share Movie
                        </CinematicButton>
                    </div>
                </div>
            </div>

            {/* Quick Details Card */}
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 space-y-6 backdrop-blur-md">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Movie Details</h3>
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Director</span>
                        <span className="text-white font-bold text-lg">{movie.director || "TBA"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Country</span>
                        <span className="text-white font-bold text-lg">{movie.country || "TBA"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Genre</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {movie.category?.split(',').map((cat, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-300">
                                    {cat.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Posters Slider */}
            {tmdbImages.posters.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest px-2">Official Posters</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {tmdbImages.posters.slice(0, 5).map((poster, i) => (
                            <div key={i} className="relative aspect-[2/3] w-40 flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-xl group cursor-pointer" onClick={() => setSelectedImage(poster)}>
                                <Image src={poster} alt="Poster" fill className="object-cover transition-transform group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={40} /></button>
            <div className="relative aspect-[2/3] h-[90vh]">
                <Image src={selectedImage} alt="Preview" fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
