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

  // Get current user for watchlist
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

  // Helper to enrich with watchlist
  let episodeMap = {};
  // Helper to enrich with watchlist and episode info
  const enrich = (list, type) => list?.map(m => ({ 
    ...m, 
    isInWatchlist: watchlistIds.has(m.id), 
    type: type || m.type || "Movie",
    latest_episode: episodeMap[m.id]
  })) || [];

  // if search or category is present, fall back to a single list view (implied by previous code logic, though not fully shown here)
  // But strictly for the "Sections", we want specific queries.

  // 1. Featured (Latest Uploads)
  const featuredQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, imdb_rating, image_url, backdrop_url, description")
    .order("created_at", { ascending: false })
    .limit(5);

  // 2. Recently Added (New Request - Top 8 Latest)
  const recentsQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url")
    .order("created_at", { ascending: false })
    .limit(8);

  // 3. Trending Now (High Rated from TMDB)
  const trendingQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url")
    .order("rating", { ascending: false }) // Using TMDB rating
    .limit(16);

  // 4. Korean Dramas (Latest)
  const kdramaQuery = supabase.from("korean_dramas")
    .select("id, title, year, category, rating, image_url, backdrop_url")
    .order("created_at", { ascending: false })
    .limit(18);

  // 5. New Releases (By Year)
  const newReleasesQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url")
    .order("year", { ascending: false }) // Actual release year
    .limit(16);

  // 6. TV Shows
  const tvShowsQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url")
    .eq("type", "TV Show")
    .order("created_at", { ascending: false })
    .limit(16);
    
  // 7. Action Movies
  const actionQuery = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url")
    .ilike("category", "%Action%")
    .limit(16);

  // Execute in parallel
  const [featuredRes, recentsRes, trendingRes, kdramaRes, newReleaseRes, tvRes, actionRes] = await Promise.all([
    featuredQuery,
    recentsQuery,
    trendingQuery,
    kdramaQuery,
    newReleasesQuery,
    tvShowsQuery,
    actionQuery
  ]);

  // Fetch Latest Episodes for all displayed TV Shows
  const allMovies = [
    ...(featuredRes.data || []),
    ...(recentsRes.data || []),
    ...(trendingRes.data || []),
    ...(newReleaseRes.data || []),
    ...(tvRes.data || []),
    ...(actionRes.data || [])
  ];

  // Identify TV Show IDs
  const tvShowIds = [...new Set(allMovies.filter(m => m.type === "TV Show").map(m => m.id))];
  
  // Populate episodeMap
  if (tvShowIds.length > 0) {
     const { data: allEpisodes } = await supabase
       .from("tv_episodes")
       .select("tv_show_id, season_number, episode_number")
       .in("tv_show_id", tvShowIds);
       
     if (allEpisodes) {
       allEpisodes.forEach(ep => {
         const current = episodeMap[ep.tv_show_id];
         // Logic to find absolute latest episode
         if (!current || 
            (ep.season_number > current.season) || 
            (ep.season_number === current.season && ep.episode_number > current.episode)) {
           episodeMap[ep.tv_show_id] = { season: ep.season_number, episode: ep.episode_number };
         }
       });
     }
  }

  // Handle Search/Category (Override sections if search is active)
  if (search || (category && category !== "All")) {
    let query = supabase.from("movies").select("id, title, year, category, type, rating, image_url, backdrop_url, description");
    let kQuery = supabase.from("korean_dramas").select("id, title, year, category, rating, image_url, backdrop_url, description");

    if (search) {
      query = query.ilike("title", `%${search}%`);
      kQuery = kQuery.ilike("title", `%${search}%`);
    }
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    
    const [mRes, kRes] = await Promise.all([query.limit(50), kQuery.limit(50)]);
    const results = [...(mRes.data || []), ...(kRes.data || [])];

    if (results.length === 0) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 pt-20">
          <div className="rounded-full bg-zinc-900 p-6 ring-1 ring-white/10">
            <Play size={40} className="text-zinc-700" />
          </div>
          <h2 className="text-xl font-bold text-white">No content found</h2>
          <p className="text-zinc-500">Try adjusting your search or filters</p>
        </div>
      );
    }
    
    // Simple grid for search results
    return (
      <div className="container-custom py-32">
        <h2 className="text-2xl font-bold text-white mb-8">Search Results</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {enrich(results).map((movie) => (
             <FilmSection key={movie.id} title="" movies={[movie]} /> 
          ))} 
        </div>
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 -mt-8">
             <FilmSection title="" movies={enrich(results)} />
         </div>
      </div>
    );
  }



  // Normal View with Sections
  return (
    <>
      <Hero featuredMovies={enrich(featuredRes.data)} />

      <div className="container-custom relative z-10 -mt-20 space-y-20 pb-28 md:-mt-10 md:space-y-32">
        <FilmSection title="Recently Added" movies={enrich(recentsRes.data)} href="/movies?sort=latest" />
        <FilmSection title="Trending Now" movies={enrich(trendingRes.data)} href="/movies?sort=rating" />
        <FilmSection title="Korean Dramas" movies={enrich(kdramaRes.data, "Korean Drama")} href="/korean-dramas" />
        <FilmSection title="New Releases" movies={enrich(newReleaseRes.data)} href="/movies?sort=year" />
        <FilmSection title="TV Shows" movies={enrich(tvRes.data)} href="/tv-shows" />
        <FilmSection title="Action & Sci-Fi" movies={enrich(actionRes.data)} href="/movies?category=Action" />
      </div>
    </>
  );
}
