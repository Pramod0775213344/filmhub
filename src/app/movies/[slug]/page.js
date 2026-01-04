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

  if (!movie) return { title: "Movie Not Found | FilmHub" };

  return {
    title: `${movie.title} | FilmHub`,
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
    <MovieClient initialMovie={movie} userId={user?.id} />
  );
}
