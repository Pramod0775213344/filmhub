"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchTMDB, getTMDBDetails } from "@/utils/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Plus, Trash2, Edit2, Search, X, Loader2, Star, Calendar, 
  Tag, Users, User, Clock, FileText, ImageIcon, LayoutGrid, 
  Globe, Video, Download, ListOrdered, PlusCircle, ChevronRight, ChevronDown,
  Sparkles, Wand2
} from "lucide-react";
import { sendMovieNotification } from "@/app/actions/sendEmail";
import GoogleDriveUploader from "@/components/admin/GoogleDriveUploader";
import { useUpload } from "@/context/UploadContext";


export default function TVShowsManagement() {
  const [shows, setShows] = useState([]);
  const { startUpload, accessToken, setAccessToken } = useUpload();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [editingEpisode, setEditingEpisode] = useState(null);
  
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
    language: "English",
    director: "",
    country: "",
    duration: "",
    imdb_rating: "",
  });

  const [episodeData, setEpisodeData] = useState({
    season_number: 1,
    episode_number: 1,
    title: "",
    description: "",
    video_url: "",
    download_url: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isFetchingTMDB, setIsFetchingTMDB] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  const fetchShows = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("type", "TV Show")
      .order("created_at", { ascending: false });
    if (!error) setShows(data);
    setLoading(false);
  }, [supabase]);

  const fetchEpisodes = async (showId) => {
    const { data, error } = await supabase
      .from("tv_episodes")
      .select("*")
      .eq("tv_show_id", showId)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true });
    if (!error) setEpisodes(data);
  };

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const handleOpenModal = (show = null) => {
    if (show) {
      setEditingShow(show);
      setFormData({
        title: show.title,
        description: show.description,
        image_url: show.image_url || "",
        backdrop_url: show.backdrop_url || "",
        rating: show.rating.toString(),
        year: show.year,
        category: show.category,
        actors: show.actors ? (Array.isArray(show.actors) ? show.actors.join(", ") : show.actors) : "",
        is_featured: show.is_featured || false,
        tag: show.tag || "",
        language: show.language || "English",
        director: show.director || "",
        country: show.country || "",
        duration: show.duration || "",
        imdb_rating: show.imdb_rating || "",
      });
    } else {
      setEditingShow(null);
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
        language: "English",
        director: "",
        country: "",
        duration: "",
        imdb_rating: "",
      });
    }
    setTmdbResults([]);
    setTmdbQuery("");
    setIsModalOpen(true);
  };

  const handleTMDBSearch = async () => {
    if (!tmdbQuery) return;
    setIsFetchingTMDB(true);
    const results = await searchTMDB(tmdbQuery, "tv");
    setTmdbResults(results);
    setIsFetchingTMDB(false);
  };

  const handleTMDBSelect = async (tmdbId) => {
    setIsFetchingTMDB(true);
    const details = await getTMDBDetails(tmdbId, "tv");
    if (details) {
      setFormData(prev => ({
        ...prev,
        ...details,
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
        const showData = {
          ...details,
          type: "TV Show",
          rating: parseFloat(details.rating) || 0,
          actors: details.actors ? (Array.isArray(details.actors) ? details.actors : details.actors.split(",").map(s => s.trim())) : [],
        };

        const validFields = [
          "title", "description", "rating", "year", "category", "actors", 
          "is_featured", "tag", "director", "country", "duration", "imdb_rating", 
          "type", "language", "image_url", "backdrop_url"
        ];

        const prunedData = {};
        validFields.forEach(field => {
          if (showData[field] !== undefined) {
            prunedData[field] = showData[field];
          }
        });

        const { data: insertedShow, error } = await supabase.from("movies").insert([prunedData]).select().single();
        if (error) throw error;
        
        // Send notification
        if (insertedShow) {
          await sendMovieNotification({
            title: insertedShow.title,
            year: insertedShow.year,
            category: insertedShow.category,
            typeLabel: "TV Show"
          });
        }

        
        setTmdbResults([]);
        setTmdbQuery("");
        fetchShows();
      }
    } catch (err) {
      alert("Error auto-saving TV show: " + err.message);
    }
    setIsFetchingTMDB(false);
  };

  const handleOpenEpisodeModal = (show, episode = null) => {
    setSelectedShow(show);
    if (episode) {
      setEditingEpisode(episode);
      setEpisodeData({
        season_number: episode.season_number,
        episode_number: episode.episode_number,
        title: episode.title || "",
        description: episode.description || "",
        video_url: episode.video_url || "",
        download_url: episode.download_url || "",
      });
    } else {
      setEditingEpisode(null);
      const maxEpisode = episodes.filter(e => e.season_number === 1).length;
      setEpisodeData({
        season_number: 1,
        episode_number: maxEpisode + 1,
        title: "",
        description: "",
        video_url: "",
        download_url: "",
      });
    }
    setIsEpisodeModalOpen(true);
  };

  const handleSubmitShow = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const showData = {
      ...formData,
      type: "TV Show",
      rating: parseFloat(formData.rating) || 0,
      actors: formData.actors ? (Array.isArray(formData.actors) ? formData.actors : formData.actors.split(",").map(s => s.trim()).filter(s => s)) : [],
    };

    try {
      if (editingShow) {
        const { error } = await supabase.from("movies").update(showData).eq("id", editingShow.id);
        if (error) throw error;
      } else {
        const { data: show, error } = await supabase.from("movies").insert([showData]).select().single();
        if (error) throw error;

        // Send notification for new TV show
        if (show) {
          await sendMovieNotification({
            title: show.title,
            year: show.year,
            category: show.category,
            typeLabel: "TV Show"
          });
        }
      }
      setIsModalOpen(false);
      fetchShows();
    } catch (err) {
      alert("Error saving TV Show: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleSubmitEpisode = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      ...episodeData,
      tv_show_id: selectedShow.id,
    };

    try {
      if (editingEpisode) {
        const { error } = await supabase.from("tv_episodes").update(data).eq("id", editingEpisode.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tv_episodes").insert([data]);
        if (error) throw error;
      }
      setIsEpisodeModalOpen(false);
      fetchEpisodes(selectedShow.id);
    } catch (err) {
      alert("Error saving Episode: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleDeleteShow = async (id) => {
    if (confirm("Are you sure? This will delete all episodes too.")) {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (!error) fetchShows();
    }
  };

  return (
    <>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              TV Shows <span className="text-primary italic">Management</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">Manage series, seasons, and episodic content.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="cinematic-glow flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Series</span>
          </button>
        </div>

        {/* Search Bar & TMDB Quick Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Search size={14} className="text-primary" />
              Local Series Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search series..." 
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
                  placeholder="Enter TMDB TV title..." 
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
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">TMDB TV Results</h3>
                  <button onClick={() => setTmdbResults([])} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {tmdbResults.map((result) => (
                    <div key={result.id} className="group relative">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/5">
                        <Image 
                          src={result.image_url || "/placeholder-card.jpg"} 
                          alt="" 
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

        {/* Shows Grid */}
        <div className="space-y-4">
          {shows.filter(show => show.title.toLowerCase().includes(searchTerm.toLowerCase())).map((show) => (
            <div key={show.id} className="glass group overflow-hidden rounded-3xl ring-1 ring-white/5 transition-all hover:bg-white/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                  <Image src={show.image_url || "/placeholder-card.jpg"} alt={show.title} fill className="object-cover" sizes="100px" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{show.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-primary"><Star size={12} fill="currentColor" /> {show.rating}</span>
                    <span>{show.year}</span>
                    <span>{show.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { fetchEpisodes(show.id); setSelectedShow(show); }}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                  >
                    <ListOrdered size={14} /> Episodes
                  </button>
                  <button onClick={() => handleOpenModal(show)} className="rounded-xl bg-white/5 p-2.5 text-zinc-400 hover:text-white"><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteShow(show.id)} className="rounded-xl bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><Trash2 size={18} /></button>
                </div>
              </div>

              {selectedShow?.id === show.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-white/5 bg-black/40 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Episodes List</h4>
                    <button 
                      onClick={() => handleOpenEpisodeModal(show)}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-white"
                    >
                      <PlusCircle size={14} /> Add Episode
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {episodes.map((ep) => (
                      <div key={ep.id} className="bg-white/5 rounded-2xl p-4 ring-1 ring-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase mb-1">S{ep.season_number} E{ep.episode_number}</p>
                          <h5 className="text-sm font-bold text-white truncate max-w-[150px]">{ep.title || "Untitled Episode"}</h5>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEpisodeModal(show, ep)} className="p-1.5 text-zinc-500 hover:text-white"><Edit2 size={14} /></button>
                          <button onClick={async () => { if(confirm("Delete episode?")) { await supabase.from("tv_episodes").delete().eq("id", ep.id); fetchEpisodes(show.id); } }} className="p-1.5 text-primary/60 hover:text-primary"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {episodes.length === 0 && <p className="col-span-full text-center text-xs font-bold text-zinc-600 italic py-8">No episodes found for this show.</p>}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-12 shadow-2xl custom-scrollbar">
              <h2 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-4">{editingShow ? "Edit" : "New"} <span className="text-primary italic">Series</span></h2>
              <form onSubmit={handleSubmitShow} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-zinc-500">Title</label>
                   <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10 focus:ring-primary/50" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-zinc-500">Rating</label>
                   <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-zinc-500">Year</label>
                   <input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-zinc-500">Category</label>
                   <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase text-zinc-500">Poster URL</label>
                    <input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase text-zinc-500">Description</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-900 rounded-2xl py-4 px-6 text-white outline-none ring-1 ring-white/10 resize-none" />
                  </div>
                 <button type="submit" className="md:col-span-2 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover transition-colors">{isSubmitting ? "Saving..." : "Save Show"}</button>
              </form>
            </motion.div>
          </div>
        )}

        {isEpisodeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={() => setIsEpisodeModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-2xl rounded-[2.5rem] p-12 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Manage <span className="text-primary italic">Episode</span></h3>
              <form onSubmit={handleSubmitEpisode} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Season No.</label>
                    <input type="number" required value={episodeData.season_number} onChange={e => setEpisodeData({...episodeData, season_number: parseInt(e.target.value)})} className="w-full bg-zinc-900 rounded-xl py-3 px-4 text-white outline-none ring-1 ring-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Episode No.</label>
                    <input type="number" required value={episodeData.episode_number} onChange={e => setEpisodeData({...episodeData, episode_number: parseInt(e.target.value)})} className="w-full bg-zinc-900 rounded-xl py-3 px-4 text-white outline-none ring-1 ring-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Episode Title</label>
                  <input value={episodeData.title} onChange={e => setEpisodeData({...episodeData, title: e.target.value})} className="w-full bg-zinc-900 rounded-xl py-3 px-4 text-white outline-none ring-1 ring-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Upload to Google Drive</label>
                  <GoogleDriveUploader 
                    onFileSelect={(file) => {
                        const baseFolder = selectedShow.year ? `${selectedShow.title} (${selectedShow.year})` : selectedShow.title;
                        const folder = episodeData.title ? `${baseFolder} - ${episodeData.title}` : baseFolder;
                        startUpload(file, folder);
                    }}
                    externalToken={accessToken}
                    onTokenReceived={setAccessToken}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Video URL</label>
                  <input value={episodeData.video_url} onChange={e => setEpisodeData({...episodeData, video_url: e.target.value})} className="w-full bg-zinc-900 rounded-xl py-3 px-4 text-white outline-none ring-1 ring-white/10" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase">{isSubmitting ? "Saving..." : "Save Episode"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
