"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, Star, Calendar, Tag, Loader2, ArrowLeft, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MovieClient({ initialMovie, userId }) {
  const router = useRouter();
  const [movie] = useState(initialMovie);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
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
    checkStatus();
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
    <main className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="relative h-[70vh] w-full overflow-hidden md:h-[85vh]">
        <Image
          src={movie.backdrop_url || movie.image_url || movie.image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />

        <div className="container-custom absolute bottom-12 left-0 right-0 md:bottom-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            <button 
              onClick={() => router.back()}
              className="group mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>

            <h1 className="font-display text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl">
              {movie.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-primary italic" : ""}>{word} </span>
              ))}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-zinc-300">
              <div className="flex items-center gap-1.5 text-primary">
                <Star size={16} fill="currentColor" />
                <span>{movie.rating} Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center gap-1.5 uppercase tracking-widest">
                <Tag size={16} />
                <span>{movie.category}</span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-zinc-400 md:text-xl md:leading-loose">
              {movie.description}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <button className="cinematic-glow flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95">
                <Play size={20} fill="currentColor" />
                <span>Watch Now</span>
              </button>
              <button 
                onClick={toggleList}
                disabled={listLoading}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-5 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
              >
                {listLoading ? <Loader2 className="animate-spin" size={20} /> : isInList ? <Check size={20} /> : <Plus size={20} />}
                <span>{isInList ? "In My List" : "Add to List"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="container-custom py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="font-display text-3xl font-black text-white mb-6 uppercase tracking-tight">
                Cast <span className="text-primary italic">& Crew</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {movie.actors && movie.actors.length > 0 ? movie.actors.map((actor, i) => (
                  <div key={i} className="rounded-xl bg-zinc-900 px-6 py-4 ring-1 ring-white/10 transition-colors hover:bg-zinc-800">
                    <span className="text-sm font-bold text-white">{actor}</span>
                  </div>
                )) : (
                  <span className="text-zinc-500 italic">No cast information available</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="rounded-3xl bg-zinc-900/50 p-8 ring-1 ring-white/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 font-display">Production Info</h3>
              <div className="space-y-6">
                 <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600">Category</span>
                    <span className="text-white font-bold">{movie.category}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600">Release Year</span>
                    <span className="text-white font-bold">{movie.year}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600">Rating</span>
                    <span className="text-primary font-black">{movie.rating} / 10</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
