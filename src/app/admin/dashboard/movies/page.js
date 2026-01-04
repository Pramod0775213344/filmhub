"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, 
  Tag, Users, User, Clock, FileText, ImageIcon, LayoutGrid, 
  Globe, Video, Download, Sparkles, Wand2, Upload
} from "lucide-react";
import { useDebounce } from "use-debounce";
import AdminLayout from "@/components/admin/AdminLayout";

export default function MoviesManagement() {
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
    subtitle_author: "",
    subtitle_site: "Cineru.LK",
    cast_details: [],
    trailer: "",
  });
  const [movieLinks, setMovieLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isFetchingTMDB, setIsFetchingTMDB] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const supabase = createClient();

  const fetchMovies = useCallback(async (search = "") => {
    if (!supabase) return;
    setLoading(true);
    
    let query = supabase
      .from("movies")
      .select("*")
      .eq("type", "Movie")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;
    if (!error) setMovies(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMovies(debouncedSearch);
  }, [fetchMovies, debouncedSearch]);

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        image_url: movie.image_url || movie.image || "",
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
        subtitle_site: movie.subtitle_site || "Cineru.LK",
        cast_details: movie.cast_details || [],
        trailer: movie.trailer || "",
      });
      
      const fetchLinks = async () => {
        const { data, error } = await supabase.from("movie_links").select("*").eq("movie_id", movie.id);
        if (!error && data && data.length > 0) {
          setMovieLinks(data);
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
        subtitle_site: "Cineru.LK",
        cast_details: [],
        trailer: "",
      });
    }
    setTmdbResults([]);
    setTmdbQuery("");
    setIsModalOpen(true);
  };

  const handleTMDBSearch = async () => {
    if (!tmdbQuery) return;
    setIsFetchingTMDB(true);
    const results = await searchTMDB(tmdbQuery, "movie");
    setTmdbResults(results);
    setIsFetchingTMDB(false);
  };

  const handleTMDBSelect = async (tmdbId) => {
    setIsFetchingTMDB(true);
    const details = await getTMDBDetails(tmdbId, "movie");
    if (details) {
      setFormData(prev => ({
        ...prev,
        ...details,
      }));
      setTmdbResults([]);
      setTmdbQuery("");
    }
    setIsFetchingTMDB(false);
  };

  const handleAutoSaveTMDB = async (tmdbId) => {
    setIsFetchingTMDB(true);
    try {
      const details = await getTMDBDetails(tmdbId, "movie");
      if (details) {
        const movieData = {
          ...details,
          type: "Movie",
          rating: parseFloat(details.rating) || 0,
          actors: details.actors ? (Array.isArray(details.actors) ? details.actors : details.actors.split(",").map(s => s.trim())) : [],
        };

        const validMovieFields = [
          "title", "description", "rating", "year", "category", "actors", 
          "is_featured", "tag", "video_url", "download_url", "director", 
          "country", "duration", "imdb_rating", "type", "language", "image_url", "backdrop_url", "cast_details", "trailer"
        ];

        const prunedData = {};
        validMovieFields.forEach(field => {
          if (movieData[field] !== undefined) {
            prunedData[field] = movieData[field];
          }
        });

        const { error } = await supabase.from("movies").insert([prunedData]);
        if (error) throw error;
        
        setTmdbResults([]);
        setTmdbQuery("");
        fetchMovies();
      }
    } catch (err) {
      alert("Error auto-saving movie: " + err.message);
    }
    setIsFetchingTMDB(false);
  };

  const handleExportLinks = async () => {
    if (!supabase) return;
    setIsExporting(true);
    try {
      // Fetch ALL movies for CSV
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, video_url")
        .eq("type", "Movie");

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No movies found to export.");
        setIsExporting(false);
        return;
      }

      // Generate CSV Content
      const headers = "id,title,video_url\n";
      const rows = data.map(m => {
        // Escape quotes in title
        const title = m.title ? `"${m.title.replace(/"/g, '""')}"` : '""';
        const url = m.video_url || "";
        return `${m.id},${title},${url}`;
      }).join("\n");
      
      const fileContent = headers + rows;

      // Create download
      const blob = new Blob([fileContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filmhub-bulk-links-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export links.");
    }
    setIsExporting(false);
  };

  const handleImportLinks = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const updates = [];

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parse: id, "title", url
        // We really only need ID and URL. 
        // Regex to match: UUID, quoted title, URL
        // Match: (id), ("title" or anything), (url)
        // Let's assume standard format generated by us.
        // Split by comma BUT ignore commas inside quotes? 
        // Simpler: Find first comma (end of ID) and last comma (start of URL)
        
        try {
           const firstComma = line.indexOf(',');
           const lastComma = line.lastIndexOf(',');
           
           if (firstComma === -1 || lastComma === -1 || firstComma === lastComma) continue; // Invalid row

           const id = line.substring(0, firstComma).trim();
           // title is between first and last comma
           const url = line.substring(lastComma + 1).trim();

           if (id && url) {
             updates.push({ id, video_url: url });
           }
        } catch (err) {
           console.warn("Skipping invalid row:", line);
        }
      }

      if (updates.length > 0) {
        // Batch update in chunks
        const chunkSize = 50;
        let successCount = 0;
        
        for (let i = 0; i < updates.length; i += chunkSize) {
          const chunk = updates.slice(i, i + chunkSize);
          const promises = chunk.map(item => 
            supabase.from("movies").update({ video_url: item.video_url }).eq("id", item.id)
          );
          
          await Promise.all(promises);
          successCount += chunk.length;
        }
        
        alert(`Successfully updated ${successCount} movies!`);
        fetchMovies(); // Refresh list
      } else {
        alert("No valid updates found in CSV.");
      }
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
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

    const validMovieFields = [
      "title", "description", "rating", "year", "category", "actors", 
      "is_featured", "tag", "video_url", "download_url", "director", 
      "country", "duration", "imdb_rating", "type", "language", "image_url", "backdrop_url", "cast_details", "trailer"
    ];

    const prunedData = {};
    validMovieFields.forEach(field => {
      if (movieData[field] !== undefined) {
        prunedData[field] = movieData[field];
      }
    });

    try {
      if (editingMovie) {
        const { data: movie, error } = await supabase.from("movies").update(prunedData).eq("id", editingMovie.id).select().single();
        if (error) throw error;

        if (movie) {
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
        const { data: movie, error } = await supabase.from("movies").insert([prunedData]).select().single();
        if (error) throw error;

        if (movie) {
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
    } catch (err) {
      console.error("Error saving movie:", err);
      alert("Error saving movie: " + err.message);
    }
    setIsSubmitting(false);
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");

  const handleSyncTrailers = async () => {
    if (!supabase) return;
    if (!confirm("This will search TMDB for trailers for ALL movies that don't have one correctly set. This might take a while. Continue?")) return;
    
    setIsSyncing(true);
    setSyncProgress("Starting sync...");

    try {
      // 1. Fetch movies needing trailers
      const { data: moviesToUpdate, error } = await supabase
        .from("movies")
        .select("id, title, year")
        .or("trailer.is.null,trailer.eq.''");

      if (error) throw error;
      
      if (!moviesToUpdate || moviesToUpdate.length === 0) {
        alert("No movies found that need trailer syncing!");
        setIsSyncing(false);
        return;
      }

      let updatedCount = 0;
      let notFoundCount = 0;

      for (let i = 0; i < moviesToUpdate.length; i++) {
        const movie = moviesToUpdate[i];
        setSyncProgress(`Processing ${i + 1}/${moviesToUpdate.length}: ${movie.title}...`);

        // 2. Search TMDB
        const searchResults = await searchTMDB(movie.title, "movie");
        // Try to match by year if possible for better accuracy
        const match = searchResults.find(r => r.year === movie.year) || searchResults[0];

        if (match) {
           // 3. Get Details (includes trailer info from our previous update to tmdb.js)
           const details = await getTMDBDetails(match.id, "movie");
           
           if (details && details.trailer) {
             // 4. Update Database
             await supabase
               .from("movies")
               .update({ trailer: details.trailer })
               .eq("id", movie.id);
             updatedCount++;
           } else {
             notFoundCount++;
           }
        } else {
          notFoundCount++;
        }
        
        // Small delay to avoid hitting rate limits too hard
        await new Promise(r => setTimeout(r, 250));
      }

      alert(`Sync Complete!\nUpdated: ${updatedCount}\nCoould not find: ${notFoundCount}`);
      fetchMovies();

    } catch (err) {
      console.error("Sync error:", err);
      alert("Error during sync: " + err.message);
    } finally {
      setIsSyncing(false);
      setSyncProgress("");
    }
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    if (confirm("Are you sure you want to delete this movie?")) {
      const { error } = await supabase.from("movies").delete().eq("id", id);
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
              Movies <span className="text-primary italic">Management</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">Add, edit, or remove movies from the library.</p>
          </div>
          <div className="flex gap-4">
            <input 
              type="file" 
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportLinks}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className={`flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-800 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-700 active:scale-95 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isImporting ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{isImporting ? "Importing..." : "Import CSV"}</span>
            </button>
            <button 
              onClick={handleExportLinks}
              disabled={isExporting}
              className={`flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-800 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-700 active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </button>
            <button 
              onClick={handleSyncTrailers}
              disabled={isSyncing}
              className={`flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-4 text-sm font-black uppercase tracking-widest text-primary transition-all hover:bg-primary/20 active:scale-95 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              <span>{isSyncing ? syncProgress : "Auto-Sync Trailers"}</span>
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="cinematic-glow flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
            >
              <Plus size={20} />
              <span>Add New Movie</span>
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
                placeholder="Search movies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              TMDB Fast Import
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-grow">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter TMDB title..." 
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTMDBSearch()}
                  className="w-full rounded-2xl bg-primary/5 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-primary/20 focus:ring-primary/50"
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
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">TMDB Search Results</h3>
                  <button onClick={() => setTmdbResults([])} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {tmdbResults.map((result) => (
                    <div key={result.id} className="group relative">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/5">
                        <Image 
                          src={result.image_url || "/placeholder-card.jpg"} 
                          alt={result.title || "Movie poster"} 
                          fill 
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                          sizes="200px"
                        />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2 text-center backdrop-blur-sm">
                          <button 
                            onClick={() => handleAutoSaveTMDB(result.id)}
                            className="w-full rounded-lg bg-primary py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-hover flex items-center justify-center gap-2"
                          >
                            <Sparkles size={12} /> Auto Add
                          </button>
                          <button 
                            onClick={() => handleTMDBSelect(result.id)} 
                            className="w-full rounded-lg bg-white/10 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 flex items-center justify-center gap-2"
                          >
                            <Edit2 size={12} /> Fill Form
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

        {/* Local Movies Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <AnimatePresence>
            {movies.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 p-4 ring-1 ring-white/10 transition-all hover:bg-zinc-900 hover:ring-white/20"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                  <Image 
                    src={movie.image_url || movie.image || "/placeholder-card.jpg"} 
                    alt={movie.title} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105" 
                    sizes="200px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4">
                    <h3 className="font-display text-lg font-black text-white">{movie.title}</h3>
                  </div>
                  {(!movie.trailer || movie.trailer.trim() === "") && (
                    <div className="absolute top-2 right-2 rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-sm">
                      No Trailer
                    </div>
                  )}
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
                <h2 className="font-display text-2xl font-black text-white">{editingMovie ? "Update" : "Add New"} <span className="text-primary italic">Movie</span></h2>
                <div className="flex items-center gap-4">
                   <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/5 p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><X size={20} /></button>
                </div>
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
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Video URL (m3u8/mp4)</label>
                    <input type="text" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Trailer URL (YouTube)</label>
                    <input type="text" value={formData.trailer} onChange={(e) => setFormData({...formData, trailer: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                    <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Director</label>
                    <input type="text" value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Country</label>
                    <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Language</label>
                    <input type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                     <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Tag (e.g. 4K, HD)</label>
                    <input type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10" />
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
