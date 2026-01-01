import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";

export default async function MoviesPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  const year = params?.year;
  const language = params?.language;

  const supabase = await createClient();

  // Optimized parallel fetching
  const [moviesResponse, filterResponse] = await Promise.all([
    (() => {
      let query = supabase.from("movies").select("*").eq("type", "Movie");
      if (category && category !== "All") query = query.eq("category", category);
      if (year && year !== "All") query = query.eq("year", year);
      if (language && language !== "All") query = query.eq("language", language);
      return query.order("created_at", { ascending: false });
    })(),
    supabase.from("movies").select("category, year, language").eq("type", "Movie")
  ]);

  const { data: movies, error } = moviesResponse;
  const filterData = filterResponse.data;
  
  const uniqueCategories = ["All", ...new Set(filterData?.map(m => m.category).filter(Boolean))];
  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueLanguages = ["All", ...new Set(filterData?.map(m => m.language).filter(Boolean))];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pt-48 pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              All <span className="text-primary italic">Movies</span>
            </h1>
            <p className="mt-4 font-medium text-zinc-500">Browse our extensive collection of cinematic masterpieces.</p>
          </div>
          
          <FilterSection 
            categories={uniqueCategories} 
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ category, year, language }}
          />
        </div>

        {error ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            Error loading movies
          </div>
        ) : movies?.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No movies found matching these filters
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
