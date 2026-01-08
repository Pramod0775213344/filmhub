"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, 
  Tag, Download, Sparkles, Wand2, Upload, Globe, Settings2, FileVideo, CheckCircle2 
} from "lucide-react";
import { useDebounce } from "use-debounce";

import { sendMovieNotification } from "@/app/actions/sendEmail";
import GoogleDriveUploader from "@/components/admin/GoogleDriveUploader";
import { useUpload } from "@/context/UploadContext";

export default function MoviesManagementPage() {
  return <MoviesContent />;
}

function MoviesContent() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", image_url: "", backdrop_url: "", rating: "", year: "", category: "",
    actors: "", is_featured: false, tag: "", type: "Movie", language: "English", video_url: "",
    download_url: "", director: "", country: "", duration: "", imdb_rating: "", views: 0,
    subtitle_author: "", subtitle_site: "Cineru.LK", cast_details: [], trailer: "",
  });
  const [movieLinks, setMovieLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // TMDB
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isFetchingTMDB, setIsFetchingTMDB] = useState(false);

  // Tools State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");
  const [showTools, setShowTools] = useState(false);
  
  // Context
  const { startUpload, accessToken, setAccessToken } = useUpload();

  const fileInputRef = useRef(null);
  const supabase = createClient();

  const fetchMovies = useCallback(async (search = "") => {
    if (!supabase) return;
    setLoading(true);
    let query = supabase.from("movies").select("*").eq("type", "Movie").order("created_at", { ascending: false });
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
        title: movie.title, description: movie.description, image_url: movie.image_url || movie.image || "",
        backdrop_url: movie.backdrop_url || "", rating: movie.rating?.toString() || "", year: movie.year,
        category: movie.category, actors: movie.actors ? movie.actors.join(", ") : "", is_featured: movie.is_featured || false,
        tag: movie.tag || "", type: movie.type || "Movie", language: movie.language || "English",
        video_url: movie.video_url || "", download_url: movie.download_url || "", director: movie.director || "",
        country: movie.country || "", duration: movie.duration || "", imdb_rating: movie.imdb_rating || "",
        views: movie.views || 0, subtitle_author: movie.subtitle_author || "", subtitle_site: movie.subtitle_site || "Cineru.LK",
        cast_details: movie.cast_details || [], trailer: movie.trailer || "",
      });
      fetchLinks(movie.id);
    } else {
      setEditingMovie(null);
      setMovieLinks([]);
      setFormData({
        title: "", description: "", image_url: "", backdrop_url: "", rating: "", year: "", category: "",
        actors: "", is_featured: false, tag: "", type: "Movie", language: "English", video_url: "",
        download_url: "", director: "", country: "", duration: "", imdb_rating: "", views: 0,
        subtitle_author: "", subtitle_site: "Cineru.LK", cast_details: [], trailer: "",
      });
    }
    setTmdbResults([]);
    setTmdbQuery("");
    setIsModalOpen(true);
  };

  const fetchLinks = async (movieId) => {
    const { data } = await supabase.from("movie_links").select("*").eq("movie_id", movieId);
    setMovieLinks(data || []);
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
      const hasValidImage = details.image_url && !details.image_url.endsWith("null");
      const hasValidBackdrop = details.backdrop_url && !details.backdrop_url.endsWith("null");

      const finalImage = hasValidImage ? details.image_url : (details.posters?.[0] || "");
      const finalBackdrop = hasValidBackdrop ? details.backdrop_url : (details.backdrops?.[0] || "");

      const sanitizedDetails = {
        title: details.title || "",
        description: details.description || "",
        image_url: finalImage,
        backdrop_url: finalBackdrop,
        rating: details.rating?.toString() || "",
        year: details.year || "",
        category: details.category || "",
        actors: details.actors || [],
        director: details.director || "",
        country: details.country || "",
        duration: details.duration || "",
        trailer: details.trailer || "",
        language: details.language || "English",
        imdb_rating: details.imdb_rating || "",
        cast_details: details.cast_details || [],
        tag: details.tag || "",
      };
      
      setFormData(prev => ({ ...prev, ...sanitizedDetails }));
      setEditingMovie(null); 
      setTmdbResults([]);
      setTmdbQuery("");
      setIsModalOpen(true); 
    }
    setIsFetchingTMDB(false);
  };

  // --- Tools Logic ---

  const handleExportLinks = async () => {
    setIsExporting(true);
    try {
      const { data } = await supabase.from("movies").select("id, title, video_url").eq("type", "Movie");
      if (!data?.length) return alert("No movies to export.");
      
      const csvContent = "id,title,video_url\n" + data.map(m => `${m.id},"${(m.title||"").replace(/"/g, '""')}",${m.video_url||""}`).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filmhub-bulk-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e) { console.error(e); alert("Export failed"); }
    setIsExporting(false);
  };

  const handleImportLinks = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split("\n");
      const updates = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const firstComma = line.indexOf(',');
        const lastComma = line.lastIndexOf(',');
        if (firstComma > -1 && lastComma > firstComma) {
          const id = line.substring(0, firstComma).trim();
          const url = line.substring(lastComma+1).trim();
          if (id && url) updates.push({ id, video_url: url });
        }
      }
      if (updates.length) {
         await Promise.all(updates.map(u => supabase.from("movies").update({ video_url: u.video_url }).eq("id", u.id)));
         alert(`Updated ${updates.length} movies.`);
         fetchMovies();
      }
      setIsImporting(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleSyncTrailers = async () => {
    if (!confirm("This will search TMDB for missing trailers. Continue?")) return;
    setIsSyncing(true);
    setSyncProgress("Trailers...");
    try {
      const { data: moviesToUpdate } = await supabase.from("movies").select("id, title, year").or("trailer.is.null,trailer.eq.''");
      if (moviesToUpdate?.length) {
        let count = 0;
        for (const m of moviesToUpdate) {
          setSyncProgress(`${m.title}`);
          const results = await searchTMDB(m.title, "movie");
          const match = results.find(r => r.year === m.year) || results[0];
          if (match) {
            const details = await getTMDBDetails(match.id, "movie");
            if (details?.trailer) {
              await supabase.from("movies").update({ trailer: details.trailer }).eq("id", m.id);
              count++;
            }
          }
          await new Promise(r => setTimeout(r, 200)); 
        }
        alert(`Synced ${count} trailers.`);
        fetchMovies();
      } else { alert("All up to date."); }
    } catch (e) { alert("Sync failed."); }
    setIsSyncing(false); 
    setSyncProgress("");
  };

  const handleSyncLanguages = async () => {
    if (!confirm("This will search TMDB for languages. Continue?")) return;
    setIsSyncing(true);
    setSyncProgress("Languages...");
    try {
        const { data: allMovies } = await supabase.from("movies").select("id, title, year").eq("type", "Movie");
        let count = 0;
        for (const m of allMovies) {
             setSyncProgress(`${m.title}`);
             const results = await searchTMDB(m.title, "movie");
             const match = results.find(r => r.year === m.year) || results[0];
             if (match) {
                 const details = await getTMDBDetails(match.id, "movie");
                 if (details?.language) {
                     await supabase.from("movies").update({ language: details.language }).eq("id", m.id);
                     count++;
                 }
             }
             await new Promise(r => setTimeout(r, 200));
        }
        alert(`Synced ${count} languages.`);
        fetchMovies();
    } catch(e) { alert("Sync failed"); }
    setIsSyncing(false);
    setSyncProgress("");
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this movie?")) {
      await supabase.from("movies").delete().eq("id", id);
      fetchMovies();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
         ...formData,
         rating: parseFloat(formData.rating) || 0,
         actors: Array.isArray(formData.actors) ? formData.actors : formData.actors.split(",").map(s=>s.trim()).filter(Boolean)
      };
      
      let savedMovie;
      if (editingMovie) {
        const { data, error } = await supabase.from("movies").update(payload).eq("id", editingMovie.id).select().single();
        if (error) throw error;
        savedMovie = data;
      } else {
        const { data, error } = await supabase.from("movies").insert([payload]).select().single();
        if (error) throw error;
        savedMovie = data;
        await sendMovieNotification({ title: savedMovie.title, year: savedMovie.year, category: savedMovie.category, typeLabel: "Movie" });
      }

      if (savedMovie) {
        await supabase.from("movie_links").delete().eq("movie_id", savedMovie.id);
        if (movieLinks.length > 0) {
           await supabase.from("movie_links").insert(movieLinks.map(l => ({ ...l, movie_id: savedMovie.id })));
        }
      }
      
      setIsModalOpen(false);
      fetchMovies();
    } catch (e) {
      alert("Error: " + e.message);
    }
    setIsSubmitting(false);
  };


  return (
    <>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              Movies <span className="text-primary italic">Management</span>
            </h1>
            <p className="mt-2 text-zinc-500 font-medium">Add, edit, and organize movies.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setShowTools(!showTools)}
                  className="flex items-center gap-2 rounded-2xl bg-zinc-800 px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                   <Settings2 size={18} /> Tools
                </button>
                <AnimatePresence>
                  {showTools && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1"
                    >
                       <button onClick={handleSyncTrailers} disabled={isSyncing} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white text-left">
                          <Wand2 size={14} /> {isSyncing ? syncProgress : "Sync Trailers"}
                       </button>
                       <button onClick={handleSyncLanguages} disabled={isSyncing} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white text-left">
                          <Globe size={14} /> {isSyncing ? syncProgress : "Sync Languages"}
                       </button>
                       <div className="h-px bg-white/5 my-1" />
                       <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportLinks} className="hidden" />
                       <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white text-left">
                          <Upload size={14} /> Import CSV
                       </button>
                       <button onClick={handleExportLinks} disabled={isExporting} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white text-left">
                          <Download size={14} /> Export CSV
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <button 
                onClick={() => handleOpenModal()} 
                className="cinematic-glow flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-primary-hover active:scale-95 transition-all"
             >
                <Plus size={20} /> Add New
             </button>
          </div>
        </div>

        {/* Search & TMDB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Search Library</label>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                 <input 
                   type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white ring-1 ring-white/10 outline-none focus:ring-primary/50 transition-all"
                 />
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2"><Sparkles size={14} className="text-primary"/> TMDB Import</label>
              <div className="relative flex gap-2">
                 <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text" placeholder="Enter movie title..." value={tmdbQuery} onChange={e => setTmdbQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTMDBSearch()}
                      className="w-full rounded-2xl bg-primary/5 py-4 pl-12 pr-4 text-white ring-1 ring-primary/20 outline-none focus:ring-primary/50 transition-all"
                    />
                 </div>
                 <button onClick={handleTMDBSearch} disabled={isFetchingTMDB} className="rounded-2xl bg-zinc-800 px-6 font-bold text-xs uppercase text-white hover:bg-zinc-700">
                    {isFetchingTMDB ? <Loader2 className="animate-spin" /> : "Find"}
                 </button>
              </div>
           </div>
        </div>

        {/* TMDB Results */}
        <AnimatePresence>
           {tmdbResults.length > 0 && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="glass rounded-[2rem] p-8 ring-1 ring-white/10">
                   <div className="flex justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary">Found {tmdbResults.length} Results</h3>
                      <button onClick={() => setTmdbResults([])}><X className="text-zinc-500 hover:text-white" size={20}/></button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {tmdbResults.map(movie => (
                         <div key={movie.id} className="group relative cursor-pointer" onClick={() => handleTMDBSelect(movie.id)}>
                            <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-zinc-800">
                               <Image src={movie.image_url || "/placeholder.jpg"} alt={movie.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="rounded-lg bg-primary px-3 py-2 text-[10px] font-bold uppercase text-white">Select & Edit</span>
                                </div>
                             </div>
                             <p className="mt-2 text-[10px] font-bold text-white truncate">{movie.title}</p>
                             <p className="text-[10px] text-zinc-500">{movie.year}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
 
         {/* Local Movies List */}
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {loading ? <div className="col-span-full py-20 text-center text-zinc-500">Loading library...</div> : movies.map(movie => (
               <motion.div key={movie.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative rounded-2xl bg-zinc-900/50 p-3 ring-1 ring-white/5 hover:ring-white/20 transition-all hover:bg-zinc-800">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-3">
                     <Image src={movie.image_url || movie.image || "/placeholder.jpg"} alt={movie.title} fill className="object-cover" unoptimized />
                     {!movie.trailer && <div className="absolute top-2 right-2 rounded bg-red-500/80 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">No Trailer</div>}
                  </div>
                  <h3 className="text-xs font-bold text-white truncate">{movie.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                     <span className="text-[10px] text-zinc-500">{movie.year}</span>
                     <div className="flex gap-1">
                        <button onClick={() => handleOpenModal(movie)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"><Edit2 size={12}/></button>
                        <button onClick={() => handleDelete(movie.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"><Trash2 size={12}/></button>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
       </div>
 
       {/* Main Modal */}
       <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-zinc-950 w-full max-w-4xl max-h-[90vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                     <div>
                       <h2 className="text-xl font-black text-white">{editingMovie ? "Edit Movie" : "Add New Movie"}</h2>
                       <p className="text-xs text-zinc-500 font-medium">{editingMovie ? "Update details & links" : "Fill in details manually or from TMDB"}</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"><X size={20}/></button>
                  </div>
 
                  {/* Modal Body */}
                  <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                     <form id="movie-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Basic Info */}
                        <div className="space-y-4 md:col-span-2">
                           <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Basic Information</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold uppercase text-zinc-500">Title</label>
                                 <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold uppercase text-zinc-500">Year</label>
                                 <input value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                 <label className="text-[10px] font-bold uppercase text-zinc-500">Description</label>
                                 <textarea rows={3} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none resize-none"/>
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                 <label className="text-[10px] font-bold uppercase text-zinc-500">Poster URL</label>
                                 <div className="flex gap-4">
                                    <div className="relative h-20 w-14 shrink-0 bg-black rounded overflow-hidden border border-white/10">
                                       {formData.image_url && <Image src={formData.image_url} fill alt="Poster" className="object-cover" unoptimized/>}
                                    </div>
                                    <input value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none self-start"/>
                                 </div>
                              </div>
                           </div>
                        </div>
 
                        {/* Media & Upload - REDESIGNED */}
                        <div className="space-y-4 md:col-span-2 border-t border-white/5 pt-6">
                           <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2"><FileVideo size={14}/> Media & Upload</h3>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Left: Direct URL */}
                              <div className="space-y-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500">Video Storage / Stream URL</label>
                                    <input placeholder="https://..." value={formData.video_url} onChange={e=>setFormData({...formData, video_url: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                                    <p className="text-[10px] text-zinc-600">Enter a direct link (m3u8/mp4) or use the uploader on the right.</p>
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500">Trailer URL (YouTube)</label>
                                    <input placeholder="https://youtube.com/..." value={formData.trailer} onChange={e=>setFormData({...formData, trailer: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                                 </div>
                              </div>
 
                              {/* Right: Cloud Uploader */}
                              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                 <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3"><Upload size={12}/> Google Drive Upload</label>
                                 <GoogleDriveUploader 
                                    onFileSelect={(file) => {
                                       if (!formData.title) return alert("Please enter a Movie Title first to create a folder.");
                                       const folderName = formData.year ? `${formData.title} (${formData.year})` : formData.title;
                                       startUpload(file, folderName);
                                    }}
                                    externalToken={accessToken}
                                    onTokenReceived={setAccessToken}
                                 />
                              </div>
                           </div>
                        </div>
 
                        {/* Advanced Details */}
                        <div className="md:col-span-2 border-t border-white/5 pt-6 grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-zinc-500">Category</label>
                              <input value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-zinc-500">Rating</label>
                              <input type="number" step="0.1" value={formData.rating} onChange={e=>setFormData({...formData, rating: e.target.value})} className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 outline-none"/>
                           </div>
                        </div>
                        
                        {/* Download Links Section */}
                        <div className="md:col-span-2 border-t border-white/5 pt-6 space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><Download size={14}/> Download Links</h3>
                              <button type="button" onClick={() => setMovieLinks([...movieLinks, { quality: "720p", provider: "Direct", url: "", size: "" }])} className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors uppercase">+ Add Quality Group</button>
                           </div>
                           
                           {/* Group Logic Visualization */}
                           <div className="space-y-4">
                              {Object.entries(movieLinks.reduce((acc, link, idx) => {
                                 if (!acc[link.quality]) acc[link.quality] = { size: link.size, links: [] };
                                 acc[link.quality].links.push({ ...link, originalIndex: idx });
                                 return acc;
                              }, {})).map(([quality, group], gIdx) => (
                                 <div key={gIdx} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex gap-4 mb-4">
                                       <select value={quality} onChange={e => {
                                           const newLinks = [...movieLinks];
                                           group.links.forEach(l => { newLinks[l.originalIndex].quality = e.target.value; });
                                           setMovieLinks(newLinks);
                                       }} className="bg-zinc-900 text-white text-xs p-2 rounded-lg outline-none border border-white/10">
                                          <option value="480p">480p</option><option value="720p">720p</option><option value="1080p">1080p</option><option value="4K">4K</option>
                                       </select>
                                       <input placeholder="Size (e.g. 1GB)" value={group.size} onChange={e => {
                                           const newLinks = [...movieLinks];
                                           group.links.forEach(l => { newLinks[l.originalIndex].size = e.target.value; });
                                           setMovieLinks(newLinks);
                                       }} className="bg-zinc-900 text-white text-xs p-2 rounded-lg outline-none border border-white/10 w-24"/>
                                       <button type="button" onClick={() => {
                                           const newLinks = movieLinks.filter((_, i) => !group.links.find(l => l.originalIndex === i));
                                           setMovieLinks(newLinks);
                                       }} className="ml-auto text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                    <div className="space-y-2">
                                       {group.links.map((link, lIdx) => (
                                          <div key={lIdx} className="flex gap-2">
                                             <select value={link.provider} onChange={e => {
                                                const nl = [...movieLinks]; nl[link.originalIndex].provider = e.target.value; setMovieLinks(nl);
                                             }} className="bg-zinc-900 text-white text-xs px-2 rounded-lg border border-white/10 w-32">
                                                <option value="Direct">Direct</option><option value="Google Drive">GDrive</option><option value="Telegram">Telegram</option><option value="Mega.nz">Mega</option>
                                             </select>
                                             <input placeholder="URL" value={link.url} onChange={e => {
                                                const nl = [...movieLinks]; nl[link.originalIndex].url = e.target.value; setMovieLinks(nl);
                                             }} className="bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 flex-grow"/>
                                             <button type="button" onClick={() => setMovieLinks(movieLinks.filter((_, i) => i !== link.originalIndex))} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                                          </div>
                                       ))}
                                       <button type="button" onClick={() => setMovieLinks([...movieLinks, { quality, provider: "Google Drive", url: "", size: group.size }])} className="text-[10px] text-zinc-500 hover:text-primary uppercase font-bold mt-2">+ Add Mirror</button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
 
                     </form>
                  </div>
 
                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
                     <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors">Cancel</button>
                     <button type="submit" form="movie-form" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16} className="hidden"/>}
                        {editingMovie ? "Update Movie" : "Save Movie"}
                     </button>
                  </div>
 
               </motion.div>
            </div>
         )}
       </AnimatePresence>
    </>
  );
}
