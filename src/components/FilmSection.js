"use client";

import MovieCard from "./MovieCard";
import { ChevronRight } from "lucide-react";

export default function FilmSection({ title, movies }) {
  return (
    <section className="mt-20">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl lg:text-4xl">
            {title}
          </h2>
          <button className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-primary">
            <span>Explore All</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 transition-colors group-hover:bg-primary group-hover:text-white">
              <ChevronRight size={16} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}

