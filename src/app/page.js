import Hero from "@/components/Hero";
import FilmSection from "@/components/FilmSection";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import MovieSkeleton from "@/components/MovieSkeleton";
import { Play } from "lucide-react";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<HomeLoading />}>
        <HomeContent search={params?.s} category={params?.c} />
      </Suspense>
    </main>
  );
}

function HomeLoading() {
  return (
    <div className="container-custom space-y-20 pt-32 pb-28 md:space-y-32">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-8">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-900" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <MovieSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

async function HomeContent({ search, category }) {
  const supabase = await createClient();

  // Get current user to fetch their watchlist once
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

  // Optimize: Select only necessary fields for the homepage to reduce payload size
  let query = supabase.from("movies").select("id, title, year, category, type, rating, image_url, backdrop_url, description");

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data: movies, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching movies:", error);
    return <div className="py-20 text-center text-zinc-500">Error loading movies. Please try again later.</div>;
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 pt-20">
        <div className="rounded-full bg-zinc-900 p-6 ring-1 ring-white/10">
          <Play size={40} className="text-zinc-700" />
        </div>
        <h2 className="text-xl font-bold text-white">No movies found</h2>
        <p className="text-zinc-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  const featuredMovies = movies.slice(0, 5);
  const trendingMovies = movies.slice(0, 16);
  const newReleases = movies.slice(0, 16);
  const actionMovies = movies.filter(
    (m) => m.category === "Action" || m.category === "Sci-Fi"
  ).slice(0, 16);
  const tvShows = movies.filter((m) => m.type === "TV Show").slice(0, 16);

  // Helper to inject watchlist status
  const enrichWithWatchlist = (movieList) => 
    movieList.map(m => ({ ...m, isInWatchlist: watchlistIds.has(m.id) }));

  return (
    <>
      <Hero featuredMovies={enrichWithWatchlist(featuredMovies)} />

      <div className="container-custom relative z-10 -mt-20 space-y-20 pb-28 md:-mt-10 md:space-y-32">
        <FilmSection title="Trending Now" movies={enrichWithWatchlist(trendingMovies)} href="/movies?sort=latest" />
        <FilmSection title="New Releases" movies={enrichWithWatchlist(newReleases)} href="/movies?sort=year" />
        <FilmSection title="TV Shows" movies={enrichWithWatchlist(tvShows)} href="/tv-shows" />
        <FilmSection title="Action & Sci-Fi" movies={enrichWithWatchlist(actionMovies)} href="/movies?category=Action" />
        <FilmSection title="Most Popular" movies={enrichWithWatchlist(movies.slice(0, 16))} href="/movies?sort=rating" />
      </div>
    </>
  );
}
