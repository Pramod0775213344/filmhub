import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/utils/slugify";
import { sanitizeInput, validateOrigin, securityError, validateEnv } from "@/utils/security";

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
      .select("id, title, year, category, type, image_url, rating")
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm},cast.ilike.${searchTerm}`)
      .limit(limit);

    // Search in korean_dramas table
    const { data: kdramas, error: kdramasError } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, image_url, rating")
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .limit(limit);

    const results = {
      movies: movies || [],
      koreanDramas: kdramas || []
    };

    return results;
  } catch (error) {
    console.error("Database search error:", error);
    return { movies: [], koreanDramas: [] };
  }
}

// Get content by genre/category
async function getByGenre(genre, limit = 5) {
  const genreTerm = `%${genre}%`;
  
  try {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, year, category, type, image_url, rating")
      .ilike("category", genreTerm)
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, image_url, rating")
      .ilike("category", genreTerm)
      .limit(limit);

    return {
      movies: movies || [],
      koreanDramas: kdramas || []
    };
  } catch (error) {
    return { movies: [], koreanDramas: [] };
  }
}

// Get trending/popular content
async function getTrending(limit = 5) {
  try {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, title, year, category, type, image_url, rating, views")
      .order("views", { ascending: false, nullsFirst: false })
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, image_url, rating, views")
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
      .select("id, title, year, category, type, image_url, rating")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: kdramas } = await supabase
      .from("korean_dramas")
      .select("id, title, year, category, image_url, rating")
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

// Format results for AI context and structured response
function formatResultsForAI(results, contentType = "all") {
  let formatted = "";
  const allFound = [];
  
  if (results.movies && results.movies.length > 0) {
    const contentLabel = contentType === "all" ? "Movies/TV Shows" : contentType;
    formatted += `\n🎬 ${contentLabel} found:\n`;
    results.movies.forEach((m, i) => {
      const rating = m.rating ? `⭐ ${m.rating}` : "";
      const type = m.type === "TV Show" ? "tv-shows" : "movies";
      const path = `/${type}/${slugify(m.title)}`;
      formatted += `${i + 1}. "${m.title}" (${m.year || "N/A"}) - ${m.category || m.type || "Film"} ${rating}\n`;
      formatted += `   👉 Link: ${path}\n`;
      allFound.push({ ...m, url: path, displayType: m.type || "Movie" });
    });
  }

  if (results.koreanDramas && results.koreanDramas.length > 0) {
    formatted += `\n🇰🇷 Korean Dramas found:\n`;
    results.koreanDramas.forEach((m, i) => {
      const rating = m.rating ? `⭐ ${m.rating}` : "";
      const path = `/korean-dramas/${slugify(m.title)}`;
      formatted += `${i + 1}. "${m.title}" (${m.year || "N/A"}) - ${m.category || "Drama"} ${rating}\n`;
      formatted += `   👉 Link: ${path}\n`;
      allFound.push({ ...m, url: path, displayType: "Korean Drama" });
    });
  }

  return { text: formatted || "No results found in the database.", list: allFound };
}

// FilmHub AI System Prompt
const SYSTEM_PROMPT = `You are SubHub SL AI, a helpful movie search assistant for the SubHub SL streaming platform.

IMPORTANT CAPABILITIES:
- You can search the SubHub SL database for movies, TV shows, and Korean dramas
- When users ask about finding content, you will provide REAL results from the database
- Always include the direct links to content when showing results

CONTENT AVAILABLE ON SUBHUB SL:
1. Movies - Hollywood and international films
2. TV Shows - Popular series
3. Korean Dramas (K-Dramas) - Korean TV series

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
- My List: /my-list (requires login)`;

export async function POST(req) {
  // Validate origin
  if (!validateOrigin(req)) {
    return securityError('Invalid request origin');
  }

  try {
    const body = await req.json();
    const { messages } = body;
    
    // Validate environment
    if (!validateEnv(['GEMINI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL'])) {
      return securityError('Server configuration error', 500);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not configured" },
        { status: 500 }
      );
    }

    // Get the latest user message and sanitize it
    const lastMessage = messages[messages.length - 1];
    const userMessage = sanitizeInput(lastMessage.content);
    
    // Replace it back in the messages array for processing
    lastMessage.content = userMessage;
    
    // Analyze intent and search database
    const { intent, searchTerm } = analyzeQuery(userMessage);
    let dbResults = null;
    let dbContext = "";

    console.log(`[Chatbot] Intent: ${intent}, Search term: ${searchTerm}`);

    // Perform database operations based on intent
    let formattedData = { text: "", list: [] };
    switch (intent) {
      case "search":
        if (searchTerm) {
          dbResults = await searchMovies(searchTerm);
          formattedData = formatResultsForAI(dbResults);
          dbContext = `\n\n[DATABASE SEARCH RESULTS for "${searchTerm}"]${formattedData.text}`;
        }
        break;
      case "trending":
        dbResults = await getTrending();
        formattedData = formatResultsForAI(dbResults);
        dbContext = `\n\n[TRENDING CONTENT ON SUBHUB SL]${formattedData.text}`;
        break;
      case "recent":
        dbResults = await getRecent();
        formattedData = formatResultsForAI(dbResults);
        dbContext = `\n\n[RECENTLY ADDED CONTENT]${formattedData.text}`;
        break;
      case "korean":
        dbResults = await searchMovies(searchTerm || "");
        formattedData = formatResultsForAI({ koreanDramas: dbResults.koreanDramas }, "Korean Drama");
        dbContext = `\n\n[KOREAN DRAMAS]${formattedData.text}`;
        break;

      case "genre":
        if (searchTerm) {
          dbResults = await getByGenre(searchTerm);
          formattedData = formatResultsForAI(dbResults, searchTerm);
          dbContext = `\n\n[${searchTerm.toUpperCase()} GENRE CONTENT]${formattedData.text}`;
        }
        break;
      default:
        // General query - do a quick search if there's meaningful content
        if (userMessage.length > 10) {
          dbResults = await searchMovies(userMessage);
          formattedData = formatResultsForAI(dbResults);
          
          if (formattedData.list.length > 0) {
            dbContext = `\n\n[POTENTIAL MATCHES FOUND]${formattedData.text}`;
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
      parts: [{ text: "I'm SubHub SL AI, ready to help you find amazing movies and shows! 🎬 I can search our database for movies, TV shows, and Korean dramas. What would you like to watch?" }]
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

    return NextResponse.json({ 
      text: aiText,
      suggestions: formattedData.list.slice(0, 3) // Return top 3 matched movies as structured suggestions
    });

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
    features: ["movie_search", "trending", "genre_filter", "korean_dramas"],
    message: apiKey && supabaseUrl
      ? "✅ SubHub SL AI is fully configured with database search!"
      : "⚠️ Missing configuration - check .env.local"
  });
}
