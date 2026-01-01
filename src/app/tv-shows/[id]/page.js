import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import TVShowClient from "./TVShowClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: show } = await supabase
    .from("movies")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!show) return { title: "Show Not Found | FilmHub" };

  return {
    title: `${show.title} | FilmHub`,
    description: show.description,
    openGraph: {
      title: show.title,
      description: show.description,
    }
  };
}

export default async function TVShowDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: show }, { data: episodes }, { data: { user } }] = await Promise.all([
    supabase.from("movies").select("*").eq("id", id).single(),
    supabase.from("tv_episodes").select("*").eq("tv_show_id", id).order("season_number", { ascending: true }).order("episode_number", { ascending: true }),
    supabase.auth.getUser()
  ]);

  if (!show) {
    notFound();
  }

  return (
    <TVShowClient initialShow={show} initialEpisodes={episodes || []} userId={user?.id} />
  );
}
