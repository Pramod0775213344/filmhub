"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, 
  LayoutGrid, Globe, Sparkles, Wand2, Upload, Download
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useDebounce } from "use-debounce";

export default function KoreanDramasManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    backdrop_url: "",
    rating: "",
    year: "",
    category: "",
    actors: "",
    is_featured: false,
    tag: "",
    video_url: "",
    download_url: "",
    director: "",
    country: "South Korea",
    duration: "",
    imdb_rating: "",
    views: 0,
    language: "Korean",
    trailer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isFetchingTMDB, setIsFetchingTMDB] = useState(false);
  
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const supabase = createClient();

  const fetchMovies = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("korean_dramas")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMovies(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // TMDB Search with strict Korean filtering
  const handleTMDBSearch = async () => {
    if (!tmdbQuery) return;
    setIsFetchingTMDB(true);
    // Search TV shows first as most Kdramas are TV
    const results = await searchTMDB(tmdbQuery, "tv");
    
    // Filter strictly for Korean content
    const koreanResults = results.filter(item => item.original_language === 'ko');
    
    if (koreanResults.length === 0 && results.length > 0) {
       // Optional: Notify user that results were found but filtered out
       console.log("Results found but filtered because they are not Korean.");
    }
    
    setTmdbResults(koreanResults);
    setIsFetchingTMDB(false);
  };

  const handleTMDBSelect = async (tmdbId) => {
    setIsFetchingTMDB(true);
    const details = await getTMDBDetails(tmdbId, "tv");
    if (details) {
      setFormData(prev => ({
        ...prev,
        ...details,
        title: details.title || details.name, // Ensure title is set
        rating: details.rating?.toString() || "",
        country: "South Korea",
        language: "Korean",
        type: "Korean Drama"
      }));
      setTmdbResults([]);
      setTmdbQuery("");
      setIsModalOpen(true);
    }
    setIsFetchingTMDB(false);
  };

  const handleAutoSaveTMDB = async (tmdbId) => {
    setIsFetchingTMDB(true);
    try {
      const details = await getTMDBDetails(tmdbId, "tv");
      if (details) {
        const movieData = {
          title: details.title || details.name,
          description: details.description,
          image_url: details.image_url,
          backdrop_url: details.backdrop_url,
          rating: parseFloat(details.rating) || 0,
          year: details.year,
          category: details.category,
          actors: details.actors ? (Array.isArray(details.actors) ? details.actors : details.actors.split(",").map(s => s.trim())) : [],
          country: "South Korea",
          language: "Korean",
          duration: details.duration,
          imdb_rating: details.imdb_rating,
          trailer: details.trailer,
          views: 0
        };

        // Prune fields to match table schema if necessary, or rely on Supabase ignoring extras if configured (but better to be safe)
        // For now, assuming table accepts these fields. 
        // Important: Excluding 'backdrops' and 'posters' arrays if column doesn't exist, but 'tmdb.js' returns them.
        // We'll keep it simple for now.

        const { error } = await supabase.from("korean_dramas").insert([movieData]);
        if (error) throw error;
        
        setTmdbResults([]);
        setTmdbQuery("");
        fetchMovies();
      }
    } catch (err) {
      alert("Error auto-saving drama: " + err.message);
    }
    setIsFetchingTMDB(false);
  };

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        image_url: movie.image_url || "",
        backdrop_url: movie.backdrop_url || "",
        rating: movie.rating?.toString() || "",
        year: movie.year || "",
        category: movie.category || "",
        actors: movie.actors ? movie.actors.join(", ") : "",
        is_featured: movie.is_featured || false,
        tag: movie.tag || "",
        video_url: movie.video_url || "",
        download_url: movie.download_url || "",
        director: movie.director || "",
        country: movie.country || "South Korea",
        duration: movie.duration || "",
        imdb_rating: movie.imdb_rating || "",
        views: movie.views || 0,
        language: movie.language || "Korean",
        trailer: movie.trailer || "",
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        backdrop_url: "",
        rating: "",
        year: "",
        category: "",
        actors: "",
        is_featured: false,
        tag: "",
        video_url: "",
        download_url: "",
        director: "",
        country: "South Korea",
        duration: "",
        imdb_rating: "",
        views: 0,
        language: "Korean",
        trailer: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSubmitting(true);

    const movieData = {
      ...formData,
      rating: parseFloat(formData.rating) || 0,
      actors: formData.actors ? (Array.isArray(formData.actors) ? formData.actors : formData.actors.split(",").map(s => s.trim()).filter(s => s)) : [],
    };

    try {
      if (editingMovie) {
        const { error } = await supabase.from("korean_dramas").update(movieData).eq("id", editingMovie.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("korean_dramas").insert([movieData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      console.error("Error saving drama:", err);
      alert("Error saving drama: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    if (confirm("Are you sure you want to delete this drama?")) {
      const { error } = await supabase.from("korean_dramas").delete().eq("id", id);
      if (!error) fetchMovies();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              Korean <span className="text-primary italic">Dramas</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">Manage your Korean content.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => handleOpenModal()}
              className="cinematic-glow flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
            >
              <Plus size={20} />
              <span>Add Korean Drama</span>
            </button>
          </div>
        </div>

        {/* Search Bar & TMDB Quick Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <LayoutGrid size={14} className="text-primary" />
              Local Library Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search korean dramas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              TMDB Fast Import (Korean Only)
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-grow">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter Drama Title..." 
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTMDBSearch()}
                  className="w-full rounded-2xl bg-primary/5 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-primary/20 focus:ring-primary/50"
                  autoComplete="off"
                />
              </div>
              <button 
                onClick={handleTMDBSearch}
                disabled={isFetchingTMDB}
                className="rounded-2xl bg-zinc-800 px-6 font-black uppercase text-xs tracking-widest text-white hover:bg-zinc-700 transition-colors"
              >
                {isFetchingTMDB ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* TMDB Results Drawer */}
        <AnimatePresence>
          {tmdbResults.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-[2rem] p-8 ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">TMDB Search Results (Korean)</h3>
                  <button onClick={() => setTmdbResults([])} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {tmdbResults.map((result) => (
                    <div key={result.id} className="group relative">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/5 relative">
                        <Image 
                          src={result.image_url || "/placeholder-card.jpg"} 
                          alt={result.title || "Poster"} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized
                          sizes="200px"
                        />
                         {/* Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        
                        {/* Floating Buttons */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
                          <button 
                            onClick={() => handleAutoSaveTMDB(result.id)}
                            className="w-full rounded-xl bg-primary/90 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md transition-all hover:bg-primary hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-primary/50"
                          >
                            <Sparkles size={12} fill="currentColor" /> Quick Add
                          </button>
                          <button 
                            onClick={() => handleTMDBSelect(result.id)} 
                            className="w-full rounded-xl bg-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-white/20"
                          >
                            <Edit2 size={12} /> Edit Draft
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] font-black text-white uppercase truncate">{result.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">{result.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <AnimatePresence>
            {movies.filter(movie => 
              movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              movie.category?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 p-4 ring-1 ring-white/10 transition-all hover:bg-zinc-900 hover:ring-white/20"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                  <Image src={movie.image_url || "/placeholder-card.jpg"} alt={movie.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="200px" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4">
                    <h3 className="font-display text-lg font-black text-white">{movie.title}</h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                    <Star size={12} className="text-primary" fill="currentColor" />
                    <span>{movie.rating}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(movie)} className="rounded-xl bg-white/5 p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(movie.id)} className="rounded-xl bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary/20">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 shadow-2xl">
              <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-display text-2xl font-black text-white">{editingMovie ? "Update" : "Add New"} <span className="text-primary italic">Korean Drama</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/5 p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 pt-4 custom-scrollbar">
                <form id="movie-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Rating</label>
                    <input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Year</label>
                    <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Poster URL</label>
                    <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Video URL (Direct/Cloudinary)</label>
                    <input type="text" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                   <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Trailer URL</label>
                    <input type="text" value={formData.trailer} onChange={(e) => setFormData({...formData, trailer: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                    <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 resize-none" />
                  </div>
                </form>
              </div>
              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <div className="flex gap-4">
                  <button type="submit" form="movie-form" className="cinematic-glow flex-grow rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover">{editingMovie ? "Update" : "Add"} Drama</button>
                  <button onClick={() => setIsModalOpen(false)} className="rounded-2xl bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-zinc-400">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
