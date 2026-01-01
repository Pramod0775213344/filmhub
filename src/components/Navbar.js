"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [user, setUser] = useState(null);
  const lastScrollY = useRef(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down and scrolled past a threshold
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        // Show if scrolling up
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 0);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 py-6 md:py-8 lg:py-10 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled 
          ? "glass" 
          : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
      }`}
    >
      <div className="flex items-center px-8 py-0">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-transform group-hover:scale-110">
              <Play size={20} fill="white" className="text-white ml-1" />
            </div>
            <span className="font-display text-2xl font-black tracking-tighter text-white md:text-3xl">
              FILM<span className="text-primary">HUB</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden flex-grow justify-center md:flex">
          <div className="flex items-center gap-10 text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <Link href="/" className="text-white transition-all hover:text-primary hover:tracking-[0.25em]">
              Home
            </Link>
            <Link href="#" className="transition-all hover:text-primary hover:tracking-[0.25em]">
              Movies
            </Link>
            <Link href="#" className="transition-all hover:text-primary hover:tracking-[0.25em]">
              TV Shows
            </Link>
            <Link href="#" className="transition-all hover:text-primary hover:tracking-[0.25em]">
              New & Popular
            </Link>
            {user && (
              <Link href="/my-list" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                My List
              </Link>
            )}
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-6 text-zinc-100 md:gap-8">
          <button className="hidden transition-transform hover:scale-110 hover:text-primary md:block">
            <Search size={22} />
          </button>
          <button className="transition-transform hover:scale-110 hover:text-primary">
            <Bell size={22} />
          </button>
          
          {user ? (
            <div className="group relative">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10 transition-all group-hover:ring-primary">
                  <User size={20} />
                </div>
                <ChevronDown size={14} className="text-zinc-500 transition-transform group-hover:rotate-180" />
              </div>
              
              <div className="absolute right-0 top-full mt-2 w-48 origin-top-right overflow-hidden rounded-xl bg-zinc-900 p-2 opacity-0 shadow-2xl ring-1 ring-white/10 transition-all group-hover:opacity-100">
                <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-bottom border-white/5">
                  Account
                </div>
                <Link href="/my-list" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                  My List
                </Link>
                <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                  Admin Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login"
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95 cinematic-glow"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>


  );
}
