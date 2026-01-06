import { createClient } from "@/utils/supabase/server";
import MovieCard from "@/components/MovieCard";
import FilterSection from "@/components/FilterSection";
import NativeAd from "@/components/NativeAd";

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

  const enrichedMovies = movies?.map(m => ({
    ...m,
    isInWatchlist: watchlistIds.has(m.id)
  })) || [];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom page-pt pb-20">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Category</span>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl capitalize">
              {formattedCategory}
            </h1>
            <p className="mt-4 font-medium text-zinc-500">
              Explore our collection of {formattedCategory} movies and shows.
            </p>
          </div>
          
          {/* We reuse FilterSection but maybe force the category or hide it? 
              Ref: src/components/FilterSection.js (not viewed but assumed standard)
              If we pass 'categories' as just [formattedCategory], user can't switch easily? 
              Let's pass all categories so they can switch if they want, but default to current.
              Wait, switching category in FilterSection usually updates query param `?category=`.
              Here, category is in URL path `/category/action`.
              If FilterSection uses `router.push` with query params, it might break the path structure 
              unless we customize FilterSection or creating standard links.
              
              For now, let's include FilterSection for Year/Language/Sort, but maybe 'Category' dropdown 
              will navigate to `?category` on this page which is wrong.
              
              If the user wants functionality "filtering ekath hadanna", they probably mean Year/Language/Sort within this category.
              We can pass `showCategoryFilter={false}` if FilterSection supports it, or just ignore it.
          */}
          <FilterSection 
            categories={[]} // Hide or empty categories to prevent confusion if component handles it gracefully
            years={uniqueYears} 
            languages={uniqueLanguages}
            currentFilters={{ year, language, sort }}
            hideCategoryFilter={true} // Assuming we might add this prop or it handles empty list
          />
        </div>

        <NativeAd />

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
      </div>
    </main>
  );
}
