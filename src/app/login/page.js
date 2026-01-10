"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Github, Home } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const error = internalError || (searchParams.get("error") === "auth-code-error" 
    ? "Trouble signing in. Your login link may have expired. Please try again." 
    : null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    
    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setInternalError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setInternalError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setInternalError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setInternalError("Please check your email and confirm your account before signing in.");
      } else if (error.message.includes("Invalid login credentials")) {
        setInternalError("Invalid email or password. Please try again.");
      } else {
        setInternalError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    
    // Determine redirect origin dynamically to work in both local and hosted environments
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setInternalError(error.message);
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
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-bg.png"
          alt="Cinema Background"
          fill
          className="object-cover opacity-30"
          priority
          quality={100}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl md:p-12"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="font-display text-3xl font-black tracking-tighter text-white">
            SUBHUB<span className="text-primary"> SL</span>
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
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white text-black py-4 text-sm font-bold transition-all hover:bg-zinc-200 ring-1 ring-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
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
