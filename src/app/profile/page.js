"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Save, Loader2, Camera, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
  });
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const initProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        setUser(user);

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            avatar_url: data.avatar_url || "",
          });
        } else if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [supabase, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Profile <span className="text-primary italic">Settings</span>
            </h1>
            <p className="mt-4 font-medium text-zinc-500">Manage your account information and cinematic identity.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar with Avatar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass flex flex-col items-center rounded-3xl p-8 text-center ring-1 ring-white/10 shadow-2xl">
                <div className="relative group mb-6">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-primary/20 transition-all group-hover:ring-primary/40 bg-zinc-900 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User size={64} className="text-zinc-800" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" disabled />
                  </label>
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">{profile.full_name || "Cinema Lover"}</h3>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mt-2">Member since 2026</p>
                
                <div className="mt-8 w-full space-y-3 pt-8 border-t border-white/5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <span>Watchlist</span>
                    <span className="text-white">12 Titles</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <span>Reviews</span>
                    <span className="text-white">4 Published</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSave} className="glass space-y-8 rounded-3xl p-8 md:p-12 ring-1 ring-white/10 shadow-2xl relative overflow-hidden">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                      <User size={12} />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 opacity-60">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                      <Mail size={12} />
                      Email Address (Protected)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full rounded-2xl bg-zinc-900/10 py-4 px-6 text-zinc-400 outline-none ring-1 ring-white/5 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                      <Globe size={12} />
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cinematic-glow flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-green-500 font-bold text-sm tracking-wide bg-green-500/10 py-3 rounded-xl border border-green-500/20"
                      >
                        <CheckCircle2 size={16} />
                        <span>Profile updated successfully!</span>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-primary font-bold text-sm tracking-wide bg-primary/10 py-3 rounded-xl border border-primary/20"
                      >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
