"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "@/components/MovieCard";
import { Loader2, Heart, Film } from "lucide-react";

export default function MyListPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMyList = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("watchlists")
          .select(`
            movie_id,
            movies (*)
          `)
          .eq("user_id", user.id);
        
        if (!error && data) {
          const filteredMovies = data
            .map(item => item.movies)
            .filter(movie => movie !== null && movie !== undefined);
          setMovies(filteredMovies);
        }
      }
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      await fetchMyList();
    };
    checkAndFetch();
  }, [fetchMyList, supabase]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container-custom py-32">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            My <span className="text-primary italic">List</span>
          </h1>
          <p className="mt-4 font-medium text-zinc-500">Your curated collection of must-watch titles.</p>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
              <Film size={32} />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Your list is empty</h2>
            <p className="mt-4 max-w-sm text-zinc-500 font-medium">Start exploring our collection and heart your favorite movies to build your personal watchlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
