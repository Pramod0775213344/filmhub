"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Github, Home } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and confirm your account before signing in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Home Link */}
      <Link 
        href="/" 
        className="absolute left-6 top-6 flex items-center gap-2 text-zinc-500 transition-colors hover:text-white group z-50 md:left-10 md:top-10"
      >
        <Home size={20} className="transition-transform group-hover:scale-110" />
        <span className="text-xs font-black uppercase tracking-widest opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
          Back Home
        </span>
      </Link>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl md:p-12"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="font-display text-3xl font-black tracking-tighter text-white">
            FILM<span className="text-primary">HUB</span>
          </Link>
          <p className="mt-4 text-zinc-400 font-medium">Welcome back, cinema lover.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-primary" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Password</label>
              <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-primary" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-sm font-bold text-primary"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cinematic-glow w-full rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-white/5"></div>
            <span className="absolute bg-background px-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Or continue with</span>
          </div>

          <div className="mt-6">
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 ring-1 ring-white/10">
              <Github size={20} />
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-white hover:text-primary transition-colors">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
