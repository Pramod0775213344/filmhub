import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";
import NativeAd from "@/components/NativeAd";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 600;

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const searchParamsValue = await searchParams; // Await searchParams in Next.js 15+

  const categorySlug = slug;
  // Convert slug back to title case for display/query if needed, 
  // but better to search case-insensitive or store slug. 
  // For now, let's assume we search case-insensitive against the 'category' column using the slug or a formatted version.
  // Actually, slugs usually are "action-adventure". We might need to un-slugify or just use ILIKE.
  // Let's try to unslugify simple ones: "action" -> "Action". 
  const formattedCategory = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


  // Filters from query params
  const year = searchParamsValue?.year;
  const language = searchParamsValue?.language;
  const sort = searchParamsValue?.sort || "latest";

  const supabase = await createClient();

  // Fetch movies matching the category
  // We use ilike for category to match "Action" with "action"
  let query = supabase
    .from("movies")
    .select("id, title, year, category, rating, type, image_url") // Ensure we fetch image_url OR image
    .ilike("category", `%${formattedCategory}%`); // Using ilike for partial/case-insensitive match

  // Filters
  if (year && year !== "All") query = query.eq("year", year);
  if (language && language !== "All") query = query.eq("language", language);

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

  // Get unique filters based on ALL movies (or at least a large subset) to populate the filter dropdowns correctly
  // This is a bit heavy, strictly speaking we should only show filters relevant to this category, 
  // but for simplicity/consistency with other pages, we can fetch unique years/languages from the *result* or global.
  // Let's fetch global filters for Year and Language to allow full exploration.
  const { data: filterData } = await supabase.from("movies").select("year, language").limit(500);

  const uniqueYears = ["All", ...new Set(filterData?.map(m => m.year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueLanguages = ["All", ...new Set(filterData?.map(m => m.language).filter(Boolean))];
  // 'Categories' filter is redundant here since we are ON a category page, so we might hide it or just show "All" as a way to go back?
  // Actually, FilterSection might expect categories. We can pass the current one as selected.

  const enrichedMovies = movies || [];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pb-20">
        <div className="mb-8 flex flex-col justify-end gap-8 md:flex-row md:items-end">
          {/* Header removed for MiniHero */}
          <FilterSection 
            categories={[]} // Hide or empty categories to prevent confusion if component handles it gracefully
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ year, language, sort }}
            hideCategoryFilter={true} // Assuming we might add this prop or it handles empty list
          />
        </div>


        {error ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            Error loading content
          </div>
        ) : movies?.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
            No titles found in {formattedCategory}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 lg:gap-6">
            {enrichedMovies.map((movie) => (
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
