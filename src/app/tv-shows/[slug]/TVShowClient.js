"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Star, Calendar, ArrowLeft, Plus, Check, Download, 
  User, Users, ChevronDown, ChevronUp, PlayCircle, Clock, 
  MessageSquare, Globe, X, Share2, Heart, Video, Image as ImageIcon, Maximize2
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import CommentSection from "@/components/CommentSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";
import CinematicButton from "@/components/CinematicButton";

export default function TVShowClient({ initialShow, initialEpisodes, userId }) {
  const router = useRouter();
  const [show] = useState(initialShow);
  const [episodes] = useState(initialEpisodes);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, episodes, cast, related, reviews
  const [relatedShows, setRelatedShows] = useState([]);
  const [tmdbImages, setTmdbImages] = useState({ backdrops: [], posters: [] });
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
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
    let lastNavVisible = true;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      let isVisible = true;
      
      if (currentScrollY > 100) {
        isVisible = currentScrollY < scrollRef.current;
      }

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
        const results = await searchTMDB(show.title, "tv");
        const match = results.find(r => r.year === show.year) || results[0];
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

    // 5. Fetch Related Shows
    const fetchRelated = async () => {
      if (show && supabase) {
        const categories = show.category?.split(',').map(c => c.trim()) || [];
        if (categories.length > 0) {
          const { data: relatedData } = await supabase
            .from("movies")
            .select("id, title, image_url, image, type, category")
            .eq("type", "TV Show")
            .ilike("category", `%${categories[0]}%`)
            .neq("id", show.id)
            .limit(10);
          
          if (relatedData) setRelatedShows(relatedData);
        }
      }
    };
    fetchRelated();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [show, supabase]);

  useEffect(() => {
    if (tmdbImages.backdrops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % tmdbImages.backdrops.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tmdbImages.backdrops.length]);

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
                src={tmdbImages.backdrops[currentImgIndex] || show.backdrop_url || show.image_url || show.image}
                alt={show.title}
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
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
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
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">IMDb {show.imdb_rating || show.rating || "N/A"}</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-[0.9]">
                    {show.title}
                    <span className="block text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-zinc-400 mt-2 md:mt-4 tracking-normal opacity-80">| සිංහල උපසිරැසි සමඟ</span>
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-[10px] md:text-sm font-bold text-zinc-400 uppercase tracking-widest pt-2 md:pt-4">
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Calendar size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {show.year}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Users size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {seasonNumbers.length} Seasons
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-1.5 md:gap-2">
                        <Globe size={14} className="text-primary md:w-[18px] md:h-[18px]" /> {show.language || "English"}
                    </span>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-6 md:pt-8">
                    <CinematicButton 
                      onClick={() => {
                          setActiveTab("episodes");
                          document.getElementById("tv-content")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      icon={Play}
                      variant="primary"
                      triggerAd={true}
                    >
                        Watch Episodes
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
      <div id="tv-content" className="container-custom relative z-10 -mt-24 pb-20">
        
        {/* Main Tabs UI */}
        <div className="flex gap-4 p-2 bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-full w-fit mx-auto mb-16 overflow-x-auto no-scrollbar max-w-full">
            {["overview", "episodes", "trailer", "cast", "related", "reviews"].map((tab) => (
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
          
          {/* Left Column: Episodes & Media Player & Overview */}
          <div className="lg:col-span-2 space-y-12">
            
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                        <AdsterraBanner />
                        <NativeAd />

                        {/* Storyline Section */}
                        <section className="space-y-8">
                            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 md:p-12 backdrop-blur-sm">
                                <h3 className="mb-8 text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <Globe className="text-primary w-8 h-8" /> 
                                    Storyline
                                </h3>
                                <div className="space-y-8">
                                    {show.description?.split(/\r?\n|\\n/).filter(p => p.trim() !== "").map((para, i) => (
                                        <p key={i} className={`text-xl leading-relaxed ${i === 0 ? "text-[#22c55e] font-bold drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "text-zinc-300"}`}>
                                            {para}
                                        </p>
                                    ))}
                                    {(!show.description || show.description.length === 0) && (
                                        <p className="text-zinc-500 italic">No description available.</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === "episodes" && (
                    <motion.div 
                      key="episodes"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                        {/* Season Selector */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Episodes</h3>
                            <div className="flex gap-2">
                                {seasonNumbers.map((season) => (
                                    <button 
                                        key={season}
                                        onClick={() => setActiveSeason(season)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${activeSeason === season ? "bg-primary text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
                                    >
                                        S{season}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Episode List */}
                        <div className="grid grid-cols-1 gap-4">
                            {currentEpisodes.map((ep) => (
                                <div 
                                    key={ep.id}
                                    onClick={() => setActiveEpisode(ep)}
                                    className={`group flex items-center gap-6 p-4 rounded-3xl border transition-all cursor-pointer ${activeEpisode?.id === ep.id ? "bg-primary/10 border-primary" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                                >
                                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                                        {ep.episode_number}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{ep.title || `Episode ${ep.episode_number}`}</h4>
                                        <p className="text-sm text-zinc-500 line-clamp-1">{ep.description || "Watch this episode with Sinhala subtitles."}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Play size={24} className={activeEpisode?.id === ep.id ? "text-primary" : "text-white/20 group-hover:text-white"} fill={activeEpisode?.id === ep.id ? "currentColor" : "none"} />
                                    </div>
                                </div>
                            ))}
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
                        {show.trailer ? (
                            <div className="space-y-8">
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <Video className="text-primary w-8 h-8" /> Official Trailer
                                </h3>
                                <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-zinc-900 aspect-video">
                                    <VideoPlayer 
                                        url={show.trailer} 
                                        title={`${show.title} Trailer`} 
                                        autoPlay={true} 
                                        poster={show.backdrop_url || show.image_url || show.image}
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
                        {show.cast_details?.map((actor, idx) => (
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
                        {relatedShows.map((m) => (
                            <div 
                                key={m.id}
                                onClick={() => router.push(`/tv-shows/${slugify(m.title)}`)}
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
                        <CommentSection mediaId={show.id} mediaType="tv" />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            
            {/* Quick Details Card */}
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 space-y-6 backdrop-blur-md">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Series Details</h3>
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Initial Release</span>
                        <span className="text-white font-bold text-lg">{show.year}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Country</span>
                        <span className="text-white font-bold text-lg">{show.country || "TBA"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Network</span>
                        <span className="text-white font-bold text-lg">{show.director || "Various"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Genre</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {show.category?.split(',').map((cat, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-300">
                                    {cat.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <CinematicButton 
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: show.title, url: window.location.href });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }
                    }}
                    icon={Share2}
                    variant="secondary"
                    className="w-full"
                >
                    Share Series
                </CinematicButton>
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

      {/* Video Player Modal Overlay */}
      <AnimatePresence>
        {activeEpisode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-6xl space-y-6"
              >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                            S{activeEpisode.season_number} E{activeEpisode.episode_number}: {activeEpisode.title}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setActiveEpisode(null)}
                        className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] shadow-2xl bg-black ring-1 ring-white/10">
                    <VideoPlayer url={activeEpisode.video_url} title={activeEpisode.title} autoPlay={true} />
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                <X size={40} />
            </button>
            
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
