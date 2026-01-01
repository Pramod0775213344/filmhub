"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { Loader2, Heart, Film } from "lucide-react";

export default function MyListPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMyList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("my_list")
          .select(`
            movie_id,
            movies (*)
          `)
          .eq("user_id", user.id);
        
        if (!error && data) {
          // Flatten data and filter out missing movies
          const filteredMovies = data
            .map(item => {
              // Supabase might return singular 'movie' or plural 'movies' depending on relationship detection
              const movieData = item.movies || item.movie;
              return Array.isArray(movieData) ? movieData[0] : movieData;
            })
            .filter(movie => movie !== null && movie !== undefined);
          setMovies(filteredMovies);
        }
      }
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyList();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom pt-32 pb-20">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl text-gradient">
            My <span className="text-primary italic">List</span>
          </h1>
          <p className="mt-4 font-medium text-zinc-500">Your curated collection of cinematic masterpieces.</p>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <AnimatePresence>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-[40vh] flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-white/10">
              <Film size={32} className="text-zinc-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Your list is empty</h3>
              <p className="text-zinc-500 max-w-xs">Start adding movies to your list and they&apos;ll appear here.</p>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}
