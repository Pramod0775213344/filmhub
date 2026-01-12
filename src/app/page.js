import Hero from "@/components/Hero";
import FilmSection from "@/components/FilmSection";
import { createClient } from "@/utils/supabase/server";
import { Suspense, cache } from "react";
import MovieSkeleton from "@/components/MovieSkeleton";
import { Play } from "lucide-react";
import AdsterraBanner from "@/components/AdsterraBanner";
import { getUpcomingMovies } from "@/utils/tmdb";

export const revalidate = 600;

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const search = params?.s;
  const category = params?.c;

  if (search || (category && category !== "All")) {
    return (
      <main className="min-h-screen bg-background">
        <Suspense fallback={<HomeLoading sectionCount={1} />}>
          <SearchResults search={search} category={category} />
        </Suspense>
      </main>
    );
  }

  // Start fetching critical data in parallel
  const heroDataPromise = HeroSection();
  const recentDataPromise = RecentSection();

  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Section (Priority) */}
      <Suspense fallback={<HeroSkeleton />}>
        {heroDataPromise}
      </Suspense>

      <div className="container-custom relative z-10 space-y-8 pb-28 md:space-y-20 pt-8 md:pt-12">
        {/* 2. Content Sections (Streamed) */}
        <Suspense fallback={<SectionSkeleton title="Recently Added" />}>
          {recentDataPromise}
        </Suspense>
        
        <AdsterraBanner />

        <Suspense fallback={<SectionSkeleton title="Trending Now" />}>
          <TrendingSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton title="Coming Soon" />}>
           <UpcomingSection />
        </Suspense>
        
        <AdsterraBanner />
        
        <Suspense fallback={<SectionSkeleton title="Korean Dramas" />}>
          <KDramaSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton title="New Releases" />}>
          <NewReleasesSection />
        </Suspense>
        
        <AdsterraBanner />
        
        <Suspense fallback={<SectionSkeleton title="TV Shows" />}>
          <TVShowsSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton title="Action & Sci-Fi" />}>
          <ActionSection />
        </Suspense>
      </div>
    </main>
  );
}

// --- Helper Components for Streaming ---

const getMovies = cache(async (options = {}) => {
  const supabase = await createClient();
  let query = supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url, description, language, actors");
  
  if (options.type) query = query.eq("type", options.type);
  if (options.orderBy) query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  if (options.limit) query = query.limit(options.limit);
  
  const { data } = await query;
  return data || [];
});

const getAuthAndWatchlist = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let watchlistIds = new Set();
  
  if (user) {
    const { data } = await supabase.from("watchlists").select("movie_id").eq("user_id", user.id);
    if (data) watchlistIds = new Set(data.map(item => item.movie_id));
  }
  return { user, watchlistIds, supabase };
});

function enrich(list, episodeMap = {}, type = null) {
  return list?.map(m => ({ 
    ...m, 
    type: type || m.type || "Movie",
    latest_episode: episodeMap[m.id]
  })) || [];
}

async function HeroSection() {
  const data = await getMovies({ limit: 5, orderBy: "created_at" });
  return <Hero featuredMovies={data} />;
}

async function RecentSection() {
  const data = await getMovies({ limit: 8, orderBy: "created_at" });
  return <FilmSection title="Recently Added" movies={enrich(data)} href="/movies?sort=latest" isPriority={true} />;
}

async function TrendingSection() {
  const data = await getMovies({ limit: 8, orderBy: "rating" });
  return <FilmSection title="Trending Now" movies={enrich(data)} href="/movies?sort=rating" isPriority={true} />;
}

async function UpcomingSection() {
  const movies = await getUpcomingMovies();

  // Limit to 8 items for the section
  const displayedMovies = movies.slice(0, 8);

  return <FilmSection title="Coming Soon" movies={enrich(displayedMovies)} href="/upcoming" />;
}


async function KDramaSection() {
  const supabase = await createClient();
  const { data } = await supabase.from("korean_dramas")
    .select("id, title, year, category, rating, image_url, backdrop_url, language")
    .order("created_at", { ascending: false })
    .limit(8);

  return <FilmSection title="Korean Dramas" movies={enrich(data, {}, "Korean Drama")} href="/korean-dramas" />;
}

async function NewReleasesSection() {
  const supabase = await createClient();
  const { data } = await supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url, language")
    .order("year", { ascending: false })
    .limit(8);

  return <FilmSection title="New Releases" movies={enrich(data)} href="/movies?sort=year" />;
}

async function TVShowsSection() {
  const supabase = await createClient();
  const { data: shows } = await supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url, language")
    .eq("type", "TV Show")
    .order("created_at", { ascending: false })
    .limit(8);
    
  // Fetch episodes for these shows (using a single batch query)
  const showIds = shows?.map(m => m.id) || [];
  const episodeMap = {};
  if (showIds.length > 0) {
    const { data: eps } = await supabase.from("tv_episodes").select("tv_show_id, season_number, episode_number").in("tv_show_id", showIds);
    eps?.forEach(ep => {
      const current = episodeMap[ep.tv_show_id];
      if (!current || (ep.season_number > current.season) || (ep.season_number === current.season && ep.episode_number > current.episode)) {
        episodeMap[ep.tv_show_id] = { season: ep.season_number, episode: ep.episode_number };
      }
    });
  }

  return <FilmSection title="TV Shows" movies={enrich(shows, episodeMap)} href="/tv-shows" />;
}

async function ActionSection() {
  const supabase = await createClient();
  const { data } = await supabase.from("movies")
    .select("id, title, year, category, type, rating, image_url, backdrop_url, language")
    .ilike("category", "%Action%")
    .limit(8);

  return <FilmSection title="Action & Sci-Fi" movies={enrich(data)} href="/movies?category=Action" />;
}

async function SearchResults({ search, category }) {
  const supabase = await createClient();
  let query = supabase.from("movies").select("id, title, year, category, type, rating, image_url, backdrop_url, description, language");
  let kQuery = supabase.from("korean_dramas").select("id, title, year, category, rating, image_url, backdrop_url, description, language");

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 pt-40 px-4">
        <div className="rounded-full bg-zinc-900 p-6 ring-1 ring-white/10">
          <Play size={40} className="text-zinc-700" />
        </div>
        <h2 className="text-xl font-bold text-white">No content found</h2>
        <p className="text-zinc-500">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  return (
    <div className="container-custom pb-20 pt-32">
       <FilmSection title={search ? `Results for "${search}"` : "Filtered Movies"} movies={enrich(results)} isGrid={true} />
    </div>
  );
}

// --- Skeleton Placeholders (Optimized for CLS) ---

function HeroSkeleton() {
  return (
    <div className="h-[90dvh] lg:h-[100dvh] w-full bg-[#020202] relative">
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse" />
    </div>
  );
}

function SectionSkeleton({ title }) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800/40" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-800/40" />
      </div>
      {/* Precision Skeleton Grid to match FilmSection perfectly */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-4 -mx-4 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:gap-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 no-scrollbar">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
          <div key={j} className="min-w-[150px] sm:min-w-[180px] md:min-w-0">
            <div className="space-y-3">
              <div className="aspect-[2/3] w-full rounded-xl bg-zinc-800/40 animate-pulse" />
              <div className="mt-3 px-1 space-y-1 min-h-[44px]">
                <div className="h-4 w-3/4 bg-zinc-800/40 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-800/40 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeLoading({ sectionCount = 3 }) {
  return (
    <div className="container-custom space-y-20 pb-28 md:space-y-32">
      {Array.from({ length: sectionCount }).map((_, i) => (
        <SectionSkeleton key={i} />
      ))}
    </div>
  );
}


