import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import MovieClient from "./MovieClient";
import { slugify, deslugify } from "@/utils/slugify";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();
  
  const { data: movies } = await supabase
    .from("movies")
    .select("title, description")
    .ilike("title", `%${decodedTitle.replace(/ /g, '%')}%`);
  
  const movie = movies?.find(m => slugify(m.title) === slug);

  if (!movie) return { title: "Movie Not Found | SubHub SL" };

  return {
    title: `${movie.title} | SubHub SL`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
    }
  };
}

export default async function MovieDetailsPage({ params }) {
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();

  const [{ data: movies }, { data: { user } }] = await Promise.all([
    supabase.from("movies")
      .select("*")
      .ilike("title", decodedTitle.replace(/ /g, '%')),
    supabase.auth.getUser()
  ]);

  const movie = movies?.find(m => slugify(m.title) === slug);

  if (!movie) {
    // If it's an ID, try to find and redirect
    if (/^\d+$/.test(slug)) {
      const { data: movieById } = await supabase.from("movies").select("title").eq("id", slug).single();
      if (movieById) {
        redirect(`/movies/${slugify(movieById.title)}`);
      }
    }
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "description": movie.description,
            "image": movie.image_url,
            "datePublished": movie.year ? `${movie.year}-01-01` : undefined, // Assuming year is 2024
            "aggregateRating": movie.rating ? {
              "@type": "AggregateRating",
              "ratingValue": movie.rating,
              "bestRating": "10",
              "ratingCount": "100" // Placeholder or actual data if available
            } : undefined,
            "director": movie.director ? {
              "@type": "Person",
              "name": movie.director
            } : undefined,
            "actor": movie.actors 
              ? (typeof movie.actors === 'string' 
                  ? movie.actors.split(',').map(actor => ({ "@type": "Person", "name": actor.trim() }))
                  : Array.isArray(movie.actors) 
                    ? movie.actors.map(actor => ({ "@type": "Person", "name": typeof actor === 'string' ? actor : actor.name || "Unknown" }))
                    : undefined
                )
              : undefined
          })
        }}
      />
      <MovieClient initialMovie={movie} userId={user?.id} />
    </>
  );
}
