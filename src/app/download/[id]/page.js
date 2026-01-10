import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DownloadClient from "./DownloadClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: movie } = await supabase.from("movies").select("title").eq("id", id).single();
  
  return {
    title: `Download ${movie?.title || 'Movie'} | SubHub SL`,
    description: `Secure download links for ${movie?.title || 'Movie'}.`,
  };
}

export default async function DownloadPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (!movie) notFound();

  const { data: links } = await supabase
    .from("movie_links")
    .select("*")
    .eq("movie_id", id);

  return (
    <DownloadClient movie={movie} links={links || []} />
  );
}
