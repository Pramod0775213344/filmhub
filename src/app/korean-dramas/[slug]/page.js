import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import KoreanDramaClient from "./KoreanDramaClient";
import { slugify, deslugify } from "@/utils/slugify";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();
  
  const { data: movies } = await supabase
    .from("korean_dramas")
    .select("title, description")
    .ilike("title", `%${decodedTitle.replace(/ /g, '%')}%`);
  
  const movie = movies?.find(m => slugify(m.title) === slug);

  if (!movie) return { title: "Drama Not Found | SubHub SL" };

  return {
    title: `${movie.title} | SubHub SL`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
    }
  };
}

export default async function KoreanDramaDetailsPage({ params }) {
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();

  const [{ data: movies }, { data: { user } }] = await Promise.all([
    supabase.from("korean_dramas")
      .select("*")
      .ilike("title", decodedTitle.replace(/ /g, '%')),
    supabase.auth.getUser()
  ]);

  const movie = movies?.find(m => slugify(m.title) === slug);

  if (!movie) {
    // If it's an ID, try to find and redirect
    if (/^\d+$/.test(slug)) {
      const { data: movieById } = await supabase.from("korean_dramas").select("title").eq("id", slug).single();
      if (movieById) {
        redirect(`/korean-dramas/${slugify(movieById.title)}`);
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
            "@type": "TVSeries",
            "name": movie.title,
            "description": movie.description,
            "image": movie.image_url,
            "startDate": movie.year ? `${movie.year}-01-01` : undefined,
            "aggregateRating": movie.rating ? {
              "@type": "AggregateRating",
              "ratingValue": movie.rating,
              "bestRating": "10",
              "ratingCount": "50" // Placeholder
            } : undefined,
            "director": movie.director ? {
              "@type": "Person",
              "name": movie.director
            } : undefined,
          })
        }}
      />
      <KoreanDramaClient initialMovie={movie} userId={user?.id} />
    </>
  );
}
