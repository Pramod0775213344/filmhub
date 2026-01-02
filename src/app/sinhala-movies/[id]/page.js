import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import SinhalaMovieClient from "./SinhalaMovieClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: movie } = await supabase
    .from("sinhala_movies")
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

export default async function SinhalaMovieDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: movie }, { data: { user } }] = await Promise.all([
    supabase.from("sinhala_movies").select("*").eq("id", id).single(),
    supabase.auth.getUser()
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <SinhalaMovieClient initialMovie={movie} userId={user?.id} />
  );
}
