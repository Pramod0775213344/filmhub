"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, 
  LayoutGrid, Globe, Sparkles, Wand2
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SinhalaMoviesManagement() {
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
    country: "Sri Lanka",
    duration: "",
    imdb_rating: "",
    views: 0,
    language: "Sinhala",
    trailer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const fetchMovies = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("sinhala_movies")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMovies(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

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
        country: movie.country || "Sri Lanka",
        duration: movie.duration || "",
        imdb_rating: movie.imdb_rating || "",
        views: movie.views || 0,
        language: movie.language || "Sinhala",
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
        country: "Sri Lanka",
        duration: "",
        imdb_rating: "",
        views: 0,
        language: "Sinhala",
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
        const { error } = await supabase.from("sinhala_movies").update(movieData).eq("id", editingMovie.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sinhala_movies").insert([movieData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      console.error("Error saving movie:", err);
      alert("Error saving movie: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    if (confirm("Are you sure you want to delete this movie?")) {
      const { error } = await supabase.from("sinhala_movies").delete().eq("id", id);
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
              Sinhala <span className="text-primary italic">Movies</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">Manage your Sinhala specific content.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleOpenModal()}
              className="cinematic-glow flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
            >
              <Plus size={20} />
              <span>Add Sinhala Movie</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <LayoutGrid size={14} className="text-primary" />
              Search Library
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search sinhala movies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10"
              />
            </div>
        </div>

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
                <h2 className="font-display text-2xl font-black text-white">{editingMovie ? "Update" : "Add New"} <span className="text-primary italic">Sinhala Movie</span></h2>
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
                  <button type="submit" form="movie-form" className="cinematic-glow flex-grow rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover">{editingMovie ? "Update" : "Add"} Movie</button>
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
