"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import { Play, Star, Calendar, Tag, Loader2, ArrowLeft, Plus, Check, X, Download, User, Users, Globe, Eye, Clock, Video, ChevronRight, ChevronLeft, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function MovieClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [links, setLinks] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
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
    const fetchAdditionalData = async () => {
      if (movie && supabase) {
        // Fetch download links
        const { data: linksData } = await supabase
          .from("movie_links")
          .select("*")
          .eq("movie_id", movie.id);
        
        if (linksData && linksData.length > 0) {
          setLinks(linksData);
          setActiveProvider(linksData[0].provider);
        } else if (movie.download_url) {
          // Fallback to legacy link
          const fallbackLink = {
            provider: "Direct",
            quality: "HD",
            size: "Unknown",
            url: movie.download_url
          };
          setLinks([fallbackLink]);
          setActiveProvider("Direct");
        }

        // Fetch related movies (same category, excluding current)
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
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movie.id);
      if (!error) setIsInList(false);
    } else {
      const { error } = await supabase
        .from("watchlists")
        .insert([{ user_id: userId, movie_id: movie.id }]);
      if (!error) setIsInList(true);
    }
    setListLoading(false);
  };

  if (!movie) return null;

  return (
    <main className="min-h-screen bg-[#000000] text-white">

      <div className="container-custom py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="group mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to movies</span>
        </button>

        {/* Top Section: Poster + Movie Details */}
        <div className="flex flex-col gap-10 md:flex-row">
          {/* Left: Poster */}
          <div className="relative w-full shrink-0 overflow-hidden rounded-lg shadow-2xl md:w-[300px]">
            <Image
              src={movie.image_url || movie.image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"}
              alt={movie.title}
              width={300}
              height={450}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {movie.title} ({movie.year}) {movie.language} Subtitles <span className="text-zinc-400"></span>
            </h1>

            {/* Rating & Votes */}
            <div className="flex items-center gap-4">
              <div className="flex rounded bg-zinc-800/50 px-2 py-1 text-sm font-bold">5</div>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <div className="text-sm font-medium text-zinc-500">1 vote</div>
            </div>

            {/* Action Buttons & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => movie.video_url ? setIsPlaying(true) : alert("Trailer coming soon!")}
                className="flex items-center gap-2 rounded bg-white px-4 py-1.5 text-sm font-black text-black transition-colors hover:bg-zinc-200"
              >
                <Video size={16} fill="black" />
                Trailer
              </button>
              <div className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white">WEB-DL</div>
              <div className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-xs font-black text-black">
                IMDb: {movie.imdb_rating || "6.3"}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <span>{movie.duration || "111 min"}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="flex items-center gap-1">
                  {movie.views || 329} views
                </span>
              </div>
            </div>

            {/* Category List */}
            <div className="flex flex-wrap gap-2 text-sm font-bold text-zinc-300">
              {movie.category?.split(',').map((cat, i) => (
                <span key={i}>{cat.trim()}{i < movie.category.split(',').length - 1 ? ',' : ''} </span>
              ))}
            </div>

            {/* Subtitle Banner */}
            <div className="w-full rounded bg-blue-900/40 py-3 text-center ring-1 ring-blue-500/30">
              <span className="text-sm font-bold text-blue-100">&quot;සිංහල උපසිරැසි සමඟ&quot;</span>
            </div>

            {/* Synopsis */}
            <p className="text-lg font-medium leading-relaxed text-[#00E5FF]">
              {movie.description}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 gap-x-12 gap-y-4 pt-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Language:</span>
                  <span className="font-medium text-white">{movie.language || "English"}</span>
                </div>
                {movie.subtitle_author && (
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-zinc-500">Subtitle Author:</span>
                    <span className="font-medium text-white">{movie.subtitle_author}</span>
                  </div>
                )}
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Subtitle Site:</span>
                  <span className="font-medium text-white">{movie.subtitle_site || "Cineru.LK"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Country:</span>
                  <span className="font-medium text-white">{movie.country || "Belgium, France"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Director:</span>
                  <span className="font-medium text-white">{movie.director || "Unknown"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Stars:</span>
                  <span className="font-medium text-white">{movie.actors?.join(", ")}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Year:</span>
                  <span className="font-medium text-white">{movie.year}</span>
                </div>
              </div>
            </div>

            {/* My List & Download Controls */}
            <div className="flex items-center gap-4 pt-6">
              <button 
                onClick={toggleList}
                className="flex items-center gap-3 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 ring-1 ring-white/10"
              >
                {listLoading ? <Loader2 className="animate-spin" size={18} /> : isInList ? <Check size={18} className="text-primary" /> : <Plus size={18} />}
                <span>{isInList ? "My List" : "Add to List"}</span>
              </button>
              {movie.download_url && (
                <a 
                  href={movie.download_url} 
                  target="_blank" 
                  className="cinematic-glow flex items-center gap-3 rounded-lg bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
                >
                  <Download size={18} />
                  <span>Download now</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Video Player Modal/Overlay */}
        <AnimatePresence>
          {isPlaying && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsPlaying(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl bg-black shadow-2xl"
              >
                <button 
                  onClick={() => setIsPlaying(false)}
                  className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <X size={20} />
                </button>
                <iframe
                  src={movie.video_url?.includes("youtube.com/watch") 
                    ? movie.video_url.replace("watch?v=", "embed/") + "?autoplay=1"
                    : movie.video_url}
                  className="h-full w-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Video Player Section */}
        {movie.video_url && (
          <div className="mt-16 space-y-8">
            <div className="flex items-center gap-4">
              <Play size={24} className="text-primary" fill="currentColor" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">Watch Now</h2>
            </div>
            <VideoPlayer url={movie.video_url} title={movie.title} />
          </div>
        )}

        {/* Cast Section */}
        <div className="mt-20 space-y-10">
          <div className="flex items-center gap-4 text-primary">
            <Users size={24} />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Top Cast</h2>
          </div>
          
          <div className="flex flex-wrap gap-8">
            {movie.actors && movie.actors.length > 0 ? movie.actors.map((actor, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center w-[120px]">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-zinc-800 transition-transform hover:scale-105 hover:ring-primary">
                   <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-700">
                      <User size={48} />
                   </div>
                </div>
                <span className="text-xs font-bold text-zinc-300 transition-colors hover:text-white">{actor}</span>
              </div>
            )) : (
              <span className="text-zinc-500 italic">No cast information available</span>
            )}
          </div>
        </div>

        {/* Links Section */}
        {links.length > 0 && (
          <div className="mt-20 space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">Download Links</h2>
            
            {/* Provider Tabs */}
            <div className="flex flex-wrap gap-2">
              {[...new Set(links.map(l => l.provider))].map((provider, i) => (
                <button
                  key={i}
                  onClick={() => setActiveProvider(provider)}
                  className={`rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    activeProvider === provider ? "bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]" : "bg-zinc-900 text-zinc-500 hover:text-white"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>

            {/* Links Table */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/5 bg-[#0a0a0a]">
              <table className="w-full text-left">
                <thead className="border-b border-white/5 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Options</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Quality</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Size</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {links.filter(l => l.provider === activeProvider).map((link, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 p-1 text-zinc-500 group-hover:bg-primary group-hover:text-white">
                              <Download size={10} />
                           </div>
                           <span className="text-sm font-bold text-zinc-300 group-hover:text-primary transition-colors">{link.provider}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded bg-zinc-900 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {link.quality}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-medium text-zinc-500">{link.size || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <a 
                          href={link.url}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary group-hover:ring-1 group-hover:ring-primary/50"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {relatedMovies.length > 0 && (
          <div className="mt-20 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">You May Also Like</h2>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 transition-colors hover:bg-primary hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 transition-colors hover:bg-primary hover:text-white">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 h-[auto]">
              {relatedMovies.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => router.push(`/movies/${m.id}`)}
                  className="group cursor-pointer space-y-3"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/10 transition-all group-hover:ring-primary group-hover:-translate-y-2">
                    <Image
                      src={m.image_url || m.image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"}
                      alt={m.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-black text-primary backdrop-blur-md">
                      <Star size={10} fill="currentColor" />
                      {m.rating}
                    </div>
                  </div>
                  <div className="space-y-1 px-1">
                    <h3 className="line-clamp-1 text-sm font-black text-white group-hover:text-primary transition-colors">{m.title}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{m.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-20 space-y-10 border-t border-white/5 pt-20">
          <div className="flex items-center gap-4">
            <MessageSquare size={24} className="text-primary" />
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">Comments</h2>
          </div>
          
          <div className="rounded-3xl bg-zinc-900/30 p-12 text-center ring-1 ring-white/5 backdrop-blur-sm">
            <p className="text-sm font-medium text-zinc-400">
              You must be <span className="font-bold text-primary cursor-pointer hover:underline" onClick={() => router.push('/login')}>logged in</span> to post a comment.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
