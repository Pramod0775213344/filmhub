"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Play, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { createPortal } from "react-dom";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        router.refresh();
      } else if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      }
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
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 py-3 md:py-4 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled 
            ? "glass !border-b-0" 
            : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
        }`}
      >
        <div className="flex items-center px-6 md:px-12 justify-between">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="mr-4 text-white md:hidden"
          >
            <Menu size={24} />
          </button>

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
            <div className="flex items-center gap-8 text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <Link href="/" className="text-white transition-all hover:text-primary hover:tracking-[0.25em]">
                Home
              </Link>
              <Link href="/movies" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Movies
              </Link>
              <Link href="/tv-shows" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                TV Shows
              </Link>
              <Link href="/contact" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Contact
              </Link>
              {user && (
                <Link href="/my-list" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                  My List
                </Link>
              )}
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 text-zinc-100 md:gap-6">
            <div className={`relative flex items-center transition-all duration-500 ${isSearchOpen ? "w-64" : "w-10"}`}>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="absolute left-2 z-10 transition-transform hover:scale-110 hover:text-primary"
              >
                <Search size={22} />
              </button>
              <input
                type="text"
                placeholder="Titles, people, genres"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(searchQuery ? `/?s=${encodeURIComponent(searchQuery)}` : "/");
                  }
                }}
                className={`h-10 w-full rounded-full bg-white/10 pl-10 pr-4 text-sm font-bold text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/20 ${
                  isSearchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            </div>
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
                
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right overflow-hidden rounded-xl bg-zinc-900 p-2 opacity-0 invisible shadow-2xl ring-1 ring-white/10 transition-all group-hover:opacity-100 group-hover:visible">
                  <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-bottom border-white/5">
                    Account
                  </div>
                  <Link href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                    Profile Settings
                  </Link>
                  <Link href="/my-list" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                    My List
                  </Link>
                  {user?.email === "admin@gmail.com" && (
                    <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                      Admin Dashboard
                    </Link>
                  )}
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

      {/* Mobile Menu Docker */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm md:hidden"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-[101] w-full bg-black p-6 shadow-2xl md:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Play size={16} fill="white" className="text-white ml-0.5" />
                    </div>
                    <span className="font-display text-xl font-black tracking-tighter text-white">
                      FILM<span className="text-primary">HUB</span>
                    </span>
                  </Link>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full bg-white/5 p-2 text-zinc-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Menu</p>
                    <nav className="flex flex-col space-y-1">
                      {[
                        { name: "Home", href: "/" },
                        { name: "Movies", href: "/movies" },
                        { name: "TV Shows", href: "/tv-shows" },
                        { name: "Contact", href: "/contact" },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      ))}
                      {user && (
                        <Link
                          href="/my-list"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          My List
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-6 right-6">
                  {!user && (
                     <Link 
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
