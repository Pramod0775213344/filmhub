"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, Tag, Users, ImageIcon, LayoutGrid, Globe, Video, Download } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
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
    country: "",
    duration: "",
    imdb_rating: "",
    views: 0,
    subtitle_author: "",
    subtitle_site: "Cineru.LK",
  });
  const [movieLinks, setMovieLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const fetchMovies = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    if (!error) setMovies(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        fetchMovies();
      } catch (err) {
        console.error("Dashboard initialization failed:", err);
        setLoading(false);
      }
    };
    checkAuthAndLoad();
  }, [fetchMovies, router, supabase]);

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        image_url: movie.image_url,
        backdrop_url: movie.backdrop_url || "",
        rating: movie.rating.toString(),
        year: movie.year,
        category: movie.category,
        actors: movie.actors ? movie.actors.join(", ") : "",
        is_featured: movie.is_featured || false,
        tag: movie.tag || "",
        type: movie.type || "Movie",
        language: movie.language || "English",
        video_url: movie.video_url || "",
        download_url: movie.download_url || "",
        director: movie.director || "",
        country: movie.country || "",
        duration: movie.duration || "",
        imdb_rating: movie.imdb_rating || "",
        views: movie.views || 0,
        subtitle_author: movie.subtitle_author || "",
        subtitle_site: movie.subtitle_site || "Cineru.LK",
      });
      // Fetch links for the movie
      const fetchLinks = async () => {
        const { data, error } = await supabase.from("movie_links").select("*").eq("movie_id", movie.id);
        if (!error && data && data.length > 0) {
          setMovieLinks(data);
        } else if (movie.download_url) {
          setMovieLinks([{ provider: "Direct", quality: "HD", size: "Unknown", url: movie.download_url }]);
        } else {
          setMovieLinks([]);
        }
      };
      fetchLinks();
    } else {
      setEditingMovie(null);
      setMovieLinks([]);
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
        type: "Movie",
        language: "English",
        video_url: "",
        download_url: "",
        director: "",
        country: "",
        duration: "",
        imdb_rating: "",
        views: 0,
        subtitle_author: "",
        subtitle_site: "Cineru.LK",
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
      rating: parseFloat(formData.rating),
      actors: formData.actors.split(",").map(s => s.trim()).filter(s => s),
    };

    if (editingMovie) {
      const { data: movie, error } = await supabase.from("movies").update(movieData).eq("id", editingMovie.id).select().single();
      if (!error && movie) {
        // Update links
        await supabase.from("movie_links").delete().eq("movie_id", movie.id);
        if (movieLinks.length > 0) {
          await supabase.from("movie_links").insert(movieLinks.map(l => ({
            movie_id: movie.id,
            provider: l.provider,
            quality: l.quality,
            size: l.size,
            url: l.url
          })));
        }
        setIsModalOpen(false);
        fetchMovies();
      }
    } else {
      const { data: movie, error } = await supabase.from("movies").insert([movieData]).select().single();
      if (!error && movie) {
        // Insert links
        if (movieLinks.length > 0) {
          await supabase.from("movie_links").insert(movieLinks.map(l => ({
            movie_id: movie.id,
            provider: l.provider,
            quality: l.quality,
            size: l.size,
            url: l.url
          })));
        }
        setIsModalOpen(false);
        fetchMovies();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    if (confirm("Are you sure you want to delete this movie?")) {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (!error) fetchMovies();
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              Admin <span className="text-primary italic">Dashboard</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">Manage your cinematic collection.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="cinematic-glow flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Movie</span>
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10 focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-400 px-4">
            <LayoutGrid size={18} className="text-primary" />
            <span>{movies.length} Movies Found</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  <Image src={movie.image_url || movie.image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"} alt={movie.title} fill className="object-cover transition-transform group-hover:scale-105" />
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
                    <button onClick={() => handleOpenModal(movie)} className="rounded-lg bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(movie.id)} className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass relative w-full max-w-2xl overflow-hidden rounded-3xl p-8 shadow-2xl md:p-12"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="font-display text-3xl font-black text-white">
                {editingMovie ? "Update" : "Add New"} <span className="text-primary italic">Movie</span>
              </h2>

              <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Tag size={12} />
                    Movie Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Star size={12} />
                    Rating (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Calendar size={12} />
                    Release Year
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Plus size={12} />
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <ImageIcon size={12} />
                    Poster URL (TMDB Path)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                    placeholder="https://image.tmdb.org/t/p/..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <ImageIcon size={12} />
                    Backdrop URL
                  </label>
                  <input
                    type="text"
                    value={formData.backdrop_url}
                    onChange={(e) => setFormData({...formData, backdrop_url: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                    placeholder="https://image.tmdb.org/t/p/original/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <LayoutGrid size={12} />
                    Content Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Movie" className="bg-zinc-900">Movie</option>
                    <option value="TV Show" className="bg-zinc-900">TV Show</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Globe size={12} />
                    Language
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Video size={12} />
                    Video Player URL (YouTube/Direct)
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Download size={12} />
                    Download URL
                  </label>
                  <input
                    type="text"
                    value={formData.download_url}
                    onChange={(e) => setFormData({...formData, download_url: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                    placeholder="https://example.com/download/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({...formData, director: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Duration (e.g. 111 min)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">IMDb Rating (e.g. 6.3)</label>
                  <input
                    type="text"
                    value={formData.imdb_rating}
                    onChange={(e) => setFormData({...formData, imdb_rating: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Subtitle Author</label>
                  <input
                    type="text"
                    value={formData.subtitle_author}
                    onChange={(e) => setFormData({...formData, subtitle_author: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Subtitle Site</label>
                  <input
                    type="text"
                    value={formData.subtitle_site}
                    onChange={(e) => setFormData({...formData, subtitle_site: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="h-5 w-5 rounded border-white/10 bg-zinc-900 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_featured" className="text-sm font-bold text-white cursor-pointer uppercase tracking-widest">
                    Featured
                  </label>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                    <Users size={12} />
                    Actors (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.actors}
                    onChange={(e) => setFormData({...formData, actors: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                    placeholder="David Corenswet, Rachel Brosnahan..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Movie Links Management */}
                <div className="space-y-4 md:col-span-2 bg-white/5 p-6 rounded-3xl ring-1 ring-white/10 mt-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                      <Download size={12} />
                      Download Links
                    </label>
                    <button
                      type="button"
                      onClick={() => setMovieLinks([...movieLinks, { provider: "Pixeldrain", quality: "FHD 1080p", size: "", url: "" }])}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                    >
                      + Add Link
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {movieLinks.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-black/30 p-4 rounded-2xl ring-1 ring-white/5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-600 uppercase">Provider</label>
                          <input 
                            type="text" 
                            value={link.provider} 
                            onChange={(e) => {
                              const newLinks = [...movieLinks];
                              newLinks[index].provider = e.target.value;
                              setMovieLinks(newLinks);
                            }}
                            className="w-full bg-zinc-900 rounded-lg p-2 text-xs text-white outline-none"
                            placeholder="Pixeldrain"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-600 uppercase">Quality</label>
                          <input 
                            type="text" 
                            value={link.quality} 
                            onChange={(e) => {
                              const newLinks = [...movieLinks];
                              newLinks[index].quality = e.target.value;
                              setMovieLinks(newLinks);
                            }}
                            className="w-full bg-zinc-900 rounded-lg p-2 text-xs text-white outline-none"
                            placeholder="FHD 1080p"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-600 uppercase">Size</label>
                          <input 
                            type="text" 
                            value={link.size} 
                            onChange={(e) => {
                              const newLinks = [...movieLinks];
                              newLinks[index].size = e.target.value;
                              setMovieLinks(newLinks);
                            }}
                            className="w-full bg-zinc-900 rounded-lg p-2 text-xs text-white outline-none"
                            placeholder="2.74 GB"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase">URL</label>
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={(e) => {
                                const newLinks = [...movieLinks];
                                newLinks[index].url = e.target.value;
                                setMovieLinks(newLinks);
                              }}
                              className="w-full bg-zinc-900 rounded-lg p-2 text-xs text-white outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setMovieLinks(movieLinks.filter((_, i) => i !== index))}
                            className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {movieLinks.length === 0 && (
                      <p className="text-center py-4 text-xs font-bold text-zinc-600 italic">No download links added</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cinematic-glow flex-grow rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 flex justify-center items-center"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingMovie ? "Update Movie" : "Add Movie")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="hidden md:block rounded-2xl bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
