import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  // CRITICAL: මෙතැන ඇති URL එක ඔබගේ Google Search Console එකේ ඇති URL එකට (Property) 
  // අකුරක් නෑර සමාන විය යුතුය. (www අවශ්‍ය නම් එයද ඇතුළත් කරන්න)
  const baseUrl = "https://filmhub-movie.vercel.app"; 
  
  const supabase = await createClient();

  // 1. Fetch Movies & TV Shows
  const { data: movies } = await supabase
    .from("movies")
    .select("id, updated_at, type")
    .order("created_at", { ascending: false });

  // 2. Fetch Korean Dramas
  const { data: koreanDramas } = await supabase
    .from("korean_dramas")
    .select("id, updated_at")
    .order("created_at", { ascending: false });

  // Static Routes
  const routes = [
    "",
    "/movies",
    "/tv-shows",
    "/korean-dramas",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic Movie/TV Show Routes
  const movieEntries = (movies || []).map((movie) => {
    const segment = movie.type === "TV Show" ? "tv-shows" : "movies";
    return {
      url: `${baseUrl}/${segment}/${movie.id}`,
      lastModified: movie.updated_at || new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Dynamic Korean Drama Routes
  const koreanEntries = (koreanDramas || []).map((drama) => ({
    url: `${baseUrl}/korean-dramas/${drama.id}`,
    lastModified: drama.updated_at || new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...routes, ...movieEntries, ...koreanEntries];
}
