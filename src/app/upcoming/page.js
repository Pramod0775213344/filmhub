import { getUpcomingMovies } from "@/utils/tmdb";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";

export default async function UpcomingPage({ searchParams }) {
  const params = await searchParams;
  const language = params?.language;
  const category = params?.category;

  const filters = { language, category };
  const upcomingMovies = await getUpcomingMovies(filters);

  const languages = ["English", "Hindi", "Tamil", "Telugu", "Malayalam"];
  const categories = ["Animation"]; // As per specific request

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pb-20">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          
          <FilterSection 
             categories={categories}
             languages={languages}
             years={[]} // Not filtering by year for now as it's restricted to current year
             currentFilters={{ language, category }}
             hideYearFilter={true}
             hideSortFilter={true} // Simplify for now
          />
        </div>

        {upcomingMovies.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No upcoming movies found for these filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {upcomingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


