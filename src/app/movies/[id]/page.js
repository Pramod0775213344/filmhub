import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import MovieClient from "./MovieClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: movie } = await supabase
    .from("movies")
    .select("title, description")
    .eq("id", id)
    .single();

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
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: movie }, { data: { user } }] = await Promise.all([
    supabase.from("movies").select("*").eq("id", id).single(),
    supabase.auth.getUser()
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <MovieClient initialMovie={movie} userId={user?.id} />
  );
}
