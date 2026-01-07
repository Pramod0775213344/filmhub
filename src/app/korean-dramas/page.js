import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 600;

export default async function KoreanDramasPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  const year = params?.year;
  const sort = params?.sort || "latest"; 
  const search = params?.q;

  const supabase = await createClient();

  // 1. Initial parallel fetch: User + Content + Filter Data
  const [userRes, moviesResponse, filterResponse] = await Promise.all([
    supabase.auth.getUser(),
    (() => {
      let query = supabase.from("korean_dramas").select("*");
      if (category && category !== "All") query = query.eq("category", category);
      if (year && year !== "All") query = query.eq("year", year);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sort) {
        case "old": query = query.order("created_at", { ascending: true }); break;
        case "rating": query = query.order("imdb_rating", { ascending: false }); break;
        case "year": query = query.order("year", { ascending: false }); break;
        case "latest":
        default: query = query.order("created_at", { ascending: false });
      }
      return query.limit(48);
    })(),
    supabase.from("korean_dramas").select("category, year").limit(500)
  ]);

  const user = userRes.data?.user;
  const { data: movies, error } = moviesResponse;
  const filterData = filterResponse.data;

  // 2. Secondary fetch: Watchlist
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
  
  const uniqueCategories = ["All", ...new Set(filterData?.map(m => m.category).filter(Boolean))];
  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueLanguages = ["All", "Korean"]; 

  const formattedMovies = movies?.map(m => ({
      ...m,
      type: "Korean Drama", 
      image: m.image_url || m.image,
      backdrop: m.backdrop_url || m.backdrop,
      isInWatchlist: watchlistIds.has(m.id)
  })) || [];


  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="hidden">
            {/* Hidden for SEO */}
          </div>
          
          <FilterSection 
            categories={uniqueCategories} 
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ category, year, language: "Korean", sort, q: search }}
          />
        </div>

        <NativeAd />
        <AdsterraBanner />

        {error ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            Error loading dramas
          </div>
        ) : formattedMovies.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No dramas found matching these filters
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
