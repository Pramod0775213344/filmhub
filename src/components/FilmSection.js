

import MovieCard from "./MovieCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FilmSection({ title, movies, href, isGrid = false }) {
  const containerClasses = isGrid 
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
    : "flex gap-4 overflow-x-auto pb-5 pt-2 px-1 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:gap-4 md:overflow-visible md:pb-0 md:px-0 snap-x snap-mandatory no-scrollbar";

  return (
    <section className="mt-12 md:mt-20">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl lg:text-4xl">
            {title}
          </h2>
          {href && (
            <Link 
              href={href}
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 transition-all hover:text-primary"
            >
              <span>Explore All</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 transition-colors group-hover:bg-primary group-hover:text-white">
                <ChevronRight size={16} />
              </div>
            </Link>
          )}
        </div>

        <div className={containerClasses}>
          {movies.map((movie) => (
            <div key={movie.id} className={isGrid ? "" : "min-w-[150px] sm:min-w-[180px] md:min-w-0 snap-start"}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

