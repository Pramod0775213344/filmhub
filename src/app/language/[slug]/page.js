import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 600;

export default async function LanguagePage({ params, searchParams }) {
  const { slug } = await params;
  const searchParamsValue = await searchParams;

  const languageSlug = slug;
  // Format slug to likely Database format (Title Case usually)
  const formattedLanguage = languageSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Filters
  const category = searchParamsValue?.category;
  const year = searchParamsValue?.year;
  const sort = searchParamsValue?.sort || "latest";

  const supabase = await createClient();

  // Watchlist check
  const { data: { user } } = await supabase.auth.getUser();
  let watchlistIds = new Set();
  
  if (user) {
    const { data: watchlistData } = await supabase
      .from("watchlists")
      .select("movie_id")
      .eq("user_id", user.id);
    
    if (watchlistData) {
      watchlistIds = new Set(watchlistData.map(item => item.movie_id));
    }
  }

  // Fetch movies matching the language
  let query = supabase
    .from("movies")
    .select("id, title, year, category, rating, type, image_url")
    .ilike("language", `%${formattedLanguage}%`);

  // Filters
  if (category && category !== "All") query = query.eq("category", category);
  if (year && year !== "All") query = query.eq("year", year);

  // Sorting
  switch (sort) {
    case "old":
      query = query.order("created_at", { ascending: true });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "year":
      query = query.order("year", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: movies, error } = await query.limit(100);

  // Fetch unique filters
  const { data: filterData } = await supabase.from("movies").select("year, category").limit(500);

  const uniqueCategories = ["All", ...new Set(filterData?.map(m => m.category).filter(Boolean))];
  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);

  const enrichedMovies = movies?.map(m => ({
    ...m,
    isInWatchlist: watchlistIds.has(m.id)
  })) || [];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom page-pt pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Language</span>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl capitalize">
              {formattedLanguage} <span className="text-zinc-500">Movies</span>
            </h1>
            <p className="mt-4 font-medium text-zinc-500">
              Explore our collection of movies in {formattedLanguage}.
            </p>
          </div>
          
          <FilterSection 
            categories={uniqueCategories}
            years={uniqueYears} 
            languages={[]} // Hide language filter since we are on a language page
            currentFilters={{ category, year, sort }}
            hideLanguageFilter={true}
          />
        </div>

        <NativeAd />
        <AdsterraBanner />

        {error ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            Error loading content
          </div>
        ) : movies?.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No titles found in {formattedLanguage}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
            {enrichedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
