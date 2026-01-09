import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 600; 

export default async function MoviesPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  const year = params?.year;
  const language = params?.language;
  const sort = params?.sort || "latest"; // latest, old, rating, year
  const search = params?.q;

  const supabase = await createClient();

  // 1. Initial parallel fetch: Content + Filter Data (User check moved to client for better performance)
  const [moviesResponse, filterResponse] = await Promise.all([
    (() => {
      let query = supabase
        .from("movies")
        .select("id, title, year, category, rating, type, image_url, language")
        .eq("type", "Movie");
      
      if (category && category !== "All") query = query.eq("category", category);
      if (year && year !== "All") query = query.eq("year", year);
      if (language && language !== "All") query = query.eq("language", language);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sort) {
        case "old": query = query.order("created_at", { ascending: true }); break;
        case "rating": query = query.order("rating", { ascending: false }); break;
        case "year": query = query.order("year", { ascending: false }); break;
        case "latest":
        default: query = query.order("created_at", { ascending: false });
      }
      return query.limit(48); // Optimized multiple of grid columns
    })(),
    supabase.from("movies").select("category, year, language").eq("type", "Movie").limit(500)
  ]);

  const { data: movies, error } = moviesResponse;
  const filterData = filterResponse.data;

  const uniqueCategories = ["All", ...new Set(filterData?.map(m => m.category).filter(Boolean))];
  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueLanguages = ["All", ...new Set(filterData?.map(m => m.language).filter(Boolean))];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="hidden">
            {/* Hidden but kept for SEO if needed, or fully removed */}
          </div>
          
          <FilterSection 
            categories={uniqueCategories} 
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ category, year, language, sort, q: search }}
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
            {movies?.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        <div className="mt-12 space-y-8">
           <NativeAd />
           <AdsterraBanner />
        </div>
      </div>
    </main>
  );
}
