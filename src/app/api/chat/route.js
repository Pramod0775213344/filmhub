import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Search movies in database
async function searchMovies(query, limit = 5) {
  const searchTerm = `%${query}%`;
  
  try {
    // Search in movies table (Movies & TV Shows)
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("id, title, year, category, type, poster_url, rating")
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm},cast.ilike.${searchTerm}`)
      .limit(limit);

    // Search in korean_dramas table
    const { data: kdramas, error: kdramasError } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, poster_url, rating")
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .limit(limit);

    // Search in sinhala_movies table
    const { data: sinhalaMovies, error: sinhalaError } = await supabase
      .from("sinhala_movies")
      .select("id, title, year, category, poster_url, rating")
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .limit(limit);

    const results = {
      movies: movies || [],
      koreanDramas: kdramas || [],
      sinhalaMovies: sinhalaMovies || []
    };

    return results;
  } catch (error) {
    console.error("Database search error:", error);
    return { movies: [], koreanDramas: [], sinhalaMovies: [] };
  }
}

// Get content by genre/category
async function getByGenre(genre, limit = 5) {
  const genreTerm = `%${genre}%`;
  
  try {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, year, category, type, poster_url, rating")
      .ilike("category", genreTerm)
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, poster_url, rating")
      .ilike("category", genreTerm)
      .limit(limit);

    const { data: sinhalaMovies } = await supabase
      .from("sinhala_movies")
      .select("id, title, year, category, poster_url, rating")
      .ilike("category", genreTerm)
      .limit(limit);

    return {
      movies: movies || [],
      koreanDramas: kdramas || [],
      sinhalaMovies: sinhalaMovies || []
    };
  } catch (error) {
    return { movies: [], koreanDramas: [], sinhalaMovies: [] };
  }
}

// Get trending/popular content
async function getTrending(limit = 5) {
  try {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, year, category, type, poster_url, rating, views")
      .order("views", { ascending: false, nullsFirst: false })
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, poster_url, rating, views")
      .order("views", { ascending: false, nullsFirst: false })
      .limit(limit);

    return {
      movies: movies || [],
      koreanDramas: kdramas || []
    };
  } catch (error) {
    return { movies: [], koreanDramas: [] };
  }
}

// Get recent additions
async function getRecent(limit = 5) {
  try {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, year, category, type, poster_url, rating")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, poster_url, rating")
      .order("created_at", { ascending: false })
      .limit(limit);

    return {
      movies: movies || [],
      koreanDramas: kdramas || []
    };
  } catch (error) {
    return { movies: [], koreanDramas: [] };
  }
}

// Analyze user query to determine intent
function analyzeQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Search patterns
  const searchPatterns = [
    /(?:find|search|looking for|where is|show me|i want to watch|recommend)\s+(.+)/i,
    /(?:any|have you got|do you have)\s+(.+)\s+(?:movies?|films?|shows?|dramas?)/i,
  ];
  
  // Genre patterns
  const genreKeywords = ["action", "comedy", "drama", "horror", "romance", "thriller", "sci-fi", "fantasy", "adventure", "animation", "crime", "mystery"];
  
  // Category patterns
  const categoryPatterns = {
    korean: /korean|k-drama|kdrama|k drama/i,
    sinhala: /sinhala|sri lankan|local/i,
    tvshow: /tv show|tv series|series|show/i,
    movie: /movie|film/i,
    trending: /trending|popular|top|best|most watched/i,
    recent: /new|recent|latest|just added/i
  };

  // Detect intent
  let intent = "general";
  let searchTerm = "";

  // Check for trending
  if (categoryPatterns.trending.test(lowerQuery)) {
    intent = "trending";
  }
  // Check for recent
  else if (categoryPatterns.recent.test(lowerQuery)) {
    intent = "recent";
  }
  // Check for Korean content
  else if (categoryPatterns.korean.test(lowerQuery)) {
    intent = "korean";
    searchTerm = lowerQuery.replace(categoryPatterns.korean, "").trim();
  }
  // Check for Sinhala content
  else if (categoryPatterns.sinhala.test(lowerQuery)) {
    intent = "sinhala";
    searchTerm = lowerQuery.replace(categoryPatterns.sinhala, "").trim();
  }
  // Check for genre
  else {
    for (const genre of genreKeywords) {
      if (lowerQuery.includes(genre)) {
        intent = "genre";
        searchTerm = genre;
        break;
      }
    }
  }

  // Extract search term from patterns
  for (const pattern of searchPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      intent = "search";
      searchTerm = match[1].trim();
      break;
    }
  }

  // If no specific intent, try to extract any meaningful words
  if (intent === "general" && lowerQuery.length > 3) {
    // Remove common words
    const stopWords = ["what", "which", "where", "when", "how", "can", "you", "show", "me", "the", "a", "an", "is", "are", "do", "have", "any", "some"];
    const words = lowerQuery.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2);
    if (words.length > 0) {
      searchTerm = words.join(" ");
      intent = "search";
    }
  }

  return { intent, searchTerm };
}

// Format results for AI context
function formatResultsForAI(results, contentType = "all") {
  let formatted = "";
  
  if (results.movies && results.movies.length > 0) {
    const contentLabel = contentType === "all" ? "Movies/TV Shows" : contentType;
    formatted += `\n🎬 ${contentLabel} found:\n`;
    results.movies.forEach((m, i) => {
      const rating = m.rating ? `⭐ ${m.rating}` : "";
      formatted += `${i + 1}. "${m.title}" (${m.year || "N/A"}) - ${m.category || m.type || "Film"} ${rating}\n`;
      formatted += `   👉 Link: /movies/${m.id}\n`;
    });
  }

  if (results.koreanDramas && results.koreanDramas.length > 0) {
    formatted += `\n🇰🇷 Korean Dramas found:\n`;
    results.koreanDramas.forEach((m, i) => {
      const rating = m.rating ? `⭐ ${m.rating}` : "";
      formatted += `${i + 1}. "${m.title}" (${m.year || "N/A"}) - ${m.category || "Drama"} ${rating}\n`;
      formatted += `   👉 Link: /korean-dramas/${m.id}\n`;
    });
  }

  if (results.sinhalaMovies && results.sinhalaMovies.length > 0) {
    formatted += `\n🇱🇰 Sinhala Movies found:\n`;
    results.sinhalaMovies.forEach((m, i) => {
      const rating = m.rating ? `⭐ ${m.rating}` : "";
      formatted += `${i + 1}. "${m.title}" (${m.year || "N/A"}) - ${m.category || "Movie"} ${rating}\n`;
      formatted += `   👉 Link: /sinhala-movies/${m.id}\n`;
    });
  }

  return formatted || "No results found in the database.";
}

// FilmHub AI System Prompt
const SYSTEM_PROMPT = `You are FilmHub AI, a helpful movie search assistant for the FilmHub streaming platform.

IMPORTANT CAPABILITIES:
- You can search the FilmHub database for movies, TV shows, Korean dramas, and Sinhala movies
- When users ask about finding content, you will provide REAL results from the database
- Always include the direct links to content when showing results

CONTENT AVAILABLE ON FILMHUB:
1. Movies - Hollywood and international films
2. TV Shows - Popular series
3. Korean Dramas (K-Dramas) - Korean TV series
4. Sinhala Movies - Sri Lankan films

YOUR BEHAVIOR:
- Be friendly and helpful with a cinematic enthusiasm 🎬
- When showing search results, format them nicely with titles, years, and direct links
- If no results found, suggest alternative searches or browsing categories
- Keep responses concise but informative
- Use emojis sparingly but effectively

SITE NAVIGATION HELP:
- Browse Movies: /movies
- Browse TV Shows: /tv-shows
- Browse Korean Dramas: /korean-dramas
- Browse Sinhala Movies: /sinhala-movies
- My List: /my-list (requires login)`;

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not configured" },
        { status: 500 }
      );
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content;
    
    // Analyze intent and search database
    const { intent, searchTerm } = analyzeQuery(userMessage);
    let dbResults = null;
    let dbContext = "";

    console.log(`[Chatbot] Intent: ${intent}, Search term: ${searchTerm}`);

    // Perform database operations based on intent
    switch (intent) {
      case "search":
        if (searchTerm) {
          dbResults = await searchMovies(searchTerm);
          dbContext = `\n\n[DATABASE SEARCH RESULTS for "${searchTerm}"]${formatResultsForAI(dbResults)}`;
        }
        break;
      case "trending":
        dbResults = await getTrending();
        dbContext = `\n\n[TRENDING CONTENT ON FILMHUB]${formatResultsForAI(dbResults)}`;
        break;
      case "recent":
        dbResults = await getRecent();
        dbContext = `\n\n[RECENTLY ADDED CONTENT]${formatResultsForAI(dbResults)}`;
        break;
      case "korean":
        dbResults = await searchMovies(searchTerm || "");
        // Filter to only Korean dramas
        dbContext = `\n\n[KOREAN DRAMAS]${formatResultsForAI({ koreanDramas: dbResults.koreanDramas })}`;
        break;
      case "sinhala":
        dbResults = await searchMovies(searchTerm || "");
        // Filter to only Sinhala movies
        dbContext = `\n\n[SINHALA MOVIES]${formatResultsForAI({ sinhalaMovies: dbResults.sinhalaMovies })}`;
        break;
      case "genre":
        if (searchTerm) {
          dbResults = await getByGenre(searchTerm);
          dbContext = `\n\n[${searchTerm.toUpperCase()} GENRE CONTENT]${formatResultsForAI(dbResults)}`;
        }
        break;
      default:
        // General query - do a quick search if there's meaningful content
        if (userMessage.length > 10) {
          dbResults = await searchMovies(userMessage);
          const totalResults = 
            (dbResults.movies?.length || 0) + 
            (dbResults.koreanDramas?.length || 0) + 
            (dbResults.sinhalaMovies?.length || 0);
          
          if (totalResults > 0) {
            dbContext = `\n\n[POTENTIAL MATCHES FOUND]${formatResultsForAI(dbResults)}`;
          }
        }
    }

    // Build conversation with context
    const contents = [];

    // System context
    contents.push({
      role: "user",
      parts: [{ text: `${SYSTEM_PROMPT}\n\nPlease confirm you understand your role.` }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "I'm FilmHub AI, ready to help you find amazing movies and shows! 🎬 I can search our database for movies, TV shows, Korean dramas, and Sinhala films. What would you like to watch?" }]
    });

    // Add conversation history
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }

    // Add current message with database context
    contents.push({
      role: "user",
      parts: [{ text: userMessage + dbContext }]
    });

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "AI service error" },
        { status: response.status }
      );
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET endpoint to test configuration
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return NextResponse.json({
    geminiConfigured: !!apiKey,
    supabaseConfigured: !!supabaseUrl,
    model: "gemini-2.5-flash",
    features: ["movie_search", "trending", "genre_filter", "korean_dramas", "sinhala_movies"],
    message: apiKey && supabaseUrl
      ? "✅ FilmHub AI is fully configured with database search!"
      : "⚠️ Missing configuration - check .env.local"
  });
}
