import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import KoreanDramaClient from "./KoreanDramaClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: movie } = await supabase
    .from("korean_dramas")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!movie) return { title: "Drama Not Found | FilmHub" };

  return {
    title: `${movie.title} | FilmHub`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
    }
  };
}

export default async function KoreanDramaDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: movie }, { data: { user } }] = await Promise.all([
    supabase.from("korean_dramas").select("*").eq("id", id).single(),
    supabase.auth.getUser()
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <KoreanDramaClient initialMovie={movie} userId={user?.id} />
  );
}
