"use server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function searchTMDB(query, type = "movie") {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key is missing");
    return [];
  }

  // Diagnostic check for common key errors
  if (TMDB_API_KEY.length > 32 && TMDB_API_KEY.startsWith("ey")) {
    console.error("TMDB CONFIG ERROR: You seem to be using a v4 Bearer Token (JWT) as the API Key. Please use the shorter 'API Key (v3 auth)' string.");
    return [];
  }
  if (TMDB_API_KEY.length !== 32) {
    console.warn(`TMDB CONFIG WARNING: Your API Key is ${TMDB_API_KEY.length} characters long. A standard v3 API Key is exactly 32 hex characters. Check for spaces.`);
  }

  const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (response.status === 401) {
      console.error("TMDB API Error: 401 Unauthorized. Invalid or missing API key.");
      return [];
    }
    const data = await response.json();
    return (data.results || []).map(item => ({
      ...item,
      id: item.id,
      title: item.title || item.name,
      image_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      year: (item.release_date || item.first_air_date || "").split("-")[0],
    }));
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return [];
  }
}

// TMDB Genre Map helpers
const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export async function getUpcomingMovies(filters = {}) {
  if (!TMDB_API_KEY) return [];

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const endOfYear = `${currentYear}-12-31`;
  
  // Default target languages: English, Hindi, Tamil, Telugu, Malayalam
  const targetLangs = "en|hi|ta|te|ml";
  
  let queries = [];

  // Build queries based on filters or defaults
  if (filters.category === "Animation") {
    // 1. Specific Category Filter: Animation
    queries.push(`&with_genres=16`);
  } else if (filters.language && filters.language !== "All") {
    // 2. Specific Language Filter
    // Map display name to ISO code
    const langCodeMap = { "English": "en", "Hindi": "hi", "Tamil": "ta", "Telugu": "te", "Malayalam": "ml" };
    const code = langCodeMap[filters.language] || "en";
    queries.push(`&with_original_language=${code}`);
  } else {
    // 3. Default: All target languages OR Animation
    // Since we can't do OR easily across params in one call for mixed types, we fetch both sets.
    queries.push(`&with_original_language=${targetLangs}`);
    queries.push(`&with_genres=16`);
  }

  try {
    const fetchPromises = queries.map(queryParam => 
      fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=${endOfYear}${queryParam}&page=1`,
        { next: { revalidate: 3600 } }
      ).then(res => res.json())
    );

    const results = await Promise.all(fetchPromises);
    const allMovies = results.flatMap(data => data.results || []);

    // Dedup and Map
    const seen = new Set();
    return allMovies
      .filter(item => {
        if (!item.release_date) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => new Date(a.release_date) - new Date(b.release_date)) // Sort by release date ascending
      .map(item => ({
        id: item.id,
        title: item.title,
        image_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        year: (item.release_date || "").split("-")[0],
        release_date: item.release_date,
        rating: item.vote_average?.toFixed(1) || "NR",
        category: genreMap[item.genre_ids?.[0]] || "Movie",
        language: item.original_language ? new Intl.DisplayNames(['en'], { type: 'language' }).of(item.original_language) : "English",
        overview: item.overview,
        link: `/upcoming/${item.id}`,
        type: "Upcoming"
      }));
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return [];
  }
}

export async function getTMDBDetails(id, type = "movie") {
  if (!TMDB_API_KEY) return null;

  const endpoint = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,images`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Map TMDB genres to local categories if needed
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Sci-Fi",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western"
    };

    const crew = data.credits?.crew || [];
    const director = crew.find(c => c.job === "Director")?.name || "";
    const cast = data.credits?.cast?.slice(0, 10) || [];
    const actors = cast.map(a => a.name) || [];
    
    const cast_details = cast.map(actor => ({
      name: actor.name,
      character: actor.character,
      image: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
    }));

    return {
      title: data.title || data.name,
      description: data.overview,
      image_url: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
      rating: data.vote_average?.toFixed(1) || "0",
      year: (data.release_date || data.first_air_date || "").split("-")[0],
      category: data.genres?.[0]?.name || "Action",
      actors: actors.join(", "),
      cast_details: cast_details,
      director: director,
      duration: data.runtime ? `${data.runtime} min` : (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min` : ""),
      country: data.production_countries?.[0]?.name || "",
      country: data.production_countries?.[0]?.name || "",
      imdb_rating: data.vote_average?.toFixed(1) || "0",
      trailer: data.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube") ? `https://www.youtube.com/watch?v=${data.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube").key}` : "",
      backdrops: data.images?.backdrops?.slice(0, 10).map(img => `https://image.tmdb.org/t/p/original${img.file_path}`) || [],
      posters: data.images?.posters?.slice(0, 10).map(img => `https://image.tmdb.org/t/p/w500${img.file_path}`) || [],
      language: data.original_language ? new Intl.DisplayNames(['en'], { type: 'language' }).of(data.original_language) : "English",
    };
  } catch (error) {
    console.error("Error getting TMDB details:", error);
    return null;
  }
}
