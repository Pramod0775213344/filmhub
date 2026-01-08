"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function WatchlistStatus({ movieId, initialStatus = false }) {
  const [isInList, setIsInList] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(!initialStatus);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (initialStatus) {
      setChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("watchlists")
            .select("id")
            .eq("user_id", user.id)
            .eq("movie_id", movieId)
            .single();
          if (data) setIsInList(true);
        }
      } catch (err) {
        // Ignore error
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [movieId, initialStatus, supabase]);

  const toggleList = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    setLoading(true);
    try {
      if (isInList) {
        const { error } = await supabase
          .from("watchlists")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movieId);
        if (!error) setIsInList(false);
      } else {
        const { error } = await supabase
          .from("watchlists")
          .insert([{ user_id: user.id, movie_id: movieId }]);
        if (!error) setIsInList(true);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border border-white/10 bg-white/10 opacity-50">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <button 
      onClick={toggleList}
      disabled={loading}
      aria-label={isInList ? "Remove from watchlist" : "Add to watchlist"}
      className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 ${
        isInList ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : isInList ? <Check size={20} /> : <Plus size={20} />}
    </button>
  );
}
