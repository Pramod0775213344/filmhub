"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Play, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { InlineSpinner } from "@/components/LoadingSpinner";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { slugify } from "@/utils/slugify";
import CinematicButton from "@/components/CinematicButton";
import { isAdmin } from "@/utils/security";

import { createPortal } from "react-dom";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
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
      // Use requestAnimationFrame for performance
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        // Simple toggle for background style
        setIsScrolled(currentScrollY > 50);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Arrival", message: "Inception is now available in 4K!", time: "2m ago", read: false },
    { id: 2, title: "System Update", message: "We've updated our player for better performance.", time: "1h ago", read: false },
    { id: 3, title: "Trending", message: "Everyone is watching 'Dune: Part Two'.", time: "5h ago", read: true },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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
      setUser(null); // Clear local state immediately
      router.push("/");
      router.refresh(); // Force server components to re-render
      
      // Secondary check to ensure session is cleared
      if (typeof window !== 'undefined') {
        window.location.href = '/'; // Hard redirect if push doesn't clear state
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out will-change-transform ${
          isScrolled 
            ? "border-b border-white/5 bg-black/80 shadow-lg backdrop-blur-xl py-3 px-4 md:px-8"
            : "bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4 md:py-6 px-4 md:px-12 border-b border-white/0"
        }`}
      >
        <div className={`flex items-center justify-between ${!isScrolled && "container-custom mx-auto"}`}>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-white hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2 md:gap-3">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <Play size={16} fill="white" className="text-white ml-0.5 md:w-5 md:h-5" />
              </div>
              <span className="font-display text-xl md:text-2xl font-black tracking-tighter text-white">
                FILM<span className="text-primary">HUB</span>
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-grow justify-center">
             <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                {[
                  { name: "Home", path: "/" },
                  { name: "Movies", path: "/movies" },
                  { name: "Series", path: "/tv-shows" },
                  { name: "K-Drama", path: "/korean-dramas" },
                  { name: "Upcoming", path: "/upcoming" },
                ].map((link) => (
                  <Link 
                    key={link.path}
                    href={link.path}
                    className="relative px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-white"
                  >
                    {pathname === link.path && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                ))}

                {/* Categories Dropdown Trigger */}
                <div 
                  className="relative group px-5 py-2 cursor-pointer"
                  onMouseEnter={() => setHoveredTab("categories")}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                   <span className="relative z-10 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                      Categories <ChevronDown size={12} />
                   </span>
                   {/* Dropdown Content */}
                    <AnimatePresence>
                      {hoveredTab === "categories" && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-72 rounded-3xl bg-[#0a0a0a] border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-2 gap-2 z-50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                          {["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Documentary"].map((cat) => (
                            <Link 
                              key={cat} 
                              href={`/category/${slugify(cat)}`}
                              className="relative flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5"
                            >
                              {cat}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>

                {/* Languages Dropdown Trigger */}
                <div 
                  className="relative group px-5 py-2 cursor-pointer"
                  onMouseEnter={() => setHoveredTab("languages")}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                   <span className="relative z-10 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                      Languages <ChevronDown size={12} />
                   </span>
                   {/* Dropdown Content */}
                    <AnimatePresence>
                      {hoveredTab === "languages" && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-56 rounded-3xl bg-[#0a0a0a] border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-1 gap-2 z-50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                          {["Sinhala", "Tamil", "English", "Hindi", "Korean", "Malayalam", "Telugu"].map((lang) => (
                            <Link 
                              key={lang} 
                              href={`/language/${slugify(lang)}`}
                              className="relative flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5"
                            >
                              {lang}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
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
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => toggleRead(notif.id)}
                            className={`flex gap-3 border-b border-white/5 p-4 transition-colors cursor-pointer hover:bg-white/5 ${!notif.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${!notif.read ? 'bg-primary' : 'bg-zinc-600'}`} />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                              <p className="mt-1 text-xs font-medium text-zinc-400 break-words">{notif.message}</p>
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-zinc-600">{notif.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-zinc-500 font-medium text-sm">
                          No new notifications
                        </div>
                      )}
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
                      {isAdmin(user) && (
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
              <CinematicButton 
                href="/login"
                variant="primary"
                className="hidden md:flex h-10 px-6 py-0 text-[10px]"
              >
                Sign
              </CinematicButton>
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
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" /> Home
                      </Link>
                      
                      {/* Mobile Categories Expandable */}
                      <div>
                        <button 
                          onClick={() => setMobileExpanded(mobileExpanded === 'categories' ? null : 'categories')}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Categories
                          </span>
                          <ChevronDown size={14} className={`transition-transform ${mobileExpanded === 'categories' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === 'categories' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/5 mx-2 mb-2 rounded-2xl">
                              <div className="grid grid-cols-2 gap-px bg-white/5">
                                {["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Documentary"].map(cat => (
                                  <Link key={cat} href={`/category/${slugify(cat)}`} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-[11px] font-bold text-zinc-400 hover:text-white bg-black/40 text-center uppercase tracking-wider">{cat}</Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Mobile Languages Expandable */}
                      <div>
                        <button 
                          onClick={() => setMobileExpanded(mobileExpanded === 'languages' ? null : 'languages')}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Languages
                          </span>
                          <ChevronDown size={14} className={`transition-transform ${mobileExpanded === 'languages' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === 'languages' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/5 mx-2 mb-2 rounded-2xl">
                              <div className="grid grid-cols-2 gap-px bg-white/5">
                                {["Sinhala", "Tamil", "English", "Hindi", "Korean", "Malayalam", "Telugu"].map(lang => (
                                  <Link key={lang} href={`/language/${slugify(lang)}`} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-[11px] font-bold text-zinc-400 hover:text-white bg-black/40 text-center uppercase tracking-wider">{lang}</Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link href="/movies" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Movies
                      </Link>
                      <Link href="/tv-shows" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> TV Shows
                      </Link>
                      <Link href="/korean-dramas" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Korean Dramas
                      </Link>
                      <Link href="/upcoming" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Upcoming
                      </Link>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Contact
                      </Link>
                      <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" /> About
                      </Link>
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
                          {isAdmin(user) && (
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
                    <CinematicButton 
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      className="w-full"
                    >
                      Sign In
                    </CinematicButton>
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
