import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import TVShowClient from "./TVShowClient";
import { slugify, deslugify } from "@/utils/slugify";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();
  
  const { data: shows } = await supabase
    .from("movies")
    .select("title, description")
    .ilike("title", `%${decodedTitle.replace(/ /g, '%')}%`);
  
  const show = shows?.find(s => slugify(s.title) === slug);

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
  const { slug } = await params;
  const decodedTitle = deslugify(slug);
  const supabase = await createClient();

  // First get the show to have its ID for episodes
  const { data: shows } = await supabase
    .from("movies")
    .select("*")
    .ilike("title", decodedTitle.replace(/ /g, '%'));

  const show = shows?.find(s => slugify(s.title) === slug);

  if (!show) {
    // If it's an ID, try to find and redirect
    if (/^\d+$/.test(slug)) {
      const { data: showById } = await supabase.from("movies").select("title").eq("id", slug).single();
      if (showById) {
        redirect(`/tv-shows/${slugify(showById.title)}`);
      }
    }
    notFound();
  }

  const [{ data: episodes }, { data: { user } }] = await Promise.all([
    supabase.from("tv_episodes")
      .select("*")
      .eq("tv_show_id", show.id)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true }),
    supabase.auth.getUser()
  ]);

  return (
    <TVShowClient initialShow={show} initialEpisodes={episodes || []} userId={user?.id} />
  );
}
