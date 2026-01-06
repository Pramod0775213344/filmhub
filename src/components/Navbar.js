"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Play, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { InlineSpinner } from "@/components/LoadingSpinner";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";

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
  const searchContainerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

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
      // Simple throttle using requestAnimationFrame
      requestAnimationFrame(() => {
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
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  /* Notifications Logic */
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const notifications = [
    { id: 1, title: "New Arrival", message: "Inception is now available in 4K!", time: "2m ago", read: false },
    { id: 2, title: "System Update", message: "We've updated our player for better performance.", time: "1h ago", read: false },
    { id: 3, title: "Trending", message: "Everyone is watching 'Dune: Part Two'.", time: "5h ago", read: true },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Listen for close event from Chatbot
    const handleCloseFromChatbot = () => {
      setIsSearchOpen(false);
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
      setSearchResults([]);
      setSearchQuery("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("closeNavbarPanels", handleCloseFromChatbot);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("closeNavbarPanels", handleCloseFromChatbot);
    };
  }, []);

  const handleSearch = useDebouncedCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    if (!supabase) {
      console.error("Supabase client not initialized");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .ilike("title", `%${term}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const onSearchInput = (e) => {
    setSearchQuery(e.target.value);
    if (!isSearchOpen) setIsSearchOpen(true);
    handleSearch(e.target.value);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 py-2.5 md:py-4 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled 
            ? "glass !border-b-0" 
            : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
        }`}
      >
        <div className="flex items-center px-6 md:px-12 justify-between">
          {/* Mobile Menu Button - Always visible */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="mr-2 md:mr-4 text-white md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} className="md:w-6 md:h-6" />
          </button>

          {/* Left: Logo - Always visible */}
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
            <div className="flex items-center gap-8 text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-300">
              <Link href="/" className="text-white transition-all hover:text-primary hover:tracking-[0.25em]">
                Home
              </Link>

              
              {/* Categories Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setHoveredTab("categories")}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button className="flex items-center gap-1 transition-all hover:text-primary hover:tracking-[0.25em] focus:outline-none uppercase">
                  Categories <ChevronDown size={14} className="text-primary" />
                </button>
                <AnimatePresence>
                  {hoveredTab === "categories" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 p-2 shadow-2xl overflow-hidden grid grid-cols-1 gap-1 z-50"
                    >
                      {["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Documentary"].map((cat) => (
                        <Link 
                          key={cat} 
                          href={`/category/${slugify(cat)}`}
                          className="block px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest text-center"
                        >
                          {cat}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Languages Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setHoveredTab("languages")}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button className="flex items-center gap-1 transition-all hover:text-primary hover:tracking-[0.25em] focus:outline-none uppercase">
                  Languages <ChevronDown size={14} className="text-primary" />
                </button>
                <AnimatePresence>
                  {hoveredTab === "languages" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 p-2 shadow-2xl overflow-hidden grid grid-cols-1 gap-1 z-50"
                    >
                      {["Sinhala", "Tamil", "English", "Hindi", "Korean", "Malayalam", "Telugu"].map((lang) => (
                        <Link 
                          key={lang} 
                          href={`/language/${slugify(lang)}`}
                          className="block px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest text-center"
                        >
                          {lang}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/movies" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Movies
              </Link>
              <Link href="/tv-shows" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                TV Shows
              </Link>
              <Link href="/korean-dramas" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Korean
              </Link>
              <Link href="/upcoming" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Upcoming
              </Link>
              <Link href="/contact" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                Contact
              </Link>
              <Link href="/about" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                About
              </Link>
              {user && (
                <Link href="/my-list" className="transition-all hover:text-primary hover:tracking-[0.25em]">
                  My List
                </Link>
              )}
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3 md:gap-6 text-zinc-100">
            {/* Search - Mobile & Desktop */}
            <div className="relative">
              <button 
                onClick={() => {
                  if (!isSearchOpen) {
                    // Close other panels when opening search
                    setIsNotificationsOpen(false);
                    setIsProfileOpen(false);
                    window.dispatchEvent(new CustomEvent('closeChatbot'));
                  } else {
                    setSearchResults([]);
                    setSearchQuery("");
                  }
                  setIsSearchOpen(!isSearchOpen);
                }}
                className="z-10 transition-transform hover:scale-110 hover:text-primary flex-shrink-0"
                aria-label="Toggle search"
              >
                <Search size={22} />
              </button>
            </div>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  if (!isNotificationsOpen) {
                    // Close other panels when opening notifications
                    setIsSearchOpen(false);
                    setIsProfileOpen(false);
                    setSearchResults([]);
                    setSearchQuery("");
                    window.dispatchEvent(new CustomEvent('closeChatbot'));
                  }
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative transition-transform hover:scale-110 hover:text-primary flex items-center justify-center p-1" 
                aria-label="Notifications"
              >
                <Bell size={20} className="md:w-[22px] md:h-[22px]" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-1 ring-black md:h-2.5 md:w-2.5"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-[60px] md:top-full md:mt-4 w-auto md:w-80 origin-top-right overflow-hidden rounded-2xl bg-zinc-900/95 md:bg-zinc-900 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 z-[60]"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                      <button className="text-[10px] font-bold text-primary hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`flex gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5 ${!notif.read ? 'bg-primary/5' : ''}`}>
                          <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${!notif.read ? 'bg-primary' : 'bg-zinc-600'}`} />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                            <p className="mt-1 text-xs font-medium text-zinc-400 break-words">{notif.message}</p>
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    if (!isProfileOpen) {
                      // Close other panels when opening profile
                      setIsSearchOpen(false);
                      setIsNotificationsOpen(false);
                      setSearchResults([]);
                      setSearchQuery("");
                      window.dispatchEvent(new CustomEvent('closeChatbot'));
                    }
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="hidden md:flex flex-col items-end mr-1">
                      <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Ayubowan,</span>
                      <span className="text-xs font-bold text-white max-w-[100px] truncate">
                        {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                      </span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10 transition-all hover:ring-primary">
                    {user.user_metadata?.avatar_url ? (
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="User" 
                        width={40} 
                        height={40} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <ChevronDown size={14} className={`hidden lg:block text-zinc-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 origin-top-right overflow-hidden rounded-xl bg-zinc-900 p-2 shadow-2xl ring-1 ring-white/10 z-50"
                    >
                      <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Account
                      </div>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        Profile Settings
                      </Link>
                      <Link 
                        href="/my-list" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        My List
                      </Link>
                      {user?.email === "admin@gmail.com" && (
                        <Link 
                          href="/admin/dashboard" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden md:block rounded-full bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95 cinematic-glow"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Search Overlay - Appears below navbar when search is open */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSearchOpen(false);
                setSearchResults([]);
                setSearchQuery("");
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
              style={{ top: '80px' }}
            />
            
            {/* Search Container */}
            <motion.div
              ref={searchContainerRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 md:inset-auto md:right-12 md:top-20 z-[60] md:w-96"
            >
              <div className="h-full md:h-auto bg-black md:bg-zinc-900/95 md:backdrop-blur-xl md:rounded-2xl shadow-2xl md:ring-1 md:ring-white/10 overflow-hidden flex flex-col">
                
                {/* Mobile Search Header */}
                <div className="flex md:hidden items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Play size={16} fill="white" className="text-white ml-0.5" />
                    </div>
                    <span className="font-display text-xl font-black tracking-tighter text-white">
                      SEARCH
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4 md:p-4 border-b border-white/10">
                  <div className="relative flex items-center">
                    <Search size={20} className="absolute left-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search movies, TV shows..."
                      value={searchQuery}
                      onChange={onSearchInput}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          router.push(searchQuery ? `/?s=${encodeURIComponent(searchQuery)}` : "/");
                          setIsSearchOpen(false);
                          setSearchResults([]);
                          setSearchQuery("");
                        } else if (e.key === "Escape") {
                          setIsSearchOpen(false);
                          setSearchResults([]);
                          setSearchQuery("");
                        }
                      }}
                      className="w-full h-12 rounded-xl bg-white/10 pl-12 pr-12 text-base md:text-sm font-medium text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/20 transition-all focus:bg-white/15 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className={`absolute right-4 text-zinc-400 hover:text-white transition-colors ${!searchQuery && 'hidden md:block'}`}
                      aria-label="Clear search"
                    >
                      <X size={20} className="hidden md:block" />
                      {searchQuery && <span className="md:hidden text-xs font-bold text-primary">Clear</span>}
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <InlineSpinner />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            href={result.type === "TV Show" ? `/tv-shows/${slugify(result.title)}` : 
                                  result.type === "Korean Drama" ? `/korean-dramas/${slugify(result.title)}` : 
                                  `/movies/${slugify(result.title)}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchResults([]);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-4 border-b border-white/5 p-4 transition-colors hover:bg-white/10"
                          >
                            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                              <Image 
                                src={result.image || result.image_url} 
                                alt={result.title} 
                                fill 
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="truncate font-bold text-white text-base">{result.title}</h4>
                              <p className="text-xs text-zinc-400 mt-1">{result.type || "Movie"} • {result.year || "N/A"}</p>
                            </div>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            router.push(`/?s=${encodeURIComponent(searchQuery)}`);
                            setIsSearchOpen(false);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="w-full bg-white/5 py-3 text-center text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/10 transition-colors"
                        >
                          View All Results
                        </button>
                      </>
                    ) : (
                      <div className="py-8 px-4 text-center text-zinc-500">
                        <p className="text-sm font-medium">No results found for &ldquo;{searchQuery}&rdquo;</p>
                        <p className="text-xs mt-2 text-zinc-600">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Menu</p>
                    <nav className="flex flex-col space-y-1">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">Home</Link>
                      
                      {/* Mobile Categories Expandable */}
                      <div>
                        <button 
                          onClick={() => setMobileExpanded(mobileExpanded === 'categories' ? null : 'categories')}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Categories <ChevronDown size={14} className={`transition-transform ${mobileExpanded === 'categories' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === 'categories' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/5 px-4 rounded-b-xl">
                              {["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Documentary"].map(cat => (
                                <Link key={cat} href={`/category/${slugify(cat)}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-zinc-400 hover:text-white border-b border-white/5 last:border-0">{cat}</Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Mobile Languages Expandable */}
                      <div>
                        <button 
                          onClick={() => setMobileExpanded(mobileExpanded === 'languages' ? null : 'languages')}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Languages <ChevronDown size={14} className={`transition-transform ${mobileExpanded === 'languages' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === 'languages' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/5 px-4 rounded-b-xl">
                              {["Sinhala", "Tamil", "English", "Hindi", "Korean", "Malayalam", "Telugu"].map(lang => (
                                <Link key={lang} href={`/language/${slugify(lang)}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-zinc-400 hover:text-white border-b border-white/5 last:border-0">{lang}</Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link href="/movies" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">Movies</Link>
                      <Link href="/tv-shows" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">TV Shows</Link>
                      <Link href="/korean-dramas" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">Korean Dramas</Link>
                      <Link href="/upcoming" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">Upcoming</Link>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">Contact</Link>
                      <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">About</Link>
                      {user && (
                        <>
                          <Link
                            href="/my-list"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            My List
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            Profile
                          </Link>
                          {user?.email === "admin@gmail.com" && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="rounded-xl px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-white/5 hover:text-white"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </>
                      )}
                    </nav>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-6 right-6 space-y-3">
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-4 text-sm font-black uppercase tracking-widest text-primary transition-all hover:bg-white/10 active:scale-95"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
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
