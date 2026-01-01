"use client";

import { useState, useEffect } from "react";
import { Play, Plus, Check, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function MovieCard({ movie }) {
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", user.id)
          .eq("movie_id", movie.id)
          .single();
        
        if (data) setIsInList(true);
      }
    };
    checkStatus();
  }, [movie.id, supabase]);

  const toggleList = async (e) => {
    e.stopPropagation();
    if (!user) return router.push("/login");

    setLoading(true);
    if (isInList) {
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movie.id);
      if (!error) setIsInList(false);
    } else {
      const { error } = await supabase
        .from("watchlists")
        .insert([{ user_id: user.id, movie_id: movie.id }]);
      if (!error) setIsInList(true);
    }
    setLoading(false);
  };

  return (
    <Link href={`/movies/${movie.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="group relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-900 shadow-2xl"
      >
      {/* Movie Image */}
      <Image
        src={movie.image_url || movie.image}
        alt={movie.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
      />

      {/* Gradient Overlay */}
      <div className="movie-card-gradient absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Badges */}
      <div className="absolute left-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
        <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white shadow-lg">
          Top 10
        </span>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white backdrop-blur-md border border-white/10">
          4K
        </span>
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-6">
        <h3 className="font-display text-lg font-black leading-tight text-white mb-2 line-clamp-2">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
          <div className="flex items-center gap-1.5 text-primary">
            <Star size={12} fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>{movie.year}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 scale-90 origin-left">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-95 shadow-xl">
            <Play size={20} fill="currentColor" />
          </button>
          <button 
            onClick={toggleList}
            disabled={loading}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 ${
              isInList ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isInList ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

