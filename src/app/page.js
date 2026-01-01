import Hero from "@/components/Hero";
import FilmSection from "@/components/FilmSection";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import MovieSkeleton from "@/components/MovieSkeleton";

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
  
  let query = supabase.from("movies").select("*");

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data: movies, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching movies:", error);
    return <div>Error loading movies</div>;
  }

  const featuredMovies = movies.filter(m => m.is_featured);
  const trendingMovies = movies.slice(0, 6);
  const newReleases = movies.slice(0, 8); 
  const actionMovies = movies.filter(m => m.category === "Action" || m.category === "Sci-Fi");

  return (
    <>
      <Hero featuredMovies={featuredMovies} />
      
      <div className="container-custom relative z-10 -mt-20 space-y-20 pb-28 md:-mt-32 md:space-y-32">
        <FilmSection title="Trending Now" movies={trendingMovies} />
        <FilmSection title="New Releases" movies={newReleases} />
        <FilmSection title="Action & Sci-Fi" movies={actionMovies} />
        <FilmSection title="Most Popular" movies={movies} />
      </div>
    </>
  );
}


