import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";

export default async function SinhalaMoviesPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  const year = params?.year;
  // Language is implicitly Sinhala, but we can filter if needed.
  const sort = params?.sort || "latest"; 
  const search = params?.q;

  const supabase = await createClient();

  // Optimized parallel fetching
  const [moviesResponse, filterResponse] = await Promise.all([
    (() => {
      let query = supabase.from("sinhala_movies").select("*");
      
      // Filters
      if (category && category !== "All") query = query.eq("category", category);
      if (year && year !== "All") query = query.eq("year", year);
      if (search) query = query.ilike("title", `%${search}%`);

      // Sorting
      switch (sort) {
        case "old":
          query = query.order("created_at", { ascending: true });
          break;
        case "rating":
          query = query.order("imdb_rating", { ascending: false });
          break;
        case "year":
          query = query.order("year", { ascending: false });
          break;
        case "latest":
        default:
          query = query.order("created_at", { ascending: false });
      }

      return query.limit(50);
    })(),
    supabase.from("sinhala_movies").select("category, year")
  ]);

  const { data: movies, error } = moviesResponse;
  const filterData = filterResponse.data;
  
  const uniqueCategories = ["All", ...new Set(filterData?.map(m => m.category).filter(Boolean))];
  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);
  // Defaulting languages to Sinhala for filter consistency
  const uniqueLanguages = ["All", "Sinhala"]; 

  // Fix for MovieCard expecting specific props
  const formattedMovies = movies?.map(m => ({
      ...m,
      type: "Sinhala Movie", // explicit type for routing if MovieCard uses it
      // Ensure image paths match what MovieCard expects
      image: m.image_url || m.image,
      backdrop: m.backdrop_url || m.backdrop
  })) || [];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pt-24 pb-20 md:pt-48">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Sinhala <span className="text-primary italic">Movies</span>
            </h1>
            <p className="mt-4 font-medium text-zinc-500">Best of Sri Lankan Cinema.</p>
          </div>
          
          <FilterSection 
            categories={uniqueCategories} 
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ category, year, language: "Sinhala", sort, q: search }}
          />
        </div>

        {error ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            Error loading movies
          </div>
        ) : formattedMovies.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No movies found matching these filters
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
            {formattedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
