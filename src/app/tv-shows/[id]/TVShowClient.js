"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Play, Star, Calendar, ArrowLeft, Plus, Check, Download, 
  User, Users, ChevronDown, ChevronUp, PlayCircle
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

export default function TVShowClient({ initialShow, initialEpisodes, userId }) {
  const router = useRouter();
  const [show] = useState(initialShow);
  const [episodes] = useState(initialEpisodes);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
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

  useEffect(() => {
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
  }, [show?.id, supabase]);

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
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", show.id);
      if (!error) setIsInList(false);
    } else {
      const { error } = await supabase
        .from("watchlists")
        .insert([{ user_id: userId, movie_id: show.id }]);
      if (!error) setIsInList(true);
    }
    setListLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white">
      <div className="container-custom py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="group mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        {/* Top Section: Poster + Show Details */}
        <div className="flex flex-col gap-10 md:flex-row">
          {/* Left: Poster */}
          <div className="relative w-full shrink-0 overflow-hidden rounded-lg shadow-2xl md:w-[300px]">
            <Image
              src={show.image_url || show.image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"}
              alt={show.title}
              width={300}
              height={450}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {show.title} ({show.year})
            </h1>

            {/* Rating & Votes */}
            <div className="flex items-center gap-4">
              <div className="flex rounded bg-zinc-800/50 px-2 py-1 text-sm font-bold">{show.rating}</div>
              <div className="flex text-yellow-500">
                {[...Array(Math.min(5, Math.ceil(parseFloat(show.rating || 0) / 2)))].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
            </div>

            {/* Action Buttons & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={toggleList}
                className="flex items-center gap-2 rounded bg-white px-4 py-1.5 text-sm font-black text-black transition-colors hover:bg-zinc-200"
              >
                {listLoading ? <span className="animate-spin">...</span> : isInList ? <Check size={16} /> : <Plus size={16} />}
                <span>{isInList ? "My List" : "Add to List"}</span>
              </button>
              <div className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white">TV SERIES</div>
              <div className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-xs font-black text-black">
                IMDb: {show.imdb_rating || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                 <span>{show.country}</span>
              </div>
            </div>

            {/* Category List */}
            <div className="flex flex-wrap gap-2 text-sm font-bold text-zinc-300">
              {show.category?.split(',').map((cat, i) => (
                <span key={i}>{cat.trim()}{i < show.category.split(',').length - 1 ? ',' : ''} </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-lg font-medium leading-relaxed text-[#00E5FF]">
              {show.description}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 gap-x-12 gap-y-4 pt-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Language:</span>
                  <span className="font-medium text-white">{show.language || "English"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Seasons:</span>
                  <span className="font-medium text-white">{seasonNumbers.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 text-sm">
                   <span className="font-bold text-zinc-500">Director:</span>
                   <span className="font-medium text-white">{show.director || "Unknown"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-zinc-500">Cast:</span>
                  <span className="font-medium text-white line-clamp-1">{show.cast_details?.map(a => a.name).join(", ") || show.actors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes Section */}
        <div className="mt-16 space-y-10">
           {/* Season Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-3">
                 <Calendar className="text-primary" /> Seasons
              </h2>
              <div className="flex flex-wrap gap-3">
                {seasonNumbers.length > 0 ? seasonNumbers.map((season) => (
                  <button
                    key={season}
                    onClick={() => setActiveSeason(season)}
                    className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                      activeSeason === season 
                        ? "bg-primary text-white shadow-lg scale-105" 
                        : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    Season {season}
                  </button>
                )) : (
                  <p className="text-zinc-500 italic">No seasons available.</p>
                )}
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-3">
                 <PlayCircle className="text-primary" /> Episodes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentEpisodes.map((ep) => (
                  <motion.div
                    key={ep.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                       setActiveEpisode(ep);
                       // Scroll to player
                       document.getElementById("video-player-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group cursor-pointer relative overflow-hidden rounded-2xl p-4 transition-all ${
                       activeEpisode?.id === ep.id 
                        ? "bg-primary/20 ring-2 ring-primary" 
                        : "bg-zinc-900 ring-1 ring-white/5 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                       <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-black">
                          {ep.episode_number}
                       </div>
                       <div className="flex-grow min-w-0 space-y-1">
                          <h3 className={`font-bold truncate ${activeEpisode?.id === ep.id ? "text-primary" : "text-white group-hover:text-primary transition-colors"}`}>
                            {ep.title || `Episode ${ep.episode_number}`}
                          </h3>
                          <p className="text-xs text-zinc-500 line-clamp-2">{ep.description || "No description available."}</p>
                       </div>
                       <div className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${activeEpisode?.id === ep.id ? "opacity-100" : ""}`}>
                          <PlayCircle size={20} className="text-primary" />
                       </div>
                    </div>
                  </motion.div>
                ))}
                {currentEpisodes.length === 0 && (
                   <p className="col-span-full text-zinc-500 italic">No episodes found for this season.</p>
                )}
              </div>
            </div>
        </div>

        {/* Video Player Section */}
        {activeEpisode && (
          <div id="video-player-section" className="mt-16 space-y-8 scroll-mt-32">
            <div className="flex items-center gap-4">
              <Play size={24} className="text-primary" fill="currentColor" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">Watch Now</h2>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="h-8 w-1 rounded-full bg-primary" />
                  <h3 className="text-xl font-bold text-white">S{activeEpisode.season_number} E{activeEpisode.episode_number}: {activeEpisode.title}</h3>
               </div>
               <VideoPlayer url={activeEpisode.video_url} title={activeEpisode.title} />
            </div>
          </div>
        )}

        {/* Cast Section */}
        <div className="mt-20 space-y-10">
          <div className="flex items-center gap-4 text-primary">
            <Users size={24} />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Top Cast</h2>
          </div>
          
          <div className="flex flex-wrap gap-8">
            {show.cast_details && show.cast_details.length > 0 ? (
              show.cast_details.map((actor, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-center w-[120px]">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-zinc-800 transition-transform hover:scale-105 hover:ring-primary">
                    <Image 
                      src={actor.image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200"} 
                      alt={actor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-300 transition-colors hover:text-white line-clamp-1">{actor.name}</span>
                    <span className="text-[10px] font-medium text-zinc-500 line-clamp-1">{actor.character}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-zinc-500 italic">No cast information available</span>
            )}
          </div>
        </div>



      </div>
    </main>
  );
}
